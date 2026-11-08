const express = require("express");
const router = express.Router();
const axios = require('axios');
const { getPayPalAccessToken, PAYPAL_API_BASE } = require('../config/paypal');
const db = require('../config/database');

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
        const {reason} = req.body;

        const token = await getPayPalAccessToken();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const cancelPayload = {
            reason:reason || "Not using the service anymore"
        };

        await axios.post(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${paypal_sub_id}/cancel`, cancelPayload, { headers });

        // Update local SQLite database status to CANCELLED 
        const query = `UPDATE subscriptions SET status = 'CANCELLED' WHERE paypal_sub_id = ?`;

        db.run(query,[paypal_sub_id],function(err){
            if(err){
                return res.status(500).json({error:err.message});
            }
            if(this.changes==0){
                return res.status(404).json({error:'Subscription found in PayPal, but not found in local database'});

            }
            res.json({success:true,message:`Subscription ${paypal_sub_id} successfully cancelled.`});
        });
    } catch(error){
        res.status(500).json({error: error.response?.data || error.message});

    }
})

module.exports = router;

