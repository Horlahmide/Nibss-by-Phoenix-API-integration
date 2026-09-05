import { createNinSchema } from "../lib/validation.js";

export const createNin = async (req, res) => {
  try {
    const validationResult = createNinSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: validationResult.error.flatten().fieldErrors,
      });
    }

    const { nin, firstName, lastName, dob } = validationResult.data;

    //call external NIBSS account creation endpoint
    const nibbsBaseUrl =
      process.env.NIBBS_BASE_URL || "https://nibssbyphoenix.onrender.com";
    const response = await fetch(`${nibbsBaseUrl}/api/insertNin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nin, firstName, lastName, dob }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.message || "Failed to create nin",
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
