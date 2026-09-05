import { getNibbsToken } from "../lib/nibbsTokenStore.js";

export const nameEnquiry = async (req, res) => {
  try {
    const { accountNumber } = req.body;

    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        message: "Invalid account number",
      });
    }

    // call NIBSS account name enquiry endpoint
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
      `${nibbsBaseUrl}/api/account/name-enquiry/${accountNumber}`,
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
        message: data.message || "Failed to get account details",
        error: data,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Account details retrieved successfully",
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
