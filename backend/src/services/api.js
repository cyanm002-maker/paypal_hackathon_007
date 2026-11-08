import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Fetch all subscriptions for the dashboard table
export const getSubscriptions = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/subscriptions`);
        return response.data;
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        throw error;
    }
};

// Fetch summary analytics for dashboard top cards
export const getAnalyticsSummary = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/analytics/summary`);
        return response.data;
    } catch (error) {
        console.error('Error fetching analytics:', error);
        throw error;
    }
};

// Fetch AI agent budget insights
export const getAgentInsights = async (budget = 50) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/agent/insights?budget=${budget}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching AI insights:', error);
        throw error;
    }
};