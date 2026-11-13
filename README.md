# SubShield 🛡️
### Production-Grade Subscription Defense System & Dark-Pattern Shield

SubShield is an AI-powered financial protection application designed to detect stealth subscription price increases, eliminate dormant **"Zombie Subscriptions"** using a real-time Cost-Per-Use ROI engine, and draft legally-backed FTC "Click-to-Cancel" dark-pattern bypass scripts.

---

## 🚀 Key Competitive Features

1. **Authentication & Core Pages (Supabase Auth)**
   - **High-Conversion Landing Page:** Hero showcase, interactive live Cost-Per-Use ROI calculator, comparison matrix against corporate dark patterns, and trust metrics.
   - **Supabase Authentication:** Secure email/password login, account registration, session persistence, and Row-Level Security (RLS) policies. Includes an instant 1-click **Demo Sign-In** for rapid evaluation.
   - **Financial Defense Dashboard:** Real-time monthly burn rate tracker, dynamic budget ceiling with visual warning thresholds, active subscription counts, and category spend breakdown.

2. **Smart Anomaly & Price-Hike Detection**
   - Automatically compares current subscription renewal prices against historical baseline rates (`historical_base_amount`).
   - Flags sudden price hikes (e.g. +15% to +48%) with real-time warning badges.
   - Identifies duplicate billings and redundant category bloat (e.g., overlapping streaming or cloud tiers).

3. **Cost-Per-Use ROI Score & Zombie Subscription Killer**
   - Tracks monthly engagement frequency (`usage_count` and `last_used_date`).
   - Computes an exact **Cost-Per-Use ratio** (e.g., `$22.99 / 24 uses = $0.96 / use` → *Excellent ROI*).
   - Automatically classifies services dormant for 60+ days as **"Zombie Subscriptions"**, calculating total wasted cash and potential annual savings.
   - Includes a quick `+1 Use` action in each row for instant logging.

4. **AI Cancellation & Negotiation Assistant**
   - Generates FTC-backed "Click-to-Cancel" formal demand letters citing federal regulations against deceptive retention mazes.
   - Generates **Live-Chat Rebuttals** to counter customer support delay tactics (e.g. "You must call our hotline", "Would you like 3 months at 50% off?").
   - Provides promotional rate negotiation scripts (requesting 50% loyalty discounts).
   - Integrates a 1-click copy-to-clipboard mechanism and direct cancellation status updates.

5. **PayPal Live Sync & Webhooks**
   - Direct integration with PayPal Subscriptions API (`/v1/billing/subscriptions`).
   - Automated status syncing for `BILLING.SUBSCRIPTION.ACTIVATED`, `CANCELLED`, `SUSPENDED`, and `EXPIRED` events.

---

## 🗄️ Supabase Database & SQL Migration Script

SubShield is designed to run with **Supabase** as the primary database store with strict **Row Level Security (RLS)**.

### How to apply the migration in Supabase:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** -> **New Query**.
3. Copy and paste the contents of [`supabase_migration.sql`](file:///c:/Users/CYAN/Desktop/paypal-hackathon/paypal_hackathon_007/supabase_migration.sql) (or run the snippet below).
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

-- Subscription Logs Table (Audit & History)
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
```

---

## 🛠️ Project Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js          # SQLite fallback for offline local dev
│   │   │   ├── paypal.js            # PayPal OAuth token manager
│   │   │   └── supabase.js          # Supabase Node client connector
│   │   ├── routes/
│   │   │   ├── subscriptions.js     # Add, list, log usage, cancel subscriptions
│   │   │   ├── analytics.js         # Spend summaries, Anomaly detector & ROI/Zombies
│   │   │   ├── aiAgent.js           # Budget advice & Dark-Pattern AI Script Assistant
│   │   │   └── webhooks.js          # PayPal billing event handlers
│   │   └── server.js                # Express app launcher
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Responsive header with Supabase status pill
│   │   │   ├── LandingPage.jsx      # High-conversion landing page with ROI calculator
│   │   │   ├── DashboardView.jsx    # Defense dashboard, burn rate & anomaly banner
│   │   │   ├── AnomalyBanner.jsx    # Price-hike & duplicate alert component
│   │   │   ├── AiAssistantModal.jsx # Dark pattern bypass & negotiation generator
│   │   │   ├── RoiZombiesModal.jsx  # Zombie subscription audit & cost-per-use modal
│   │   │   ├── AddSubscriptionModal.jsx # Subscription creation modal
│   │   │   └── AuthModal.jsx        # Supabase Auth modal with 1-click Demo mode
│   │   ├── services/
│   │   │   ├── api.js               # Unified backend and frontend API bridge
│   │   │   └── supabase.js          # Supabase JS client & auth listener
│   │   ├── App.jsx                  # Main application container
│   │   └── index.css                # Dark theme UI styles
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
└── supabase_migration.sql           # Exact SQL migration script for Supabase
```

---

## 🏃 Quick Start (Local Development)

### 1. Backend Setup
```powershell
Set-Location backend
npm install
Copy-Item .env.example .env
npm run dev
```
The backend starts on `http://localhost:5000`.

### 2. Frontend Setup
```powershell
Set-Location frontend
npm install
Copy-Item .env.example .env
npm run dev
```
The frontend starts on `http://localhost:5173`.

### 3. Connect Supabase (Optional for full cloud sync)
In `frontend/.env`:
```ini
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
*Note: If no Supabase keys are provided, SubShield automatically runs in high-fidelity sandbox/demo mode with auto-seeded demo records.*
