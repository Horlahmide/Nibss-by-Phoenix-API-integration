import express from "express";
import { createAccount } from "../controllers/accountCreation.js";

const router = express.Router();

router.post("/create", createAccount);

export default router;
