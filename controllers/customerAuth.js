import bcrypt from "bcryptjs";
import { customerRegisterSchema, customerLoginSchema } from "../lib/validation.js";
import { Customer } from "../models/customer.js";
import { Account } from "../models/account.js";
import { signCustomerToken } from "../lib/jwt.js";
import { getNibbsToken } from "../lib/nibbsTokenStore.js";

export const registerCustomer = async (req, res) => {
  let createdCustomerId = null;
  let createdAccountId = null;

  try {
    const validationResult = customerRegisterSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: validationResult.error.flatten().fieldErrors,
      });
    }

    const { firstName, lastName, email, password, kycType, kycID, dob } =
      validationResult.data;

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      if (
        existingCustomer.onboardingStatus === "VERIFIED" &&
        existingCustomer.account
      ) {
        return res.status(409).json({
          success: false,
          message: "Customer with this email already exists",
        });
      }
      // Clean up stale or pending record from a prior incomplete attempt
      await Customer.findByIdAndDelete(existingCustomer._id);
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

    // Step 1: Call NIBSS account creation FIRST before saving anything to the local database.
    // If external validation fails (e.g., BVN not found or DOB mismatch), no records are saved in MongoDB.
    const accountResponse = await fetch(`${nibbsBaseUrl}/api/account/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: nibbsToken,
      },
      body: JSON.stringify({ kycType, kycID, dob }),
    });

    const accountData = await accountResponse.json();

    if (!accountResponse.ok) {
      return res.status(accountResponse.status).json({
        success: false,
        message: accountData.message || "Failed to create account on NIBSS",
        error: accountData,
      });
    }

    // Extract accountNumber safely from NIBSS response shape: { message, account: { accountNumber, ... } }
    const accountNumber =
      accountData.account?.accountNumber || accountData.accountNumber;
    const accountName =
      accountData.account?.accountName || `${firstName} ${lastName}`;

    if (!accountNumber) {
      return res.status(502).json({
        success: false,
        message: "Invalid response from NIBSS: missing account number",
        error: accountData,
      });
    }

    // Step 2: Now that external validation and account creation succeeded on NIBSS, persist locally.
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const customer = await Customer.create({
      firstName,
      lastName,
      email,
      passwordHash,
      onboardingStatus: "VERIFIED",
      verificationType: kycType.toUpperCase(),
    });
    createdCustomerId = customer._id;

    const localAccount = await Account.create({
      accountNumber,
      accountName,
      customer: customer._id,
    });
    createdAccountId = localAccount._id;

    customer.account = localAccount._id;
    await customer.save();

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      data: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        accountNumber: localAccount.accountNumber,
        onboardingStatus: customer.onboardingStatus,
      },
    });
  } catch (error) {
    // Rollback any partially created local documents if an unexpected error occurs
    if (createdAccountId) {
      await Account.findByIdAndDelete(createdAccountId).catch(() => {});
    }
    if (createdCustomerId) {
      await Customer.findByIdAndDelete(createdCustomerId).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const validationResult = customerLoginSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: validationResult.error.flatten().fieldErrors,
      });
    }

    const { email, password } = validationResult.data;

    const customer = await Customer.findOne({ email }).populate("account");
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (customer.onboardingStatus !== "VERIFIED" || !customer.account) {
      return res.status(403).json({
        success: false,
        message: "Customer onboarding is incomplete. Please register again.",
      });
    }

    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signCustomerToken(customer);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      customer: {
        id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        accountNumber: customer.account.accountNumber,
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
