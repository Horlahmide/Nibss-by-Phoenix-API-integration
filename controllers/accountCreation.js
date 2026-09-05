import { createAccountSchema } from "../lib/validation.js";
import { getNibbsToken } from "../lib/nibbsTokenStore.js";

export const createAccount = async (req, res) => {
  try {
    const validationResult = createAccountSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: validationResult.error.flatten().fieldErrors,
      });
    }

    const { kycType, kycID, dob } = validationResult.data;

    //call external NIBBS account creation endpoint
    const nibbsBaseUrl =
      process.env.NIBBS_BASE_URL || "https://nibssbyphoenix.onrender.com";

    // Use the NIBSS token stored server-side
    const nibssToken = getNibbsToken();

    if (!nibssToken) {
      return res.status(401).json({
        success: false,
        message: "NIBSS token not set. Fintech must log in first.",
      });
    }

    const response = await fetch(`${nibbsBaseUrl}/api/account/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: nibssToken, // Forward the NIBSS token to the NIBSS API
      },
      body: JSON.stringify({ kycType, kycID, dob }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.message || "Failed to create account",
        error: data,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
