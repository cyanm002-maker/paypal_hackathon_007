const express = require("express");
const router = express.Router();
const axios = require('axios');
const { randomUUID } = require('crypto');
const { getPayPalAccessToken, PAYPAL_API_BASE } = require('../config/paypal');
const db = require('../config/database');

const seededMockSubscriptionIds = new Set([
    'I-NETFLIX001',
    'I-SPOTIFY002',
    'I-GITHUB003'
]);

const isMockSubscription = (paypalSubId) =>
    paypalSubId.startsWith('MOCK-') || seededMockSubscriptionIds.has(paypalSubId);

if (process.env.NODE_ENV !== 'production') {
    router.post('/add-mock', (req, res) => {
        const { name, amount } = req.body || {};
        const currency = req.body && req.body.currency !== undefined ? req.body.currency : 'INR';
        const billingCycle = req.body && req.body.billing_cycle !== undefined
            ? req.body.billing_cycle
            : 'MONTHLY';
        const category = req.body && req.body.category !== undefined ? req.body.category : 'Other';
        const status = req.body && req.body.status !== undefined ? req.body.status : 'ACTIVE';

        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ error: 'name is required and must be a non-empty string.' });
        }

        const parsedAmount = Number(amount);
        if ((typeof amount !== 'number' && typeof amount !== 'string') ||
            !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ error: 'amount must be a positive number.' });
        }

        if ([currency, billingCycle, category, status].some(value => typeof value !== 'string')) {
            return res.status(400).json({
                error: 'currency, billing_cycle, category, and status must be strings.'
            });
        }

        const subscription = {
            name: name.trim(),
            amount: parsedAmount,
            currency,
            billing_cycle: billingCycle,
            category,
            paypal_sub_id: `MOCK-${randomUUID()}`,
            status
        };
        const query = `INSERT INTO subscriptions
            (name, amount, currency, billing_cycle, category, paypal_sub_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)`;

        db.run(query, [
            subscription.name,
            subscription.amount,
            subscription.currency,
            subscription.billing_cycle,
            subscription.category,
            subscription.paypal_sub_id,
            subscription.status
        ], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.status(201).json({
                success: true,
                subscription: { id: this.lastID, ...subscription }
            });
        });
    });
}

// 1. Endpoint to create buyer subscriptions
// router.post('/create-subscription',async(req,res)=>{
//     try{
//         const {plan_id} = req.body;
//         if(!plan_id){
//             return res.status(400).json({error:'plan_id is required'});

//         }
//         const token = await getPayPalAccessToken();
//         const headers = {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${token}`,
//             'PayPal-Request-Id': `sub-${Date.now()}`
//         };

//         // Call PayPal Subscriptions API to create a subscription[cite: 1, 3]
//         const subPayload = {
//             plan_id: plan_id,
//             subscriber: {
//                 name: { given_name: "John", surname: "Doe" },
//                 email_address: "buyer@example.com"
//             },
//             application_context: {
//                 brand_name: "SubShield",
//                 locale: "en-US",
//                 shipping_preference: "NO_SHIPPING",
//                 user_action: "SUBSCRIBE_NOW",
//                 return_url: "https://example.com/return",
//                 cancel_url: "https://example.com/cancel"
//             }
//         };

//         const response = await axios.post(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, subPayload, { headers });
//         const subData = response.data;

//         const query = `INSERT INTO subscriptions (paypal_sub_id, merchant_name, plan_name, category, amount, currency, interval, status, next_billing_time)
//                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//         db.run(query, [
//             subData.id,
//             "StreamFlix",
//             "StreamFlix Monthly Plan",
//             "DIGITAL_MEDIA",
//             "9.99",
//             "USD",
//             "MONTH",
//             subData.status,
//             subData.start_time
//         ], function(err) {
//             if (err) {
//                 return res.status(500).json({ error: err.message });
//             }
//             res.json({ success: true, paypal_subscription: subData, local_id: this.lastID });
//         });


//     }catch(error){
//         res.status(500).json({error:error.response?.data||error.message});

//     }
// });

router.post('/create-subscription', async (req, res) => {
    try {
        // Safe check in case req.body is undefined
        const plan_id = req.body && req.body.plan_id;
        if (!plan_id) {
            return res.status(400).json({ 
                error: 'plan_id is required. Make sure your Postman body is set to raw JSON and Content-Type is application/json.' 
            });
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
                name: { given_name: "John", surname: "Doe" },
                email_address: "buyer@example.com"
            },
            application_context: {
                brand_name: "SubShield",
                locale: "en-US",
                shipping_preference: "NO_SHIPPING",
                user_action: "SUBSCRIBE_NOW",
                return_url: "https://example.com/return",
                cancel_url: "https://example.com/cancel"
            }
        };

        const response = await axios.post(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, subPayload, { headers });
        const subData = response.data;

        const query = `INSERT INTO subscriptions (paypal_sub_id, merchant_name, plan_name, category, amount, currency, interval, status, next_billing_time)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        db.run(query, [
            subData.id,
            "StreamFlix",
            "StreamFlix Monthly Plan",
            "DIGITAL_MEDIA",
            "9.99",
            "USD",
            "MONTH",
            subData.status,
            subData.start_time
        ], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true, paypal_subscription: subData, local_id: this.lastID });
        });

    } catch (error) {
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

// 2. Endpoint to get all saved subscriptions for your frontend/AG Grid[cite: 2, 6]
router.get('/', (req, res) => {
    db.all(`SELECT * FROM subscriptions`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, subscriptions: rows });
    });
});


// 3. Endpoint to cancel a subscription in paypal 

router.post("/cancel-subscription/:paypal_sub_id",async(req,res)=>{
    try{
        const {paypal_sub_id} = req.params;
        const {reason} = req.body || {};

        if (!isMockSubscription(paypal_sub_id)) {
            const token = await getPayPalAccessToken();
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            const cancelPayload = {
                reason:reason || "Not using the service anymore"
            };

            await axios.post(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${paypal_sub_id}/cancel`, cancelPayload, { headers });
        }

        const query = `UPDATE subscriptions SET status = 'CANCELLED' WHERE paypal_sub_id = ?`;

        db.run(query, [paypal_sub_id], function(err) {
            if(err){
                return res.status(500).json({error:err.message});
            }
            if(this.changes==0){
                return res.status(404).json({error:'Subscription not found in the local database.'});

            }
            res.json({
                success: true,
                message: `Subscription ${paypal_sub_id} successfully cancelled.`,
                local_only: isMockSubscription(paypal_sub_id)
            });
        });
    } catch(error){
        res.status(500).json({error: error.response?.data || error.message});

    }
})

module.exports = router;

