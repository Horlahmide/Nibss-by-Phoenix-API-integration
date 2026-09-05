import express from "express";
import { getAccountBalance } from "../controllers/getAccountBalance.js";
const router = express.Router();

router.get("/balance/:accountNumber", getAccountBalance);

export default router;
