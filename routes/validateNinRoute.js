import express from "express";
import { validateNin } from "../controllers/validateNin.js";

const router = express.Router();

router.post("/validateNin", validateNin);

export default router;
