import { transferSchema } from "../lib/validation.js";
import { Customer } from "../models/customer.js";
import { Transaction } from "../models/transaction.js";
import { getNibbsToken } from "../lib/nibbsTokenStore.js";

export const initiateTransfer = async (req, res) => {
  try {
    const validationResult = transferSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: validationResult.error.flatten().fieldErrors,
      });
    }

    const { from, to, amount } = validationResult.data;

    const nibbsBaseUrl =
      process.env.NIBBS_BASE_URL || "https://nibssbyphoenix.onrender.com";
    const nibbsToken = getNibbsToken();

    if (!nibbsToken) {
      return res.status(401).json({
        success: false,
        message: "NIBSS token not set. Fintech must log in first.",
      });
    }

    const customer = await Customer.findById(req.user.id).populate("account");
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (customer.account.accountNumber !== from) {
      return res.status(403).json({
        success: false,
        message: "You can only transfer from your own account",
      });
    }

    // Step 1: Name Enquiry for recipient
    const nameEnquiryResponse = await fetch(
      `${nibbsBaseUrl}/api/account/name-enquiry/${to}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: nibbsToken,
        },
      },
    );

    const nameEnquiryData = await nameEnquiryResponse.json();

    if (!nameEnquiryResponse.ok) {
      return res.status(nameEnquiryResponse.status).json({
        success: false,
        message: nameEnquiryData.message || "Failed to verify recipient account",
        error: nameEnquiryData,
      });
    }

    // Step 2: Check sender balance
    const balanceResponse = await fetch(
      `${nibbsBaseUrl}/api/account/balance/${from}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: nibbsToken,
        },
      },
    );

    const balanceData = await balanceResponse.json();

    if (!balanceResponse.ok) {
      return res.status(balanceResponse.status).json({
        success: false,
        message: balanceData.message || "Failed to verify sender balance",
        error: balanceData,
      });
    }

    // Step 3: Check sufficient balance
    if (balanceData.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
        error: `Insufficient balance. Available: ${balanceData.balance}`,
      });
    }

    // Step 4: Initiate transfer
    const transferResponse = await fetch(`${nibbsBaseUrl}/api/transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: nibbsToken,
      },
      body: JSON.stringify({ from, to, amount }),
    });

    const transferData = await transferResponse.json();

    if (!transferResponse.ok) {
      return res.status(transferResponse.status).json({
        success: false,
        message: transferData.message || "Transfer failed",
        error: transferData,
      });
    }

    // Step 5: Confirm transaction status via TSQ
    const tsqResponse = await fetch(
      `${nibbsBaseUrl}/api/transaction/${transferData.transactionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: nibbsToken,
        },
      },
    );

    const tsqData = await tsqResponse.json();

    // Step 6: Store transaction in MongoDB
    await Transaction.create({
      account: customer.account._id,
      externalTransactionId: transferData.transactionId,
      type: "TRANSFER",
      direction: "DEBIT",
      amount,
      status: tsqData.status || "SUCCESS",
      recipientAccountNumber: to,
      recipientAccountName: nameEnquiryData.accountName,
      recipientBank: nameEnquiryData.bankName,
    });

    return res.status(200).json({
      success: true,
      message: "Transfer successful",
      data: transferData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
