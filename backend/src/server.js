const express = require('express');
const { getPayPalAccessToken } = require('./config/paypal');
const db = require('./config/database');
const subscriptionRoutes = require('./routes/subscriptions');
const webhookRoutes = require('./routes/webhooks');
require('dotenv').config();

const app = express();


app.use(express.json()); 

const PORT = process.env.PORT || 5000;

// Test token route
app.get('/api/test-token', async (req, res) => {
    try {
        const token = await getPayPalAccessToken();
        res.json({ success: true, access_token: token });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Mount subscription routes
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/webhooks', webhookRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});