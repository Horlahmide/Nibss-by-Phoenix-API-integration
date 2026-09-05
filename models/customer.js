import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    onboardingStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED"],
      default: "PENDING",
    },

    verificationType: {
      type: String,
      enum: ["BVN", "NIN"],
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Customer = mongoose.model("Customer", customerSchema);
