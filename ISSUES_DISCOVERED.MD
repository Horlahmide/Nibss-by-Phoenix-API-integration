### Customer Registration and BVN Validation Issue

I noticed a potential issue with the customer registration flow.

For example, suppose a customer attempts to register but does not yet have a valid BVN. During registration, our backend sends the BVN to the external NIBSS API for validation. If the BVN is invalid or does not exist, the external API returns a response such as **"BVN NOT FOUND."**

However, despite receiving this failure response, the customer has already been saved to our application database.

This creates an inconsistent state in our system:

1. The customer submits their registration details with an invalid or non-existent BVN.
2. Our backend creates and saves the customer in our database.
3. The BVN validation request to NIBSS fails with **"BVN NOT FOUND."**
4. The registration endpoint returns the failure response to the user.
5. Later, the customer obtains a valid BVN and tries to register again using the same email address.
6. Our application-level authentication/validation now detects that the email already exists in our database and returns something like **"User with this email already exists."**
7. The customer is therefore unable to complete registration, even though their original registration attempt was unsuccessful.

### The Core Problem

The issue is that **customer creation in our database is happening before the entire registration process has successfully completed**.

A failed registration attempt should not leave behind a customer record that prevents the customer from retrying the registration.

Ideally, the registration flow should validate all required external information, including the BVN, **before permanently creating the customer record**.

Alternatively, if the customer record must be created before the BVN validation is completed, the system should have a mechanism for handling incomplete or failed registrations—for example, using a `PENDING` registration status or rolling back the database operation when BVN validation fails.

The key principle is:

> **A failed registration should not leave the system in a state that prevents the customer from successfully registering later.**

and also i noticed when i create bvn first before proceedind to register, i got this error:

{
"success": false,
"message": "Internal Server Error",
"error": "Account validation failed: accountNumber: Path `accountNumber` is required."
}

and i also noticed that it affected by login endpoit because if i have not registered i can not login and if i can not logig i cannot generate the jwt token my fronted needs for backend authetication and if my backend can't authenticate users well they will not be able to reach nibbs to be able tp perfom its services for them.

### Transfer Fails with "externalTransactionId is required" Error

**Issue:** Initiating a transfer returned:
```
Transaction validation failed: externalTransactionId: Path `externalTransactionId` is required.
```

**Root cause:** The code in `controllers/initiateTransfer.js` read the transaction ID from
`transferData.transactionId`, but the NIBSS `/api/transfer` response actually returns the ID
in the `reference` field (e.g. `{ "reference": "TX1788647723228", "status": "SUCCESS", ... }`).
So `transferData.transactionId` was `undefined`, which caused the required
`externalTransactionId` field in `models/transaction.js` to fail validation during the
MongoDB write. This also made the TSQ step call `/api/transaction/undefined`.

**Fix:** `controllers/initiateTransfer.js` now:
1. Reads the ID from `transferData.reference` first, with fallbacks to `transactionId` and `_id`.
2. Checks the transfer `status` (not just the HTTP code) and stops early if it is not `SUCCESS`.
3. Returns a clear `502` if NIBSS gives no reference at all.
4. Makes the TSQ confirmation safe so a failing TSQ call no longer crashes the request.

**Result:** Transfers now save correctly to MongoDB using the real NIBSS reference, and
failed transfers return clear error messages instead of the confusing database error.
For reference: see `TRANSFER_FIX_NOTES.md` for the full explanation and code.
