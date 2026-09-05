import { getNibbsToken } from "../lib/nibbsTokenStore.js";

export const allAccounts = async (req, res) => {
  try {
    const nibbsBaseUrl =
      process.env.NIBBS_BASE_URL || "https://nibssbyphoenix.onrender.com";
    const nibbsToken = getNibbsToken();

    if (!nibbsToken) {
      return res.status(401).json({
        success: false,
        message: "NIBSS token not set. Fintech must log in first.",
      });
    }

    const response = await fetch(`${nibbsBaseUrl}/api/accounts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: nibbsToken,
      },
    });

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
      accounts: {
        accountNumber: data.accounts[0].accountNumber,
        accountName: data.accounts[0].accountName,
        balance: data.accounts[0].balance,
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
