import express from "express";
import { initiateTransfer } from "../controllers/initiateTransfer.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/transfer", authenticate, initiateTransfer);

export default router;
