import express from "express";
import { getTransactionHistory } from "../controllers/transactionHistory.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/transactions", authenticate, getTransactionHistory);

export default router;
