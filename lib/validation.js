import { z } from "zod";

/**
 * Zod Schema for Fintech Onboarding (POST /api/fintech/onboard)
 */
export const fintechOnboardingSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name cannot be empty")
    .trim(),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address format")
    .trim()
    .toLowerCase(),
});

/**
 * Zod Schema for Fintech Login (POST /api/auth/token)
 */
export const loginSchema = z.object({
  apiKey: z
    .string({ required_error: "API Key is required" })
    .min(1, "API Key cannot be empty")
    .trim(),
  apiSecret: z
    .string({ required_error: "API Secret is required" })
    .min(1, "API Secret cannot be empty")
    .trim(),
});

/**
 * Zod Schema for Customer Account Creation (POST /api/account/create)
 */
export const createAccountSchema = z.object({
  kycType: z
    .string({ required_error: "kycType is required" })
    .transform((val) => val.toLowerCase())
    .refine((val) => ["bvn", "nin"].includes(val), {
      message: "kycType must be either 'bvn' or 'nin'",
    }),
  kycID: z
    .string({ required_error: "kycID is required" })
    .regex(/^\d{11}$/, "kycID must be an 11-digit BVN or NIN number")
    .trim(),
  dob: z
    .string({ required_error: "dob is required" })
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "dob must be in YYYY-MM-DD format (e.g., 2005-04-04)",
    )
    .trim(),
});

/**
 * Zod Schema for BVN Creation (POST /api/insertBvn)
 */
export const createBvnSchema = z.object({
  bvn: z
    .string({ required_error: "bvn is required" })
    .regex(/^\d{11}$/, "BVN must be an 11-digit number")
    .trim(),
  firstName: z
    .string({ required_error: "firstName is required" })
    .min(1, "firstName cannot be empty")
    .trim(),
  lastName: z
    .string({ required_error: "lastName is required" })
    .min(1, "lastName cannot be empty")
    .trim(),
  dob: z
    .string({ required_error: "dob is required" })
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "dob must be in YYYY-MM-DD format (e.g., 2005-04-04)",
    )
    .trim(),
  phone: z
    .string({ required_error: "phone is required" })
    .min(10, "phone must be a valid phone number")
    .trim(),
});

/**
 * Zod Schema for NIN Creation (POST /api/insertBvn)
 */
export const createNinSchema = z.object({
  nin: z
    .string({ required_error: "nin is required" })
    .regex(/^\d{11}$/, "NIN must be an 11-digit number")
    .trim(),
  firstName: z
    .string({ required_error: "firstName is required" })
    .min(1, "firstName cannot be empty")
    .trim(),
  lastName: z
    .string({ required_error: "lastName is required" })
    .min(1, "lastName cannot be empty")
    .trim(),
  dob: z
    .string({ required_error: "dob is required" })
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "dob must be in YYYY-MM-DD format (e.g., 2005-04-04)",
    )
    .trim(),
});

/**
 * Zod Schema for Fund Transfer (POST /api/transfer)
 */
export const transferSchema = z.object({
  from: z.string().length(10, "Sender account number must be 10 digits"),
  to: z.string().length(10, "Recipient account number must be 10 digits"),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than 0"),
});

// Zod Schema for Transaction Query Status using TRANSCATION ID

export const tsqSchema = z.object({
  transactionId: z
    .string({ required_error: "Transaction id is required" })
    .min(1, "Transaction id cannot be empty")
    .trim(),
});

/**
 * Zod Schema for BVN Validation (POST /api/validateBvn)
 */
export const validateBvnSchema = z.object({
  bvn: z
    .string({ required_error: "bvn is required" })
    .regex(/^\d{11}$/, "BVN must be an 11-digit number")
    .trim(),
});

/**
 * Zod Schema for NIN Validation (POST /api/validateNin)
 */
export const validateNinSchema = z.object({
  nin: z
    .string({ required_error: "nin is required" })
    .regex(/^\d{11}$/, "NIN must be an 11-digit number")
    .trim(),
});

/**
 * Zod Schema for Customer Registration (POST /api/customers/register)
 */
export const customerRegisterSchema = z.object({
  firstName: z
    .string({ required_error: "firstName is required" })
    .min(1, "firstName cannot be empty")
    .trim(),
  lastName: z
    .string({ required_error: "lastName is required" })
    .min(1, "lastName cannot be empty")
    .trim(),
  email: z
    .string({ required_error: "email is required" })
    .email("Invalid email address format")
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: "password is required" })
    .min(6, "Password must be at least 6 characters"),
  kycType: z
    .string({ required_error: "kycType is required" })
    .transform((val) => val.toLowerCase())
    .refine((val) => ["bvn", "nin"].includes(val), {
      message: "kycType must be either 'bvn' or 'nin'",
    }),
  kycID: z
    .string({ required_error: "kycID is required" })
    .regex(/^\d{11}$/, "kycID must be an 11-digit BVN or NIN number")
    .trim(),
  dob: z
    .string({ required_error: "dob is required" })
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "dob must be in YYYY-MM-DD format (e.g., 2005-04-04)",
    )
    .trim(),
});

/**
 * Zod Schema for Customer Login (POST /api/customers/login)
 */
export const customerLoginSchema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .email("Invalid email address format")
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: "password is required" })
    .min(1, "password cannot be empty"),
});

export default {
  fintechOnboardingSchema,
  loginSchema,
  createAccountSchema,
  createBvnSchema,
  createNinSchema,
  validateBvnSchema,
  validateNinSchema,
  customerRegisterSchema,
  customerLoginSchema,
  transferSchema,
  tsqSchema,
};
