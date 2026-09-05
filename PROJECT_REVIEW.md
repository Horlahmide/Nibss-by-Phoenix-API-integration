# NIBBS by Phoenix — Project Review

## What This Project Does

A proxy server that sits between your frontend and the real NIBSS API (`nibssbyphoenix.onrender.com`). It validates requests with Zod, then forwards them to NIBSS.

---

## The Bug That Was Fixed

### Error Message
```
"Cannot read properties of undefined (reading 'status')"
```

### What Was Wrong

`initiateTransfer.js` was calling `nameEnquiry()` and `getAccountBalance()` as regular functions, but they are Express route handlers that need `(req, res)`. Since no `res` was passed, the code crashed when trying to call `res.status()`.

**3 bugs were stacked together:**

| Bug | Line | Problem |
|-----|------|---------|
| 1 | 20-22 | `nameEnquiry({ body })` — no `res` passed, crashes on `res.status()` |
| 2 | 32-34 | `getAccountBalance({ body })` — same crash |
| 3 | 46 | `identityVerificationResult.data.accounts[0].balance` — wrong response shape (should be `.account.balance`) |

### The Fix

Removed the imports of `nameEnquiry` and `getAccountBalance`. Instead, the transfer controller now makes the NIBSS API calls directly (same pattern used by every other controller).

**New flow in `initiateTransfer.js`:**
1. Validate body with Zod
2. `GET /api/account/name-enquiry/{recipient}` — verify recipient exists
3. `GET /api/account/balance/{sender}` — check sender balance
4. `POST /api/transfer` — execute transfer

All three calls now properly forward `req.headers.authorization` to NIBSS.

---

## Project Structure

```
NIBBS SOFTWARE/
├── app.js                    # Entry point, mounts all routes
├── config/db.js              # MongoDB connection
├── controllers/              # Business logic (proxies to NIBSS API)
├── lib/jwt.js                # JWT sign/verify utilities
├── lib/validation.js         # Zod schemas for all endpoints
├── middleware/auth.js         # JWT auth middleware (unused)
├── models/                   # Mongoose models (unused)
└── routes/                   # Express route definitions
```

---

## Route Map

| Method | Your Endpoint | NIBSS Endpoint | Auth |
|--------|---------------|----------------|------|
| POST | `/api/fintech/onboard` | `/api/fintech/onboard` | No |
| POST | `/api/auth/token` | `/api/auth/token` | No |
| POST | `/api/account/create` | `/api/account/create` | Yes |
| GET | `/api/name-enquiry/name-enquiry` | `/api/account/name-enquiry/{no}` | Yes |
| GET | `/api/accounts/all` | `/api/accounts` | Yes |
| GET | `/api/balance/balance` | `/api/accounts` | Yes |
| POST | `/api/transfer/transfer` | `/api/transfer` | Yes |
| POST | `/api/bvn/insertBvn` | `/api/insertBvn` | No |
| POST | `/api/bvn/validateBvn` | `/api/validateBvn` | Yes |
| POST | `/api/nin/insertNin` | `/api/insertNin` | No |
| POST | `/api/nin/validateNin` | `/api/validateNin` | Yes |

---

## Other Issues Worth Noting

### 1. Auth Middleware Is Defined But Never Used
`middleware/auth.js` exports `authenticate` but no route applies it. All endpoints are currently unprotected. If you want to protect routes, add it to your route files:
```js
import { authenticate } from "../middleware/auth.js";
router.post("/create", authenticate, createAccount);
```

### 2. GET Routes Reading `req.body`
`nameEnquiry` and `getAccountBalance` routes use `GET` but read from `req.body`. Some HTTP clients strip bodies from GET requests. Consider switching to path parameters or query strings.

### 3. MongoDB Models Exist But Are Unused
`models/account.js`, `models/customer.js`, `models/transaction.js` are defined but no controller imports them. The app has no local data persistence — everything goes to NIBSS.

### 4. `allAccounts` Returns Only First Account
The `allAccounts` controller returns `data.accounts[0]` (just the first account), not the full list.

---

## Fix Summary

| Before | After |
|--------|-------|
| Called `nameEnquiry()` and `getAccountBalance()` as helper functions | Makes NIBSS API calls directly |
| No auth token forwarded to inner calls | Token forwarded via `req.headers.authorization` |
| Wrong response shape on balance check | Uses correct `/api/account/balance/{no}` endpoint |
| 3 bugs stacked | All resolved |
