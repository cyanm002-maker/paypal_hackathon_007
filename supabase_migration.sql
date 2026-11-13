-- ==============================================================================
-- SubShield - Production Supabase Migration Script
-- Run this directly in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-running (safe cascade order)
-- DROP TABLE IF EXISTS public.subscription_logs CASCADE;
-- DROP TABLE IF EXISTS public.subscriptions CASCADE;
-- DROP TABLE IF EXISTS public.user_budgets CASCADE;

-- 3. Create User Budgets / Profile Settings Table
CREATE TABLE IF NOT EXISTS public.user_budgets (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    monthly_budget_limit NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    alert_email BOOLEAN DEFAULT TRUE,
    price_hike_threshold_pct NUMERIC(5, 2) DEFAULT 10.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create Main Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    billing_cycle VARCHAR(50) NOT NULL DEFAULT 'MONTHLY', -- 'MONTHLY', 'YEARLY', 'WEEKLY', 'QUARTERLY'
    category VARCHAR(100) NOT NULL DEFAULT 'Other',       -- 'Entertainment', 'Productivity', 'Cloud & Dev', 'Music', 'Utilities', 'Fitness'
    paypal_sub_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',          -- 'ACTIVE', 'CANCELLED', 'PAUSED', 'SUSPENDED'
    usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
    last_used_date DATE DEFAULT CURRENT_DATE,
    historical_base_amount NUMERIC(10, 2) DEFAULT NULL,    -- Initial baseline price to detect price-hikes
    merchant_name VARCHAR(255),
    next_billing_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Create Subscription Logs Table (For Anomaly History & Audit Trail)
CREATE TABLE IF NOT EXISTS public.subscription_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'CREATED', 'PRICE_HIKE', 'USAGE_LOGGED', 'CANCELLED', 'DUPLICATE_ALERT'
    old_amount NUMERIC(10, 2),
    new_amount NUMERIC(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_paypal_sub_id ON public.subscriptions(paypal_sub_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_last_used ON public.subscriptions(last_used_date);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_user_id ON public.subscription_logs(user_id);

-- 7. Automated updated_at Timestamp Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER tr_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_user_budgets_updated_at ON public.user_budgets;
CREATE TRIGGER tr_user_budgets_updated_at
    BEFORE UPDATE ON public.user_budgets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 8. Auto-provision user_budgets upon new Supabase user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_budgets (id, monthly_budget_limit, currency)
    VALUES (NEW.id, 50.00, 'USD')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_profile();

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Users can ONLY access their own subscription data
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_logs ENABLE ROW LEVEL SECURITY;

-- Subscriptions Policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions"
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can create their own subscriptions"
    ON public.subscriptions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can update their own subscriptions"
    ON public.subscriptions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can delete their own subscriptions"
    ON public.subscriptions FOR DELETE
    USING (auth.uid() = user_id);

-- User Budgets Policies
DROP POLICY IF EXISTS "Users can view their own budget" ON public.user_budgets;
CREATE POLICY "Users can view their own budget"
    ON public.user_budgets FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own budget" ON public.user_budgets;
CREATE POLICY "Users can insert their own budget"
    ON public.user_budgets FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own budget" ON public.user_budgets;
CREATE POLICY "Users can update their own budget"
    ON public.user_budgets FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Subscription Logs Policies
DROP POLICY IF EXISTS "Users can view their own logs" ON public.subscription_logs;
CREATE POLICY "Users can view their own logs"
    ON public.subscription_logs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own logs" ON public.subscription_logs;
CREATE POLICY "Users can insert their own logs"
    ON public.subscription_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- 10. (OPTIONAL) SAMPLE SEED DATA
-- To seed sample data for your authenticated user, replace '<YOUR_AUTH_USER_ID>'
-- with your actual Supabase User UUID from the auth.users table.
-- ==============================================================================
/*
INSERT INTO public.subscriptions (user_id, name, amount, currency, billing_cycle, category, paypal_sub_id, status, usage_count, last_used_date, historical_base_amount)
VALUES 
    (auth.uid(), 'Netflix Premium 4K', 22.99, 'USD', 'MONTHLY', 'Entertainment', 'I-NETFLIX-001', 'ACTIVE', 18, CURRENT_DATE - INTERVAL '2 days', 15.49),
    (auth.uid(), 'Spotify Family', 16.99, 'USD', 'MONTHLY', 'Music', 'I-SPOTIFY-002', 'ACTIVE', 32, CURRENT_DATE - INTERVAL '1 day', 14.99),
    (auth.uid(), 'GitHub Copilot Pro', 10.00, 'USD', 'MONTHLY', 'Productivity', 'I-GITHUB-003', 'ACTIVE', 45, CURRENT_DATE, 10.00),
    (auth.uid(), 'Gym Pass Fitness Club', 49.00, 'USD', 'MONTHLY', 'Fitness', 'I-GYM-004', 'ACTIVE', 1, CURRENT_DATE - INTERVAL '68 days', 49.00),
    (auth.uid(), 'Cloud Storage Pro', 9.99, 'USD', 'MONTHLY', 'Cloud & Dev', 'I-CLOUD-005', 'ACTIVE', 0, CURRENT_DATE - INTERVAL '75 days', 9.99);
*/

