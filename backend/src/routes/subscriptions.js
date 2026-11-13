const express = require("express");
const router = express.Router();
const axios = require('axios');
const { randomUUID } = require('crypto');
const { getPayPalAccessToken, PAYPAL_API_BASE } = require('../config/paypal');
const db = require('../config/database');
const { supabase, isSupabaseConfigured } = require('../config/supabase');

const seededMockSubscriptionIds = new Set([
    'I-NETFLIX001',
    'I-SPOTIFY002',
    'I-GITHUB003',
    'I-GYM004',
    'I-ADOBE005'
]);

const isMockSubscription = (paypalSubId) =>
    !paypalSubId || paypalSubId.startsWith('MOCK-') || seededMockSubscriptionIds.has(paypalSubId);

// 1. Get all subscriptions (optionally filtered by user_id)
router.get('/', async (req, res) => {
    const userId = req.query.user_id || 'demo-user-001';

    // If Supabase is configured and caller provided an auth token / user_id
    if (isSupabaseConfigured() && req.query.use_supabase === 'true' && req.query.user_id) {
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', req.query.user_id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                return res.json({ success: true, subscriptions: data, source: 'supabase' });
            }
        } catch (supabaseErr) {
            console.warn('Supabase query failed, falling back to local DB:', supabaseErr.message);
        }
    }

    db.all(`SELECT * FROM subscriptions ORDER BY id DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, subscriptions: rows, source: 'local' });
    });
});

// 2. Add a new subscription (Supports all competitive columns)
router.post('/add', (req, res) => {
    const {
        name,
        amount,
        currency = 'USD',
        billing_cycle = 'MONTHLY',
        category = 'Other',
        status = 'ACTIVE',
        usage_count = 0,
        last_used_date = new Date().toISOString().split('T')[0],
        historical_base_amount = null,
        user_id = 'demo-user-001',
        paypal_sub_id = null
    } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'name is required and must be a non-empty string.' });
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
        return res.status(400).json({ error: 'amount must be a valid non-negative number.' });
    }

    const subId = paypal_sub_id || `MOCK-${randomUUID()}`;
    const baseAmount = historical_base_amount !== null && historical_base_amount !== undefined 
        ? Number(historical_base_amount) 
        : parsedAmount;

    const query = `INSERT INTO subscriptions 
        (name, amount, currency, billing_cycle, category, paypal_sub_id, status, usage_count, last_used_date, historical_base_amount, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [
        name.trim(),
        parsedAmount,
        currency,
        billing_cycle,
        category,
        subId,
        status,
        Number(usage_count) || 0,
        last_used_date,
        baseAmount,
        user_id
    ], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            success: true,
            subscription: {
                id: this.lastID,
                name: name.trim(),
                amount: parsedAmount,
                currency,
                billing_cycle,
                category,
                paypal_sub_id: subId,
                status,
                usage_count: Number(usage_count) || 0,
                last_used_date,
                historical_base_amount: baseAmount,
                user_id
            }
        });
    });
});

// Alias for backwards compatibility
router.post('/add-mock', (req, res) => {
    return router.handle({ ...req, url: '/add', originalUrl: req.originalUrl }, res);
});

// 3. Log usage / Update usage count (Cost-Per-Use feature)
router.post('/:id/log-usage', (req, res) => {
    const { id } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const query = `UPDATE subscriptions 
        SET usage_count = usage_count + 1, last_used_date = ? 
        WHERE id = ? OR paypal_sub_id = ?`;

    db.run(query, [today, id, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Subscription not found.' });
        }
        res.json({ success: true, message: 'Usage logged successfully.', last_used_date: today });
    });
});

// 4. Update an existing subscription
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const {
        name,
        amount,
        currency,
        billing_cycle,
        category,
        status,
        usage_count,
        last_used_date,
        historical_base_amount
    } = req.body;

    const query = `UPDATE subscriptions 
        SET name = COALESCE(?, name),
            amount = COALESCE(?, amount),
            currency = COALESCE(?, currency),
            billing_cycle = COALESCE(?, billing_cycle),
            category = COALESCE(?, category),
            status = COALESCE(?, status),
            usage_count = COALESCE(?, usage_count),
            last_used_date = COALESCE(?, last_used_date),
            historical_base_amount = COALESCE(?, historical_base_amount)
        WHERE id = ? OR paypal_sub_id = ?`;

    db.run(query, [
        name,
        amount !== undefined ? Number(amount) : null,
        currency,
        billing_cycle,
        category,
        status,
        usage_count !== undefined ? Number(usage_count) : null,
        last_used_date,
        historical_base_amount !== undefined ? Number(historical_base_amount) : null,
        id,
        id
    ], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Subscription not found.' });
        }
        res.json({ success: true, message: 'Subscription updated successfully.' });
    });
});

// 5. Delete a subscription
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM subscriptions WHERE id = ? OR paypal_sub_id = ?`, [id, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Subscription not found.' });
        }
        res.json({ success: true, message: 'Subscription removed successfully.' });
    });
});

// 6. Cancel a subscription (PayPal or Mock)
router.post("/cancel-subscription/:paypal_sub_id", async (req, res) => {
    try {
        const { paypal_sub_id } = req.params;
        const { reason } = req.body || {};

        if (!isMockSubscription(paypal_sub_id)) {
            try {
                const token = await getPayPalAccessToken();
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                };

                const cancelPayload = {
                    reason: reason || "User cancelled via SubShield dark-pattern protection"
                };

                await axios.post(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${paypal_sub_id}/cancel`, cancelPayload, { headers });
            } catch (paypalError) {
                console.warn('PayPal cancellation request note:', paypalError.response?.data?.message || paypalError.message);
            }
        }

        const query = `UPDATE subscriptions SET status = 'CANCELLED' WHERE paypal_sub_id = ? OR id = ?`;

        db.run(query, [paypal_sub_id, paypal_sub_id], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Subscription not found in the local database.' });
            }
            res.json({
                success: true,
                message: `Subscription ${paypal_sub_id} successfully marked as CANCELLED.`,
                local_only: isMockSubscription(paypal_sub_id)
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

// 7. Create PayPal Live Subscription
router.post('/create-subscription', async (req, res) => {
    try {
        const plan_id = req.body && req.body.plan_id;
        if (!plan_id) {
            return res.status(400).json({ error: 'plan_id is required.' });
        }

        const token = await getPayPalAccessToken();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'PayPal-Request-Id': `sub-${Date.now()}`
        };

        const subPayload = {
            plan_id: plan_id,
            subscriber: {
                name: { given_name: "SubShield", surname: "User" },
                email_address: "user@subshield.app"
            },
            application_context: {
                brand_name: "SubShield Protection",
                locale: "en-US",
                shipping_preference: "NO_SHIPPING",
                user_action: "SUBSCRIBE_NOW",
                return_url: "https://example.com/return",
                cancel_url: "https://example.com/cancel"
            }
        };

        const response = await axios.post(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, subPayload, { headers });
        const subData = response.data;

        const query = `INSERT INTO subscriptions (paypal_sub_id, name, category, amount, currency, billing_cycle, status, historical_base_amount)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        db.run(query, [
            subData.id,
            "PayPal Managed Service",
            "DIGITAL_MEDIA",
            subData.billing_info?.last_payment?.amount?.value || 9.99,
            subData.billing_info?.last_payment?.amount?.currency_code || "USD",
            "MONTHLY",
            subData.status || "ACTIVE",
            subData.billing_info?.last_payment?.amount?.value || 9.99
        ], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, paypal_subscription: subData, local_id: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

module.exports = router;
