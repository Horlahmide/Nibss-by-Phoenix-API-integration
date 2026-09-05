import { getNibbsToken } from "../lib/nibbsTokenStore.js";

export const getAccountBalance = async (req, res) => {
  try {
    const { accountNumber } = req.params;

    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        message: "Account Number is required",
      });
    }

    if (accountNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Account Number must be 10 digits",
      });
    }

    const nibbsBaseUrl =
      process.env.NIBBS_BASE_URL || "https://nibssbyphoenix.onrender.com";
    const nibbsToken = getNibbsToken();

    if (!nibbsToken) {
      return res.status(401).json({
        success: false,
        message: "NIBSS token not set. Fintech must log in first.",
      });
    }

    const response = await fetch(
      `${nibbsBaseUrl}/api/account/balance/${accountNumber}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: nibbsToken,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.message || "Failed to get account balance",
        error: data,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Account balance retrieved successfully",
      account: {
        accountNumber: data.accountNumber,
        balance: data.balance,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
