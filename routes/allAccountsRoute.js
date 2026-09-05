import express from "express";
import { allAccounts } from "../controllers/allAccounts.js";

const router = express.Router();

router.get("/all", allAccounts);

export default router;
