import { fintechOnboardingSchema } from "../lib/validation.js";

export const fintechOnboarding = async (req, res) => {
  try {
    // 1. Validate request body from frontend using Zod
    const validationResult = fintechOnboardingSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const { name, email } = validationResult.data;

    // 2. Call external NIBSS Onboarding API endpoint
    const nibssBaseUrl = process.env.NIBSS_BASE_URL || "https://nibssbyphoenix.onrender.com";

    const response = await fetch(`${nibssBaseUrl}/api/fintech/onboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.message || "Failed to onboard fintech with NIBSS",
        error: data,
      });
    }

    // 3. Return NIBSS response (apiKey, apiSecret, bankCode, bankName) to frontend
    return res.status(201).json({
      success: true,
      message: "Fintech onboarded successfully on NIBSS",
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
