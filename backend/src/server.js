const express = require('express');
const { getPayPalAccessToken } = require('./config/paypal');
require('dotenv').config();

const app = express();
app.use(express.json());

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