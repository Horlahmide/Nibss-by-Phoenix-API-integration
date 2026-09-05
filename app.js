import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/db.js";
import fintechOnboardingRoutes from "./routes/fintechOnboardingRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import accountCreationRoute from "./routes/accountCreationRoute.js";
import bvnCreationRoute from "./routes/bvnCreationRoute.js";
import nameEnquiryRoute from "./routes/nameEnquiryRoute.js";
import allAccountsRoute from "./routes/allAccountsRoute.js";
import ninCreationRoute from "./routes/ninCreationRoutes.js";
import getAccountBalance from "./routes/getAccountBalanceRoutes.js";
import initiateTransferRoute from "./routes/initiateTransferRoute.js";
import tsqRoute from "./routes/tsqRoute.js";
import validateBvnRoute from "./routes/validateBvnRoute.js";
import validateNinRoute from "./routes/validateNinRoute.js";
import customerAuthRoutes from "./routes/customerAuthRoutes.js";
import transactionHistoryRoutes from "./routes/transactionHistoryRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Mounting Routes
app.use("/api/fintech", fintechOnboardingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/account", accountCreationRoute);
app.use("/api/bvn", bvnCreationRoute);
app.use("/api/bvn", validateBvnRoute);
app.use("/api/name-enquiry", nameEnquiryRoute);
app.use("/api/accounts", allAccountsRoute);
app.use("/api/nin", ninCreationRoute);
app.use("/api/nin", validateNinRoute);
app.use("/api/balance", getAccountBalance);
app.use("/api/transfer", initiateTransferRoute);
app.use("/api/transaction", tsqRoute);
app.use("/api/customers", customerAuthRoutes);
app.use("/api/customers", transactionHistoryRoutes);
// Connecting to MongoDB
await connectDB();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
