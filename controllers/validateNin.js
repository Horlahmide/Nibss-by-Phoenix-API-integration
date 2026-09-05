import { validateNinSchema } from "../lib/validation.js";
import { getNibbsToken } from "../lib/nibbsTokenStore.js";

export const validateNin = async (req, res) => {
  try {
    const validationResult = validateNinSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: validationResult.error.flatten().fieldErrors,
      });
    }

    const { nin } = validationResult.data;

    const nibbsBaseUrl =
      process.env.NIBBS_BASE_URL || "https://nibssbyphoenix.onrender.com";
    const nibssToken = getNibbsToken();

    if (!nibssToken) {
      return res.status(401).json({
        success: false,
        message: "NIBSS token not set. Fintech must log in first.",
      });
    }

    const response = await fetch(`${nibbsBaseUrl}/api/validateNin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: nibssToken,
      },
      body: JSON.stringify({ nin }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.message || "Failed to validate NIN",
        error: data,
      });
    }

    return res.status(200).json({
      success: true,
      message: "NIN validated successfully",
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
