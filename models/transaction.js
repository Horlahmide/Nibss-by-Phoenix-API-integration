import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },

    externalTransactionId: {
      type: String,
      required: true,
      unique: true,
    },

    type: {
      type: String,
      enum: ["TRANSFER"],
      required: true,
    },

    direction: {
      type: String,
      enum: ["DEBIT", "CREDIT"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },

    recipientAccountNumber: {
      type: String,
    },

    recipientAccountName: {
      type: String,
    },

    recipientBank: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const Transaction = mongoose.model("Transaction", transactionSchema);
