const axios = require("axios");
const { getPayPalAccessToken, PAYPAL_API_BASE } = require('../config/paypal');

async function seedSandbox() {
    try{
        console.log('Fetching PayPal Access Token...');
        const token = await getPayPalAccessToken();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 1. Create a Product
        console.log('Creating test product (StreamFlix)...');
        const prodRes = await axios.post(`${PAYPAL_API_BASE}/v1/catalogs/products`, {
            name: "StreamFlix Subscription",
            description: "Monthly video streaming service",
            type: "SERVICE",
            category: "DIGITAL_MEDIA"
        }, { headers });
        
        const productId = prodRes.data.id;
        console.log(`Created Product ID: ${productId}`);

        // 2. Create a Billing Plan
        console.log('Creating billing plan...');
        const planRes = await axios.post(`${PAYPAL_API_BASE}/v1/billing/plans`, {
            product_id: productId,
            name: "StreamFlix Monthly Plan",
            description: "Monthly standard tier",
            billing_cycles: [
                {
                    frequency: { interval_unit: "MONTH", interval_count: 1 },
                    tenure_type: "REGULAR",
                    sequence: 1,
                    total_cycles: 0,
                    pricing_scheme: { fixed_price: { value: "9.99", currency_code: "USD" } }
                }
            ],
            payment_preference: {
                auto_bill_outstanding: true,
                setup_fee: { value: "0", currency_code: "USD" },
                setup_fee_failure_action: "CONTINUE",
                payment_failure_threshold: 3
            }
        }, { headers });

        const planId = planRes.data.id;
        console.log(`Created Plan ID: ${planId}`);
        console.log('Sandbox seeding completed successfully!');
    }catch(error){
        console.error('Seeding failed:', error.response?.data || error.message);
    }
}

seedSandbox();
