import { useEffect, useState } from 'react';
import { getSubscriptions, getAnalyticsSummary, getAgentInsights } from './services/api';

export default function Dashboard() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [insights, setInsights] = useState(null);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                const subData = await getSubscriptions();
                const analyticsData = await getAnalyticsSummary();
                const insightData = await getAgentInsights(50); // Pass user budget limit

                setSubscriptions(subData.subscriptions || []);
                setAnalytics(analyticsData.analytics);
                setInsights(insightData.agent_analysis);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            }
        }

        loadDashboardData();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>SubShield Dashboard</h1>

            {/* Analytics Summary Cards */}
            {analytics && (
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ padding: '15px', background: '#f4f4f4', borderRadius: '8px' }}>
                        <h3>Monthly Spend</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>${analytics.totalMonthlySpend.toFixed(2)}</p>
                    </div>
                    <div style={{ padding: '15px', background: '#f4f4f4', borderRadius: '8px' }}>
                        <h3>Active Subscriptions</h3>
                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{analytics.activeSubscriptionsCount}</p>
                    </div>
                </div>
            )}

            {/* AI Agent Insights Box */}
            {insights && (
                <div style={{ padding: '15px', background: '#eef2ff', borderLeft: '4px solid #4f46e5', marginBottom: '20px' }}>
                    <h3>AI Budget Advisor</h3>
                    <p><strong>Status:</strong> {insights.status}</p>
                    <ul>
                        {insights.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}

            <section>
                <h2>Subscriptions</h2>
                {subscriptions.length === 0 ? (
                    <p>No subscriptions found.</p>
                ) : (
                    <ul>
                        {subscriptions.map((subscription) => (
                            <li key={subscription.id ?? subscription.paypal_sub_id}>
                                <strong>{subscription.merchant_name || subscription.plan_name}</strong>
                                {' — '}
                                {subscription.currency} {subscription.amount}
                                {' · '}
                                {subscription.status}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}