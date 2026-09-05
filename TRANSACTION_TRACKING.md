# NIBBS Project — Transaction Tracking & Data Privacy

## What Was Built

This project now lets customers **register**, **log in**, make transfers, and **view only their own** transaction history.

---

## How It Works (Simple)

### 1. Fintech Logs In (Server-Side)

The backend stores the NIBSS token in memory (`lib/nibbsTokenStore.js`) so clients don't need to send it.

```
POST /api/auth/token  →  token stored in memory
```

### 2. Customer Registers

```
POST /api/customers/register
{
  firstName, lastName, email, password,
  kycType, kycID, dob
}
```

Flow:
1. Validate input (Zod)
2. Check email doesn't already exist
3. **Hash the password** (bcryptjs, 10 rounds) — never store raw password
4. Create Customer record (status: PENDING)
5. Create account on NIBSS via `/api/account/create`
6. Create local Account record (linked to customer)
7. Update customer status to VERIFIED

### 3. Customer Logs In

```
POST /api/customers/login
{ email, password }
```

Flow:
1. Validate input
2. Find customer by email
3. Compare password hash with bcrypt
4. Issue JWT `{ id, email, firstName, lastName }`

### 4. Transfer (Protected)

```
POST /api/transfer/transfer
Header: Authorization: Bearer <customer_JWT>
Body: { from, to, amount }
```

Flow:
1. `authenticate` middleware verifies the customer JWT → sets `req.user`
2. Look up customer + their linked account
3. **Check `from` matches the customer's own account** (else 403)
4. Name enquiry on recipient
5. Check sender balance
6. Check sufficient funds
7. Execute transfer on NIBSS
8. **TSQ call** to confirm status
9. **Store DEBIT transaction in MongoDB**
10. Return success

### 5. View Transaction History (Protected & Scoped)

```
GET /api/customers/transactions
Header: Authorization: Bearer <customer_JWT>
```

Flow:
1. `authenticate` verifies JWT → `req.user.id`
2. Find customer by `req.user.id`
3. Get their linked account
4. Query `Transaction.find({ account: customer.account })`
5. Return only that customer's transactions

**Privacy:** No customer can query another customer's data because the account comes from the JWT, not the request.

---

## New Files

| File | Purpose |
|------|---------|
| `lib/nibbsTokenStore.js` | Stores NIBSS token in memory |
| `controllers/customerAuth.js` | Register + Login |
| `routes/customerAuthRoutes.js` | Routes for auth |
| `controllers/transactionHistory.js` | Fetch scoped history |
| `routes/transactionHistoryRoutes.js` | Route for history |

## Modified Files

| File | Change |
|------|--------|
| `models/account.js` | Added `customer` ref |
| `controllers/fintechLogin.js` | Now stores NIBSS token |
| `controllers/initiateTransfer.js` | Uses `req.user`, ownership check, TSQ, stores transaction |
| `controllers/getAccountBalance.js` | Uses path param + server token |
| All other controllers | Use `getNibbsToken()` instead of `req.headers.authorization` |
| `controllers/tsq.js` | Fixed `validationResult` → `validateResult` bug |
| `routes/initiateTransferRoute.js` | Added `authenticate` middleware |

---

## New Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/customers/register` | No | Customer registration |
| POST | `/api/customers/login` | No | Customer login → JWT |
| GET | `/api/customers/transactions` | Yes | Own transaction history |
| POST | `/api/transfer/transfer` | Yes | Transfer (stores transaction) |
| GET | `/api/balance/balance/:accountNumber` | No | Account balance (path param) |

---

## Security Measures

| Measure | How |
|---------|-----|
| Password hashing | bcryptjs (10 salt rounds), only hash stored |
| Token separation | Customer JWT in header, NIBSS token server-side |
| Account ownership | Transfer `from` must match customer's own account |
| Data scoping | History queries use `req.user.id` → linked account only |
| JWT protection | `authenticate` middleware on protected routes |

---

## Postman Test Sequence

1. **Fintech login** (stores NIBSS token):
```
POST /api/auth/token
{ apiKey, apiSecret }
```

2. **Register customer**:
```
POST /api/customers/register
{ firstName, lastName, email, password, kycType, kycID, dob }
```

3. **Login customer**:
```
POST /api/customers/login
{ email, password }
```
→ Copy the token.

4. **Transfer**:
```
POST /api/transfer/transfer
Authorization: Bearer <customer_token>
{ from: "your_account", to: "recipient", amount: 5000 }
```

5. **View history**:
```
GET /api/customers/transactions
Authorization: Bearer <customer_token>
```
→ Only YOUR transactions.

---

## Note: NIBSS Token Lifecycle

The NIBSS token is stored **in memory** (`lib/nibbsTokenStore.js`). It expires after 1 hour. When it expires, the fintech must log in again to refresh it. Each customer does NOT need the NIBSS token — the backend handles it.

---

## Files Table

```
lib/nibbsTokenStore.js       ← NEW: server-side NIBSS token
controllers/customerAuth.js  ← NEW: register + login
routes/customerAuthRoutes.js ← NEW
controllers/transactionHistory.js ← NEW
routes/transactionHistoryRoutes.js ← NEW
```
