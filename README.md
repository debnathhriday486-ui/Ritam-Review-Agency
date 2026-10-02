# RITAM REVIEW AGENCY
### Premium Educational Review Task Simulator

> **IMPORTANT DISCLAIMER:**
> This application is an **Educational Review Task Simulator** for research, student practice, and analysis of customer sentiment.
> **DO NOT** connect to Google Maps or any real-world review platform.
> **DO NOT** automatically publish, submit, manipulate, or purchase real reviews.
> All map links, ratings, comments, verification workflows, and wallet balances are strictly simulated inside this application. No real UPI or banking money transfers take place.

---

## 🚀 Key Features

1. **Atomic Slot Locking & Unique Comment Allocation**:
   - Backend mutex transactions guarantee that each participant claims an available slot atomically.
   - **One Comment = One User Rule**: The database assigns exactly one unique sample comment per user. The same comment can *never* be assigned to another user (`UNIQUE(task_id, comment_id)` and `UNIQUE(task_id, user_id)`).
   - Comment status transitions: `AVAILABLE` → `ASSIGNED` → `COMPLETED`. Completed comments never return to the pool.

2. **OTP Registration & Secure Authentication**:
   - Registration flow: WhatsApp Number → Send OTP (6-digit, 5-minute expiry, 60s cooldown, max 5 attempts) → Verify OTP → State → City → Password.
   - Complete Forgot Password flow with single-use OTP verification.
   - Password hashing with salt (PBKDF2 SHA-512) and JWT session tokens.
   - Passwords and password hashes are never exposed in production or in admin queries.

3. **Simulated Wallet & Double-Entry Accounting**:
   - Every balance modification has an immutable ledger entry (`CREDIT`, `WITHDRAWAL`, `REVERSAL`).
   - Balances are never modified directly without a transaction record.
   - User statistics (Total Withdrawn, Withdrawal Count, Approved, Rejected, Pending) are calculated dynamically from records.

4. **Withdrawal Settlement Workflow**:
   - Participant requests withdrawal with UPI ID (min ₹20). Funds are reserved as `PENDING`.
   - Admin approves with explicit confirmation: *"Have you manually completed the payment?"* → Marks `APPROVED` and records `approved_by` and `approved_at`.
   - Admin rejects with **mandatory rejection reason** (e.g., *"Incorrect UPI ID"*) → Marks `REJECTED`, creates a `REVERSAL` transaction, and restores funds immediately.

5. **AI Sample Comment Generator**:
   - Integrated with `@google/genai` using `gemini-3.8-flash` on the server-side (with fallback educational templates).
   - Generates constructive, realistic educational sample comments.
   - Mandatory disclaimer: `SIMULATED SAMPLE — NOT FOR REAL-WORLD POSTING`.
   - Controls: `GENERATE SAMPLE`, `REGENERATE`, `USE IN SUBMISSION`.

6. **Interactive Mock Map Workspace**:
   - Internal `/mock-map/:taskId` page displaying mock business name, location, vector map placeholder, mock star ratings, and simulated customer reviews.
   - Clear banner: `EDUCATIONAL SIMULATION — Never connect to Google Maps`.

7. **Executive Administration Panel**:
   - Dashboard with 11 KPI metrics, daily trend visualizers, and date filters (Today, 7 Days, 30 Days, Custom).
   - User Directory with large search bar (`SEARCH WHATSAPP NUMBER`), user suspension/activation, password resets, and detailed User Profile modal.
   - Comment Pool table tracking status, assigned user, WhatsApp number, date, and time.
   - Immutable Audit Logs recording all administrative actions.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, JetBrains Mono & Plus Jakarta Sans typography.
- **Backend**: Node.js, Express, TypeScript, `@google/genai`.
- **Database**: PostgreSQL / Supabase compatible SQL schema & migrations (`/database/schema.sql`, `/database/migrations/001_initial_schema.sql`, `/database/seeds.sql`) with in-memory ACID transaction simulation layer (`/database/db.ts`).
- **Support WhatsApp**: `+91 88373 66829`.

---

## 🔑 Administrator Credentials

### Administrator Access
- **Username**: `Ritam`
- **Password**: `Ritam@1234`
- **Role**: Super Administrator
- **Task Management**: Create and Delete simulation tasks and mock map review links at any time.

### Participant Registration
- No demo user accounts pre-seeded. Register directly using WhatsApp Number with OTP verification.
- **Mock OTP Code**: `123456` *(configured in `.env.example` via `MOCK_OTP_MODE="true"`)*

---

## 📦 Project Structure

```
├── client / src/
│   ├── components/
│   │   ├── auth/ (LoginModal, RegisterModal, ForgotPasswordModal)
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   └── Footer.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── pages/
│   │   ├── UserDashboard.tsx
│   │   ├── TasksPage.tsx
│   │   ├── MyClaimsPage.tsx
│   │   ├── MockMapPage.tsx
│   │   ├── WalletPage.tsx
│   │   ├── WithdrawalsPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── SupportPage.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── AdminUsers.tsx
│   │       ├── AdminTasks.tsx
│   │       ├── AdminCommentPool.tsx
│   │       ├── AdminSubmissions.tsx
│   │       ├── AdminWithdrawals.tsx
│   │       ├── AdminTransactions.tsx
│   │       └── AdminAuditLogs.tsx
│   ├── services/
│   │   └── api.ts
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── server/
│   ├── controllers/ (auth, tasks, comments, submissions, wallet, withdrawals, admin, ai)
│   ├── middleware/ (auth.ts)
│   ├── utils/ (jwt.ts)
│   ├── app.ts (Express API routes)
│   └── server.ts (Standalone Node runner)
├── database/
│   ├── migrations/ (001_initial_schema.sql)
│   ├── schema.sql (PostgreSQL / Supabase DDL)
│   ├── seeds.sql (Seed records)
│   └── db.ts (ACID transactions, mutex slot locking)
├── shared/
│   └── types.ts (DTOs, interfaces, constants)
├── package.json
└── vite.config.ts
```

---

## 🏃 Installation & Running Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
npm start
```
