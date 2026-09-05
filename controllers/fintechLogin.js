import { loginSchema } from "../lib/validation.js";
import { setNibbsToken } from "../lib/nibbsTokenStore.js";

export const fintechLogin = async (req, res) => {
  try {
    // 1. Validate request body using Zod
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const { apiKey, apiSecret } = validationResult.data;

    // 2. Call external NIBSS Auth Token API endpoint
    const nibssBaseUrl = process.env.NIBSS_BASE_URL || "https://nibssbyphoenix.onrender.com";

    const response = await fetch(`${nibssBaseUrl}/api/auth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ apiKey, apiSecret }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.message || "Failed to authenticate with NIBSS",
        error: data,
      });
    }

    // 2.5 Store the NIBSS token server-side (with Bearer prefix for Authorization header)
    setNibbsToken(`Bearer ${data.token}`);

    // 3. Return NIBSS response (token, fintech details) to frontend
    return res.status(200).json({
      success: true,
      message: "Authentication successful",
      token: data.token,
      fintech: data.fintech,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default fintechLogin;
