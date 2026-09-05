import express from "express";
import { fintechOnboarding } from "../controllers/fintechOnboarding.js";

const router = express.Router();

router.post("/onboard", fintechOnboarding);

export default router;
