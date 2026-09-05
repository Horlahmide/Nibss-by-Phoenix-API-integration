import express from "express";
import { createBvn } from "../controllers/bvnCreation.js";

const router = express.Router();

router.post("/insertBvn", createBvn);

export default router;
