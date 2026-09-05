import express from "express";
import { nameEnquiry } from "../controllers/nameEnquiry.js";

const router = express.Router();

router.get("/name-enquiry", nameEnquiry);

export default router;
