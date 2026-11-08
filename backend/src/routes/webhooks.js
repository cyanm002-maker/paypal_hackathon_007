const express = require("express");
const router = express.Router();
const db = require("../config/database");

// to recieve the message from the paypal  
router.post('/paypal',async(req,res)=>{
    try{
        const event = req.body;
        console.log('Recieved paypal webhook event');

        const resource = event.resource;
        const subId = resource.id || resource.billing_agreement_id;

        if (!subId) {
            return res.status(400).json({ error: 'No subscription ID found in event resource' });
        }

        let newStatus = null;

        // Map PayPal event types to your database subscription statuses
        if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
            newStatus = 'ACTIVE';
        } else if (event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED') {
            newStatus = 'CANCELLED';
        } else if (event.event_type === 'BILLING.SUBSCRIPTION.SUSPENDED') {
            newStatus = 'SUSPENDED';
        } else if (event.event_type === 'BILLING.SUBSCRIPTION.EXPIRED') {
            newStatus = 'EXPIRED';
        }

        if (newStatus) {
            const query = `UPDATE subscriptions SET status = ? WHERE paypal_sub_id = ?`;
            db.run(query, [newStatus, subId], function(err) {
                if (err) {
                    console.error('Database update failed via webhook:', err.message);
                } else {
                    console.log(`Subscription ${subId} status updated to ${newStatus} via webhook.`);
                }
            });
        }

        res.status(200).json({recieved:true});

    }catch(error){
        console.error('Webhook error:',error.message);
        res.status(500).json({error:error.message});
    }
});

module.exports = router;