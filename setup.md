# Finance Tracker App – Setup & Plan

## Overview
A personal finance tracker app to manage expenses and income, visualize spending over time, and ensure data privacy with user authentication. Backend and authentication are powered by Supabase.

---

## Features

- **User Authentication** (Supabase Auth)
  - Signup (email & password)
  - Login/Logout
  - Auth state persistence
  - Per-user data isolation
- **Transactions**
  - Add expenses and income
  - View, edit, and delete transactions
  - Categorize transactions (optional)
- **Charts & Analytics**
  - Visualize expenses for:
    - Last month
    - Last 2 weeks
    - Last week
    - Yesterday
    - Today (running day)
- **Responsive UI**
  - Dashboard, transaction list, and forms

---

## Tech Stack

- **Frontend**: React (with Supabase JS client)
- **Backend/DB/Auth**: Supabase (PostgreSQL + Auth)
- **Charting**: Chart.js or Recharts
- **Styling**: Tailwind CSS or Material UI

---

## Data Model (Supabase)

### Table: `transactions`
| Field        | Type      | Description                |
|--------------|-----------|----------------------------|
| id           | UUID      | Primary key                |
| user_id      | UUID      | Foreign key to auth.users  |
| type         | text      | "expense" or "income"      |
| amount       | numeric   | Transaction amount         |
| category     | text      | (Optional)                 |
| description  | text      | (Optional)                 |
| date         | timestamp | Date of transaction        |
| created_at   | timestamp | Auto-generated             |

- **Row-level security**: Only allow users to access their own transactions.

---

## Supabase Setup Steps

1. **Create Supabase Project**
2. **Enable Auth (email/password)**
3. **Create `transactions` table** (see above)
4. **Set up Row Level Security (RLS)**
   - Policy: `user_id = auth.uid()`
5. **Get Supabase URL and anon/public key**

---

## Authentication Flow

- **Signup**: User registers with email & password (Supabase `signUp`)
- **Login**: User logs in with email & password (Supabase `signInWithPassword`)
- **Auth State**: Use Supabase’s auth state listener to persist login
- **Logout**: User logs out (Supabase `signOut`)
- **Route Protection**: Only authenticated users can access dashboard and transactions

---

## API/Client Methods

| Action         | Supabase Method                  |
|----------------|----------------------------------|
| Signup         | `supabase.auth.signUp()`         |
| Login          | `supabase.auth.signInWithPassword()` |
| Logout         | `supabase.auth.signOut()`        |
| Get user       | `supabase.auth.getUser()`        |
| Add transaction| `supabase.from('transactions').insert()` |
| List transactions | `supabase.from('transactions').select().order('date', {ascending: false})` |

---

## UI/UX Design

- **Signup/Login Pages**
- **Dashboard**: Summary, quick add, chart with filters
- **Transactions List**: All transactions, filterable
- **Add/Edit Transaction Modal**
- **Expense Chart**: Bar/line chart with selectable timeframes

---

## Example Folder Structure

```
/src
  /components
    - AuthProvider.jsx
    - LoginForm.jsx
    - SignupForm.jsx
    - Dashboard.jsx
    - TransactionForm.jsx
    - TransactionList.jsx
    - ExpenseChart.jsx
  /utils
    - supabaseClient.js
  /pages
    - login.jsx
    - signup.jsx
    - dashboard.jsx
    - index.jsx
```

---

## Implementation Steps

1. **Supabase Setup**
   - Create project, enable auth, create table, set RLS
2. **Project Setup**
   - Initialize React app, install Supabase client
3. **Auth Pages**
   - Build signup and login forms, handle auth state
4. **Transaction Features**
   - CRUD for transactions (per user), chart with filters
5. **Testing & Deployment**
   - Test auth/data flows, deploy frontend

---

## Timeline Example

| Week | Tasks                                      |
|------|--------------------------------------------|
| 1    | Project setup, Supabase config, basic auth |
| 2    | CRUD endpoints, frontend skeleton          |
| 3    | Chart integration, filters, UI polish      |
| 4    | Testing, bugfixes, deployment              |

---

## Notes
- All user data is private and isolated via Supabase RLS.
- The app can be extended with categories, recurring transactions, and export features in the future. 