require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Import Routes
const subscriptionRoutes = require('./routes/subscriptions');
const webhookRoutes = require('./routes/webhooks');
const analyticsRoutes = require('./routes/analytics');
const aiAgentRoutes = require('./routes/aiAgent');

app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/agent', aiAgentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`SubShield backend server running on port ${PORT}`);
});
