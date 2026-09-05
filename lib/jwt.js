import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_default_jwt_secret_key";

/**
 * Generate a JSON Web Token
 * @param {Object} payload - Data to embed in the token
 * @param {string|number} expiresIn - Expiration time (e.g. '1d', '2h', '3600s')
 * @returns {string} Signed JWT token
 */
export const generateToken = (payload, expiresIn = "1d") => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Sign a JWT specifically for a Customer
 * @param {Object} customer - Customer document
 * @param {string} expiresIn - Expiration duration (default '1d')
 * @returns {string} Signed JWT token
 */
export const signCustomerToken = (customer, expiresIn = "1d") => {
  const payload = {
    id: customer._id,
    email: customer.email,
    firstName: customer.firstName,
    lastName: customer.lastName,
  };
  return generateToken(payload, expiresIn);
};

/**
 * Verify and decode a JSON Web Token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export default {
  generateToken,
  signCustomerToken,
  verifyToken,
};
