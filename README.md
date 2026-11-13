# SubShield
### Production-Grade Subscription Defense System & Dark-Pattern Shield

SubShield is an automated financial protection application designed to detect stealth subscription price increases, eliminate dormant subscriptions using a real-time Cost-Per-Use ROI engine, and draft legally-backed FTC "Click-to-Cancel" dark-pattern bypass scripts.

---

## Key Competitive Features

1. **Authentication and Core Pages (Supabase Auth)**
   - **High-Conversion Landing Page:** Platform showcase, interactive live Cost-Per-Use ROI calculator, comparison matrix against corporate dark patterns, and verified metrics.
   - **Supabase Authentication:** Secure email/password login, account registration, session persistence, and Row-Level Security (RLS) policies. Includes an instant 1-click **Demo Sign-In** for rapid evaluation.
   - **Financial Defense Dashboard:** Real-time monthly burn rate tracker, dynamic budget ceiling with visual warning thresholds, active subscription counts, and category spend breakdown.

2. **Smart Anomaly and Price-Hike Detection**
   - Automatically compares current subscription renewal prices against historical baseline rates (`historical_base_amount`).
   - Flags sudden price hikes (e.g. +15% to +48%) with real-time warning indicators.
   - Identifies duplicate billings and redundant category bloat (e.g., overlapping streaming or cloud tiers).

3. **Cost-Per-Use ROI Score and Inactivity Engine**
   - Tracks monthly engagement frequency (`usage_count` and `last_used_date`).
   - Computes an exact **Cost-Per-Use ratio** (e.g., `$22.99 / 24 uses = $0.96 / use` -> *High ROI*).
   - Automatically classifies services dormant for 60+ days as **Dormant Subscriptions**, calculating total wasted capital and potential annual recovery.
   - Includes a quick `+1 Use` action in each row for instant logging.

4. **AI Cancellation and Negotiation Assistant**
   - Generates FTC-backed "Click-to-Cancel" formal demand letters citing federal regulations against deceptive retention funnels.
   - Generates **Live-Chat Rebuttals** to counter customer support delay tactics (e.g., mandatory phone calls, pause traps, discount deflection).
   - Provides promotional rate negotiation scripts (requesting 50% loyalty discounts).
   - Integrates a 1-click copy-to-clipboard mechanism and direct cancellation status updates.

5. **PayPal Live Sync and Webhooks**
   - Direct integration with PayPal Subscriptions API (`/v1/billing/subscriptions`).
   - Automated status syncing for `BILLING.SUBSCRIPTION.ACTIVATED`, `CANCELLED`, `SUSPENDED`, and `EXPIRED` events.

---

## Supabase Database and SQL Migration Script

SubShield is architected with **Supabase** as the primary database store with strict **Row Level Security (RLS)**.

### How to apply the migration in Supabase:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** -> **New Query**.
3. Copy and paste the contents of `supabase_migration.sql` (or run the snippet below).
4. Click **Run**.

```sql
-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User Budgets / Profile Settings Table
CREATE TABLE IF NOT EXISTS public.user_budgets (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    monthly_budget_limit NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    alert_email BOOLEAN DEFAULT TRUE,
    price_hike_threshold_pct NUMERIC(5, 2) DEFAULT 10.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    billing_cycle VARCHAR(50) NOT NULL DEFAULT 'MONTHLY',
    category VARCHAR(100) NOT NULL DEFAULT 'Other',
    paypal_sub_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
    last_used_date DATE DEFAULT CURRENT_DATE,
    historical_base_amount NUMERIC(10, 2) DEFAULT NULL,
    merchant_name VARCHAR(255),
    next_billing_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Subscription Logs Table (Audit and Anomaly History)
CREATE TABLE IF NOT EXISTS public.subscription_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    old_amount NUMERIC(10, 2),
    new_amount NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Row Level Security (RLS)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscriptions" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own subscriptions" ON public.subscriptions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own budget" ON public.user_budgets FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own budget" ON public.user_budgets FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own budget" ON public.user_budgets FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own logs" ON public.subscription_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own logs" ON public.subscription_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## Project Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # SQLite fallback and automatic schema migrations
│   │   │   ├── paypal.js            # PayPal OAuth token manager
│   │   │   └── supabase.js          # Supabase Node client connector
│   │   ├── routes/
│   │   │   ├── subscriptions.js     # Add, list, log usage, update, cancel subscriptions
│   │   │   ├── analytics.js         # Spend summaries, Anomaly detector and ROI analytics
│   │   │   ├── aiAgent.js           # Budget advice and Dark-Pattern AI Script Assistant
│   │   │   └── webhooks.js          # PayPal billing event handlers
│   │   └── server.js                # Express app launcher
│   ├── .env.example
│   ├── subshield.db                 # Local SQLite database with auto-seeded demo records
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Responsive header with Supabase status indicator
│   │   │   ├── LandingPage.jsx      # High-conversion landing page with interactive ROI calculator
│   │   │   ├── DashboardView.jsx    # Defense dashboard, burn rate, and anomaly banner
│   │   │   ├── AnomalyBanner.jsx    # Price-hike and duplicate charge alert component
│   │   │   ├── AiAssistantModal.jsx # Dark pattern bypass and negotiation generator
│   │   │   ├── RoiZombiesModal.jsx  # Inactivity audit and cost-per-use modal
│   │   │   ├── AddSubscriptionModal.jsx # Subscription creation modal
│   │   │   └── AuthModal.jsx        # Supabase Auth modal with 1-click Demo mode
│   │   ├── services/
│   │   │   ├── api.js               # Unified backend and frontend API bridge
│   │   │   └── supabase.js          # Supabase JS client and auth listener
│   │   ├── App.jsx                  # Main application container
│   │   └── index.css                # Dark theme UI styles
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
└── supabase_migration.sql           # Exact SQL migration script for Supabase
```

---

## Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/subscriptions` | Lists all subscriptions (local SQLite or Supabase). |
| `POST` | `/api/subscriptions/add` | Creates a subscription with baseline price, cycle, category, and usage metadata. |
| `POST` | `/api/subscriptions/:id/log-usage` | Increments usage count and refreshes `last_used_date` to today. |
| `PUT` | `/api/subscriptions/:id` | Updates subscription details. |
| `DELETE` | `/api/subscriptions/:id` | Deletes a subscription. |
| `POST` | `/api/subscriptions/cancel-subscription/:paypal_sub_id` | Cancels PayPal recurring pre-approval and updates status to CANCELLED. |
| `GET` | `/api/analytics/summary` | Returns total monthly burn rate, active counts, and category breakdown. |
| `GET` | `/api/analytics/anomalies` | Runs price-hike, duplicate charge, and category overlap detection. |
| `GET` | `/api/analytics/roi-and-zombies` | Calculates cost-per-use ratios, days inactive, and identifies dormant services. |
| `GET` | `/api/agent/insights?budget=150` | Returns spending evaluation and health recommendations. |
| `POST` | `/api/agent/cancellation-script` | Generates FTC Click-to-Cancel notices, live-chat rebuttals, and retention negotiation scripts (OpenRouter LLM). |
| `POST` | `/api/agent/chat-copilot` | Real-time live chat de-escalator: analyzes agent dark patterns and formulates instant counter-responses (OpenRouter LLM). |
| `POST` | `/api/agent/alternatives` | Recommends cheaper competitors, free open-source tools, and plan arbitrage tricks (OpenRouter LLM). |
| `POST` | `/api/agent/audit-terms` | Scans fine print and calculates Dark Pattern Friction Score (0-100) (OpenRouter LLM). |
| `POST` | `/api/webhooks/paypal` | Receives and synchronizes PayPal subscription billing events. |

---

## Quick Start (Local Development)

### 1. Backend Setup
Open a terminal in the project directory:
```powershell
cd backend
npm install
npm start
```
The backend starts on `http://localhost:5000` and automatically connects to `subshield.db` (auto-seeded with mock subscriptions for testing).

> To run with auto-restart on file changes: `npm run dev`

### 2. Frontend Setup
Open a second terminal in the project directory:
```powershell
cd frontend
npm install
npm run dev
```
The frontend starts on `http://localhost:5173`.

### 3. Supabase Integration (Optional)
SubShield works immediately in local sandbox mode without external configuration. To connect your cloud Supabase database:
1. Execute `supabase_migration.sql` in the **Supabase Dashboard -> SQL Editor**.
2. Add your credentials to `frontend/.env`:
```ini
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
3. Restart the frontend dev server.

