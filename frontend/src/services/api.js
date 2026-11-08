import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const getSubscriptions = async () => {
    const response = await axios.get(`${API_BASE_URL}/subscriptions`);
    return response.data;
};

export const getAnalyticsSummary = async () => {
    const response = await axios.get(`${API_BASE_URL}/analytics/summary`);
    return response.data;
};

export const getAgentInsights = async (budget = 50) => {
    const response = await axios.get(`${API_BASE_URL}/agent/insights?budget=${budget}`);
    return response.data;
};