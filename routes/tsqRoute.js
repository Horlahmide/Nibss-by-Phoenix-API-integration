import express from "express";
const router = express.Router();
import { transactionStatusQuery } from "../controllers/tsq.js";

router.get("/query", transactionStatusQuery);

export default router;
