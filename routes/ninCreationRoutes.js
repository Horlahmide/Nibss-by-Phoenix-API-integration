import express from "express";
import { createNin } from "../controllers/ninCreation.js";

const router = express.Router();

router.post("/insertNin", createNin);

export default router;
