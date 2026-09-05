import { createBvnSchema } from "../lib/validation.js";

export const createBvn = async (req, res) => {
  try {
    const validationResult = createBvnSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        error: validationResult.error.flatten().fieldErrors,
      });
    }

    const { bvn, firstName, lastName, dob, phone } = validationResult.data;

    //call external NIBSS account creation endpoint
    const nibbsBaseUrl =
      process.env.NIBBS_BASE_URL || "https://nibssbyphoenix.onrender.com";
    const response = await fetch(`${nibbsBaseUrl}/api/insertBvn`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bvn, firstName, lastName, dob, phone }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.message || "Failed to create bvn",
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
