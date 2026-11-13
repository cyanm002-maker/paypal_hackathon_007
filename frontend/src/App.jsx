import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck } from 'lucide-react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import DashboardView from './components/DashboardView';
import AuthModal from './components/AuthModal';
import AddSubscriptionModal from './components/AddSubscriptionModal';
import AiAssistantModal from './components/AiAssistantModal';
import RoiZombiesModal from './components/RoiZombiesModal';

import { authService, dbService, isSupabaseConfigured } from './services/supabase';
import {
    getSubscriptions,
    addSubscription,
    logSubscriptionUsage,
    deleteSubscription,
    cancelSubscription,
    getAnalyticsSummary,
    getAnomalies,
    getRoiAndZombies,
    getAgentInsights
} from './services/api';

export default function App() {
    // Navigation & Auth States
    const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'dashboard'
    const [user, setUser] = useState(null);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    // Data States
    const [subscriptions, setSubscriptions] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [insights, setInsights] = useState(null);
    const [anomalies, setAnomalies] = useState([]);
    const [roiData, setRoiData] = useState(null);
    const [budgetLimit, setBudgetLimit] = useState(150);
    const [loadingData, setLoadingData] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Modals
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [aiInitialData, setAiInitialData] = useState(null);
    const [roiModalOpen, setRoiModalOpen] = useState(false);

    // Show temporary toast
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 4000);
    };

    // Initialize Auth Session
    useEffect(() => {
        const initAuth = async () => {
            const session = await authService.getSession();
            if (session?.user) {
                setUser(session.user);
            }
        };

        initAuth();

        const { data: authListener } = authService.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser(session.user);
            } else {
                setUser(null);
            }
        });

        return () => {
            authListener?.subscription?.unsubscribe?.();
        };
    }, []);

    // Load All Dashboard Data
    const loadDashboardData = useCallback(async () => {
        setLoadingData(true);
        try {
            const [subsRes, analyticsRes, anomaliesRes, roiRes, insightsRes] = await Promise.allSettled([
                getSubscriptions(user?.id),
                getAnalyticsSummary(),
                getAnomalies(),
                getRoiAndZombies(),
                getAgentInsights(budgetLimit)
            ]);

            if (subsRes.status === 'fulfilled' && subsRes.value?.subscriptions) {
                setSubscriptions(subsRes.value.subscriptions);
            }

            if (analyticsRes.status === 'fulfilled' && analyticsRes.value?.analytics) {
                setAnalytics(analyticsRes.value.analytics);
            }

            if (anomaliesRes.status === 'fulfilled' && anomaliesRes.value?.anomalies) {
                setAnomalies(anomaliesRes.value.anomalies);
            }

            if (roiRes.status === 'fulfilled' && roiRes.value) {
                setRoiData(roiRes.value);
            }

            if (insightsRes.status === 'fulfilled' && insightsRes.value?.agent_analysis) {
                setInsights(insightsRes.value.agent_analysis);
            }
        } catch (err) {
            console.error('Error loading dashboard data:', err);
        } finally {
            setLoadingData(false);
        }
    }, [user, budgetLimit]);

    useEffect(() => {
        if (currentView === 'dashboard') {
            loadDashboardData();
        }
    }, [currentView, loadDashboardData]);

    // Navigation guard
    const handleNavigate = (view) => {
        if (view === 'dashboard' && !user) {
            setAuthMode('login');
            setAuthModalOpen(true);
            showToast('Please sign in or use Demo mode to enter your Shield Dashboard.');
            return;
        }
        setCurrentView(view);
    };

    const handleSignOut = async () => {
        await authService.signOut();
        setUser(null);
        setCurrentView('landing');
        showToast('Signed out of SubShield.');
    };

    // Actions
    const handleAddSubscription = async (formData) => {
        const res = await addSubscription(formData, user?.id);
        if (res?.success) {
            showToast(`Added ${formData.name} to active defense!`);
            loadDashboardData();
        }
    };

    const handleLogUsage = async (id, currentUsage) => {
        try {
            await logSubscriptionUsage(id, currentUsage);
            showToast('+1 Use logged for today!');
            loadDashboardData();
        } catch (err) {
            showToast('Failed to log usage.');
        }
    };

    const handleCancelSubscription = async (subId, name) => {
        if (!confirm(`Are you sure you want to cancel "${name}"? SubShield will trigger cancellation in PayPal.`)) {
            return;
        }
        try {
            await cancelSubscription(subId, 'User cancelled via SubShield');
            showToast(`Cancelled ${name}. Recurring billing stopped.`);
            loadDashboardData();
        } catch (err) {
            showToast('Failed to cancel subscription.');
        }
    };

    const handleDeleteSubscription = async (id) => {
        if (!confirm('Remove this subscription from SubShield tracking?')) return;
        try {
            await deleteSubscription(id);
            showToast('Subscription removed.');
            loadDashboardData();
        } catch (err) {
            showToast('Failed to delete subscription.');
        }
    };

    const handleOpenAiAssistant = (prefill = null) => {
        setAiInitialData(prefill);
        setAiModalOpen(true);
    };

    const handleUpdateBudget = async (newLimit) => {
        setBudgetLimit(newLimit);
        if (isSupabaseConfigured && user) {
            try {
                await dbService.upsertUserBudget(user.id, newLimit);
            } catch (err) {
                console.warn('Failed to persist budget in Supabase:', err.message);
            }
        }
        showToast(`Budget limit updated to $${newLimit.toFixed(2)}/mo`);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0b0f19' }}>
            {/* Navigation Bar */}
            <Navbar
                currentView={currentView}
                setCurrentView={handleNavigate}
                user={user}
                onSignOut={handleSignOut}
                onOpenAuth={(mode) => { setAuthMode(mode); setAuthModalOpen(true); }}
            />

            {/* Global Toast Notification */}
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    background: '#0d131f',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    color: '#f8fafc',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
                    zIndex: 200,
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <ShieldCheck size={16} color="#818cf8" strokeWidth={2.4} />
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Main Views */}
            <main style={{ flex: 1 }}>
                {currentView === 'landing' ? (
                    <LandingPage
                        onGoToDashboard={() => handleNavigate('dashboard')}
                        onOpenAuth={(mode) => { setAuthMode(mode); setAuthModalOpen(true); }}
                    />
                ) : (
                    <DashboardView
                        subscriptions={subscriptions}
                        analytics={analytics}
                        insights={insights}
                        anomalies={anomalies}
                        roiData={roiData}
                        budgetLimit={budgetLimit}
                        onUpdateBudget={handleUpdateBudget}
                        onAddClick={() => setAddModalOpen(true)}
                        onOpenAiAssistant={handleOpenAiAssistant}
                        onOpenRoiModal={() => setRoiModalOpen(true)}
                        onLogUsage={handleLogUsage}
                        onCancelSubscription={handleCancelSubscription}
                        onDeleteSubscription={handleDeleteSubscription}
                        onRefresh={loadDashboardData}
                    />
                )}
            </main>

            {/* Modals */}
            <AuthModal
                isOpen={authModalOpen}
                initialMode={authMode}
                onClose={() => setAuthModalOpen(false)}
                onAuthSuccess={(authUser) => {
                    setUser(authUser);
                    setCurrentView('dashboard');
                    showToast(`Welcome back, ${authUser.email || 'Shield Member'}!`);
                }}
            />

            <AddSubscriptionModal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAdd={handleAddSubscription}
            />

            <AiAssistantModal
                isOpen={aiModalOpen}
                initialData={aiInitialData}
                subscriptions={subscriptions}
                onClose={() => setAiModalOpen(false)}
                onMarkCancelled={(id) => {
                    handleCancelSubscription(id, 'Target Subscription');
                    setAiModalOpen(false);
                }}
            />

            <RoiZombiesModal
                isOpen={roiModalOpen}
                roiData={roiData}
                onClose={() => setRoiModalOpen(false)}
                onOpenAiAssistant={handleOpenAiAssistant}
                onLogUsage={handleLogUsage}
            />
        </div>
    );
}
