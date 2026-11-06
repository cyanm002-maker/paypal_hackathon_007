const axios = require("axios");
require('dotenv').config();

const { PAYPAL_CLIENT_ID, PAYPAL_SECRET, PAYPAL_API_BASE } = process.env;

async function getPayPalAccessToken(){
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');

    try{
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

    }catch(error){
        console.error('Error fetching Paypal access token',error.response?.data || error.message);
        throw error;
    }


}

module.exports = {getPayPalAccessToken,PAYPAL_API_BASE};