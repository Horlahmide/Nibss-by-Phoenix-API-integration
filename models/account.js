import mongoose from "mongoose";

const accountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
      unique: true,
    },

    accountName: {
      type: String,
      required: true,
      trim: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Account = mongoose.model("Account", accountSchema);
