import { Customer } from "../models/customer.js";
import { Transaction } from "../models/transaction.js";

export const getTransactionHistory = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).populate("account");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!customer.account) {
      return res.status(404).json({
        success: false,
        message: "Customer has no linked account",
      });
    }

    const transactions = await Transaction.find({
      account: customer.account._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Transaction history retrieved successfully",
      transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
