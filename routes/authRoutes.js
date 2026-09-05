import express from "express";
import { fintechLogin } from "../controllers/fintechLogin.js";

const router = express.Router();

router.post("/token", fintechLogin);

export default router;
