const axios = require("axios");
require('dotenv').config();

const normalizePayPalBaseUrl = (baseUrl) => {
    if (!baseUrl) return 'https://api-m.sandbox.paypal.com';

    const normalized = baseUrl.trim().replace(/\/+$/, '');

    if (normalized.includes('api-m.')) return normalized;
    if (normalized.includes('sandbox.paypal.com')) return normalized.replace('https://sandbox.paypal.com', 'https://api-m.sandbox.paypal.com');
    if (normalized.includes('paypal.com')) return normalized.replace('https://www.paypal.com', 'https://api-m.paypal.com');

    return normalized;
};

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API_BASE = normalizePayPalBaseUrl(process.env.PAYPAL_API_BASE);

async function getPayPalAccessToken() {
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
        throw new Error('PayPal client credentials are missing. Add PAYPAL_CLIENT_ID and PAYPAL_SECRET to backend/.env');
    }

    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');

    try {
        const response = await axios({
            url: `${PAYPAL_API_BASE}/v1/oauth2/token`,
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: 'grant_type=client_credentials'
        });

        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching PayPal access token:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = { getPayPalAccessToken, PAYPAL_API_BASE };