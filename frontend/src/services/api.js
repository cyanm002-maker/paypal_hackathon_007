import axios from 'axios';
import { supabase, isSupabaseConfigured, dbService } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// 1. Get subscriptions (uses Supabase RLS directly when logged in and configured, or backend API)
export const getSubscriptions = async (userId) => {
    if (isSupabaseConfigured && userId) {
        try {
            const data = await dbService.getSubscriptions(userId);
            if (data && Array.isArray(data)) {
                return { subscriptions: data, source: 'supabase' };
            }
        } catch (err) {
            console.warn('Direct Supabase fetch failed, trying backend API:', err.message);
        }
    }

    const response = await axios.get(`${API_BASE_URL}/subscriptions`, {
        params: { user_id: userId, use_supabase: isSupabaseConfigured }
    });
    return response.data;
};

// 2. Add subscription
export const addSubscription = async (subscription, userId) => {
    if (isSupabaseConfigured && userId) {
        try {
            const data = await dbService.insertSubscription({
                name: subscription.name,
                amount: Number(subscription.amount),
                currency: subscription.currency || 'USD',
                billing_cycle: subscription.billing_cycle || 'MONTHLY',
                category: subscription.category || 'Other',
                status: subscription.status || 'ACTIVE',
                usage_count: Number(subscription.usage_count) || 0,
                last_used_date: subscription.last_used_date || new Date().toISOString().split('T')[0],
                historical_base_amount: subscription.historical_base_amount ? Number(subscription.historical_base_amount) : Number(subscription.amount),
                paypal_sub_id: subscription.paypal_sub_id || null
            }, userId);

            if (data) {
                return { success: true, subscription: data, source: 'supabase' };
            }
        } catch (err) {
            console.warn('Direct Supabase insert failed, falling back to backend API:', err.message);
        }
    }

    const response = await axios.post(`${API_BASE_URL}/subscriptions/add`, {
        ...subscription,
        user_id: userId || 'demo-user-001'
    });
    return response.data;
};

// Backwards compatibility for mock
export const addMockSubscription = (subscription) => addSubscription(subscription, 'demo-user-001');

// 3. Log usage (+1 use and refresh last_used_date)
export const logSubscriptionUsage = async (id, currentUsage = 0, isSupabaseRow = false) => {
    const today = new Date().toISOString().split('T')[0];

    if (isSupabaseConfigured && isSupabaseRow && supabase) {
        try {
            await dbService.updateSubscription(id, {
                usage_count: Number(currentUsage) + 1,
                last_used_date: today
            });
            return { success: true, last_used_date: today };
        } catch (err) {
            console.warn('Direct Supabase usage log failed, falling back to backend:', err.message);
        }
    }

    const response = await axios.post(`${API_BASE_URL}/subscriptions/${id}/log-usage`);
    return response.data;
};

// 4. Update subscription
export const updateSubscription = async (id, updates, isSupabaseRow = false) => {
    if (isSupabaseConfigured && isSupabaseRow && supabase) {
        try {
            const data = await dbService.updateSubscription(id, updates);
            return { success: true, subscription: data };
        } catch (err) {
            console.warn('Direct Supabase update failed:', err.message);
        }
    }

    const response = await axios.put(`${API_BASE_URL}/subscriptions/${id}`, updates);
    return response.data;
};

// 5. Delete subscription
export const deleteSubscription = async (id, isSupabaseRow = false) => {
    if (isSupabaseConfigured && isSupabaseRow && supabase) {
        try {
            await dbService.deleteSubscription(id);
            return { success: true };
        } catch (err) {
            console.warn('Direct Supabase delete failed:', err.message);
        }
    }

    const response = await axios.delete(`${API_BASE_URL}/subscriptions/${id}`);
    return response.data;
};

// 6. Cancel subscription via PayPal
export const cancelSubscription = async (paypalSubId, reason = 'SubShield Cancellation') => {
    const response = await axios.post(`${API_BASE_URL}/subscriptions/cancel-subscription/${paypalSubId}`, {
        reason
    });
    return response.data;
};

// 7. Get Analytics Summary
export const getAnalyticsSummary = async () => {
    const response = await axios.get(`${API_BASE_URL}/analytics/summary`);
    return response.data;
};

// 8. Smart Anomaly & Price-Hike Detection
export const getAnomalies = async () => {
    const response = await axios.get(`${API_BASE_URL}/analytics/anomalies`);
    return response.data;
};

// 9. Cost-Per-Use ROI Score & Zombie Subscriptions
export const getRoiAndZombies = async () => {
    const response = await axios.get(`${API_BASE_URL}/analytics/roi-and-zombies`);
    return response.data;
};

// 10. AI Budget Advisor Insights
export const getAgentInsights = async (budget = 50) => {
    const response = await axios.get(`${API_BASE_URL}/agent/insights?budget=${budget}`);
    return response.data;
};

// 11. AI Cancellation & Negotiation Assistant Generator
export const generateCancellationScript = async (params) => {
    const response = await axios.post(`${API_BASE_URL}/agent/cancellation-script`, params);
    return response.data;
};
