import express from "express";
import { registerCustomer, loginCustomer } from "../controllers/customerAuth.js";

const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", loginCustomer);

export default router;
