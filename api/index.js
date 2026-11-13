// Vercel Serverless Function Entry Point for SubShield Backend API
const app = require('../backend/src/server');

module.exports = (req, res) => {
    return app(req, res);
};

