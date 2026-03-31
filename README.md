# Twisto Pulse — Transaction Risk Dashboard

A real-time transaction risk management dashboard built for fraud analysts. Supports Czech and Polish locales with full currency formatting, AI-powered risk analysis via OpenAI, and a live review queue workflow.

---

## Features

- **Transaction Table** — paginated table of all transactions with merchant autocomplete search, status filters (Flagged / Pending / Approved / Declined), and risk level filters (Critical / High / Medium / Low). Columns are fixed-width and the table scrolls horizontally on mobile.
- **AI Risk Analysis** — click any transaction to open the detail modal and generate an AI summary. OpenAI re-evaluates the risk score, risk factors, and automatically approves transactions scoring below 50.
- **Bulk AI Analysis** — "Analyze All" button re-evaluates every transaction in the table sequentially with a live progress counter.
- **Review Queue** — enqueue individual transactions or bulk-enqueue all high-risk ones (score ≥ 70). Approve or decline directly from the queue. Queue items link back to the full transaction modal.
- **Credit Limit Management** — set or update a user's credit limit with an optional reason, persisted to Supabase.
- **Language Switcher** — toggle between Czech (CZK) and Polish (PLN) instantly. All UI strings, currency formatting, and date formatting switch locale on the fly.
- **Dark / Light Mode** — sun/moon toggle in the navbar.
- **Toast Notifications** — green success and red error toasts with icons for all actions.
- **Mobile Friendly** — responsive layout, collapsible filter drawer, horizontal table scroll, stacked queue panel on small screens.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| State | Redux Toolkit + RTK Query |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Supabase (PostgreSQL + REST API + Edge Functions) |
| AI | OpenAI GPT-4o via Supabase Edge Function |
| i18n | Custom locale context (CS / PL) |

---

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Set up Supabase

Create a project at [supabase.com](https://supabase.com), then run `supabase/schema.sql` in the SQL Editor to create the tables and RLS policies.

### 3. Environment variables

Create a `.env` file in the root:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-legacy-anon-key>
```

> Use the **legacy anon/public** JWT key from Project Settings → API → Legacy API Keys. The new publishable key format is not yet supported by Edge Functions.

### 4. Seed the database

Run `supabase/seed.sql` in the Supabase SQL Editor to insert 30 sample transactions and user credit limits.

### 5. Deploy the Edge Function

In **Supabase Dashboard → Edge Functions**, create a function named `generate-risk-summary` and paste the contents of `supabase/functions/generate-risk-summary/index.ts`.

Then add your OpenAI key as a secret in **Project Settings → Edge Functions**:

```
OPENAI_API_KEY=sk-...
```

### 6. Run the dev server

```bash
npm run dev
```

---

## Database Schema

### `transactions`
| Column | Type | Description |
|---|---|---|
| id | uuid | Primary key |
| amount | numeric | Transaction amount |
| currency | text | `CZK` or `PLN` |
| merchant_name | text | Merchant name |
| status | text | `pending`, `flagged`, `approved`, `declined` |
| risk_score | integer | 0–100, AI-assigned |
| risk_factors | text[] | Array of risk tags |
| user_id | uuid | Associated user |
| created_at | timestamptz | Transaction timestamp |

### `user_credit_limits`
| Column | Type | Description |
|---|---|---|
| user_id | uuid | Primary key |
| credit_limit | numeric | Assigned credit limit |
| reason | text | Optional analyst note |
| updated_at | timestamptz | Last update timestamp |

---

## Project Structure

```
src/
  app/           # Redux store
  components/    # UI components (TransactionTable, ReviewQueue, RiskFactorModal, CreditLimitForm)
  contexts/      # LocaleContext (language + currency + date formatting)
  features/      # RTK Query API slices
  i18n/          # Czech and Polish translations
  pages/         # Dashboard page
  types/         # TypeScript types
supabase/
  schema.sql     # Table definitions + RLS policies
  seed.sql       # Sample data
  functions/     # Edge Functions (generate-risk-summary)
```
