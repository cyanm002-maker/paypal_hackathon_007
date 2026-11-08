const express = require('express');
const { getPayPalAccessToken } = require('./config/paypal');

require('dotenv').config();
const db = require("./config/database");
const subscriptionRoutes = require('./routes/subscriptions');


const app = express();
app.use(express.json());
app.use('/api/subscriptions',subscriptionRoutes);


const PORT = process.env.PORT || 5000;

// Test route to verify token generation via API
app.get('/api/test-token', async (req, res) => {
    try {
        const token = await getPayPalAccessToken();
        res.json({ success: true, access_token: token });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});