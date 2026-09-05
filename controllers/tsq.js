import { tsqSchema } from "../lib/validation.js";
import { getNibbsToken } from "../lib/nibbsTokenStore.js";

export const transactionStatusQuery = async (req, res) => {
  try {
    const validateResult = tsqSchema.safeParse(req.body);

    if (!validateResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: validateResult.error.flatten().fieldErrors,
      });
    }

    const { transactionId } = validateResult.data;

    // Initiate the check by calling NIBSS API
    const nibbsBaseUrl =
      process.env.NIBBS_BASE_URL || "https://nibssbyphoenix.onrender.com";
    const nibbsToken = getNibbsToken();

    if (!nibbsToken) {
      return res.status(401).json({
        success: false,
        message: "NIBSS token not set. Fintech must log in first.",
      });
    }

    const response = await fetch(
      `${nibbsBaseUrl}/api/transaction/${transactionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: nibbsToken,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.message || "Failed to get transfer status",
        error: data,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Transfer status successfully retrieved",
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
