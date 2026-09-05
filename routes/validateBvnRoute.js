import express from "express";
import { validateBvn } from "../controllers/validateBvn.js";

const router = express.Router();

router.post("/validateBvn", validateBvn);

export default router;
