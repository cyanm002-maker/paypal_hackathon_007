import React, { useState } from 'react';
import AnomalyBanner from './AnomalyBanner';

export default function DashboardView({
    subscriptions = [],
    analytics,
    insights,
    anomalies = [],
    roiData,
    budgetLimit,
    onUpdateBudget,
    onAddClick,
    onOpenAiAssistant,
    onOpenRoiModal,
    onLogUsage,
    onCancelSubscription,
    onDeleteSubscription,
    onRefresh
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'ZOMBIE' | 'CANCELLED'
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [editingBudget, setEditingBudget] = useState(false);
    const [tempBudget, setTempBudget] = useState(budgetLimit);

    // Calculate spend & budget progress
    const totalSpend = analytics?.totalMonthlySpend ?? subscriptions
        .filter(s => s.status === 'ACTIVE')
        .reduce((acc, s) => acc + Number(s.amount || 0), 0);

    const budgetPercent = budgetLimit > 0 ? Math.min(Math.round((totalSpend / budgetLimit) * 100), 100) : 0;
    const isOverBudget = totalSpend > budgetLimit;

    // Filter subscriptions
    const filteredSubscriptions = subscriptions.filter(sub => {
        const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sub.category && sub.category.toLowerCase().includes(searchQuery.toLowerCase()));

        // Check zombie status from roiData or days since last used
        const daysIdle = sub.last_used_date 
            ? Math.floor(Math.abs(new Date() - new Date(sub.last_used_date)) / (1000 * 60 * 60 * 24))
            : 90;
        const isZombie = (daysIdle >= 60 || (sub.usage_count === 0 && daysIdle >= 30)) && sub.status === 'ACTIVE';

        let matchesStatus = true;
        if (statusFilter === 'ACTIVE') matchesStatus = sub.status === 'ACTIVE';
        if (statusFilter === 'CANCELLED') matchesStatus = sub.status === 'CANCELLED';
        if (statusFilter === 'ZOMBIE') matchesStatus = isZombie;

        const matchesCat = selectedCategory === 'ALL' || sub.category === selectedCategory;

        return matchesSearch && matchesStatus && matchesCat;
    });

    // Unique categories
    const categories = ['ALL', ...new Set(subscriptions.map(s => s.category).filter(Boolean))];

    const handleSaveBudget = (e) => {
        e.preventDefault();
        onUpdateBudget(Number(tempBudget));
        setEditingBudget(false);
    };

    return (
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '32px 24px', width: '100%' }}>
            {/* Top Bar with Quick Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#f3f4f6', margin: 0 }}>
                        Financial Defense Dashboard
                    </h1>
                    <p style={{ color: '#9ca3af', fontSize: '14px', margin: '4px 0 0 0' }}>
                        Real-time burn rate, dark-pattern shields, and usage ROI tracking
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                        onClick={onRefresh}
                        style={{
                            background: '#1f2937',
                            color: '#d1d5db',
                            border: '1px solid #374151',
                            padding: '9px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        🔄 Refresh
                    </button>
                    <button
                        onClick={onOpenRoiModal}
                        style={{
                            background: 'rgba(139, 92, 246, 0.15)',
                            color: '#c084fc',
                            border: '1px solid rgba(139, 92, 246, 0.35)',
                            padding: '9px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <span>🧟 Cost-Per-Use & Zombies</span>
                        {roiData?.zombieCount > 0 && (
                            <span style={{ background: '#ef4444', color: '#fff', fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }}>
                                {roiData.zombieCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => onOpenAiAssistant()}
                        style={{
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: '#a5b4fc',
                            border: '1px solid rgba(99, 102, 241, 0.35)',
                            padding: '9px 16px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '700',
                            cursor: 'pointer'
                        }}
                    >
                        🤖 AI Assistant
                    </button>
                    <button
                        onClick={onAddClick}
                        style={{
                            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                            color: '#fff',
                            border: 'none',
                            padding: '9px 18px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                        }}
                    >
                        + Add Subscription
                    </button>
                </div>
            </div>

            {/* Smart Anomaly & Price-Hike Banner */}
            <AnomalyBanner anomalies={anomalies} onOpenAiAssistant={onOpenAiAssistant} />

            {/* Top Metric Cards: Burn Rate, Budget Tracker, Active Subs & Zombie Waste */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                {/* Metric 1: Monthly Burn Rate */}
                <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: '14px', padding: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>
                        <span>Monthly Burn Rate</span>
                        <span>🔥</span>
                    </div>
                    <div style={{ fontSize: '34px', fontWeight: '900', color: '#f3f4f6', marginTop: '8px' }}>
                        ${totalSpend.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
                        Annualized: <strong style={{ color: '#d1d5db' }}>${(totalSpend * 12).toFixed(2)}/yr</strong>
                    </div>
                </div>

                {/* Metric 2: Budget Limit Tracker with Progress Bar & Inline Editor */}
                <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: '14px', padding: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#9ca3af', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>
                            Budget Limit Tracker
                        </span>
                        <button
                            onClick={() => { setTempBudget(budgetLimit); setEditingBudget(!editingBudget); }}
                            style={{ background: 'transparent', border: 'none', color: '#818cf8', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                        >
                            {editingBudget ? 'Cancel' : 'Edit Limit'}
                        </button>
                    </div>

                    {editingBudget ? (
                        <form onSubmit={handleSaveBudget} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                            <input
                                type="number"
                                step="5"
                                min="10"
                                value={tempBudget}
                                onChange={(e) => setTempBudget(e.target.value)}
                                style={{ width: '90px', padding: '6px 10px', background: '#1f2937', border: '1px solid #4b5563', borderRadius: '6px', color: '#fff', fontSize: '14px' }}
                            />
                            <button
                                type="submit"
                                style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}
                            >
                                Save
                            </button>
                        </form>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
                            <span style={{ fontSize: '28px', fontWeight: '900', color: isOverBudget ? '#ef4444' : '#10b981' }}>
                                ${totalSpend.toFixed(2)}
                            </span>
                            <span style={{ fontSize: '14px', color: '#9ca3af' }}>
                                / ${budgetLimit.toFixed(2)} limit
                            </span>
                        </div>
                    )}

                    {/* Visual Progress Bar */}
                    <div style={{ width: '100%', height: '8px', background: '#1f2937', borderRadius: '4px', marginTop: '12px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${budgetPercent}%`,
                            height: '100%',
                            background: isOverBudget ? '#ef4444' : (budgetPercent > 80 ? '#f59e0b' : '#10b981'),
                            borderRadius: '4px',
                            transition: 'width 0.3s ease'
                        }}></div>
                    </div>

                    <div style={{ fontSize: '12px', color: isOverBudget ? '#f87171' : '#9ca3af', marginTop: '6px' }}>
                        {isOverBudget 
                            ? `⚠️ Over budget by $${(totalSpend - budgetLimit).toFixed(2)}!`
                            : `✓ ${(budgetLimit - totalSpend).toFixed(2)} remaining (${100 - budgetPercent}% buffer)`}
                    </div>
                </div>

                {/* Metric 3: Active Subscriptions & Categories */}
                <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: '14px', padding: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#9ca3af', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>
                        <span>Active Subscriptions</span>
                        <span>📊</span>
                    </div>
                    <div style={{ fontSize: '34px', fontWeight: '900', color: '#f3f4f6', marginTop: '8px' }}>
                        {subscriptions.filter(s => s.status === 'ACTIVE').length} <span style={{ fontSize: '16px', fontWeight: 'normal', color: '#9ca3af' }}>/ {subscriptions.length} total</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
                        Across {analytics?.categoryBreakdown?.length || 3} categories
                    </div>
                </div>

                {/* Metric 4: Zombie Subscriptions Alert Card */}
                <div
                    onClick={onOpenRoiModal}
                    style={{
                        background: (roiData?.zombieCount || 0) > 0 ? 'rgba(239, 68, 68, 0.08)' : '#111827',
                        border: (roiData?.zombieCount || 0) > 0 ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid #374151',
                        borderRadius: '14px',
                        padding: '22px',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: (roiData?.zombieCount || 0) > 0 ? '#f87171' : '#9ca3af', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>
                        <span>Zombie Subs (Unused &gt;60d)</span>
                        <span>🧟</span>
                    </div>
                    <div style={{ fontSize: '34px', fontWeight: '900', color: (roiData?.zombieCount || 0) > 0 ? '#ef4444' : '#10b981', marginTop: '8px' }}>
                        {roiData?.zombieCount ?? 0}
                    </div>
                    <div style={{ fontSize: '13px', color: (roiData?.zombieCount || 0) > 0 ? '#fca5a5' : '#9ca3af', marginTop: '4px' }}>
                        {(roiData?.zombieCount || 0) > 0
                            ? `Draining $${roiData?.totalZombieWasteMonthly?.toFixed(2)}/mo ($${roiData?.potentialAnnualSavings?.toFixed(2)}/yr)! Click to review.`
                            : 'No dormant subscriptions detected.'}
                    </div>
                </div>
            </div>

            {/* AI Advisor Recommendation Panel */}
            {insights && (
                <div style={{
                    background: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '14px',
                    padding: '20px 24px',
                    marginBottom: '32px',
                    borderLeft: '4px solid #6366f1'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '20px' }}>🤖</span>
                        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#a5b4fc', margin: 0 }}>
                            SubShield AI Financial Advisor
                        </h3>
                    </div>
                    <p style={{ fontWeight: '700', color: '#f3f4f6', fontSize: '14px', margin: '0 0 6px 0' }}>
                        {insights.status}
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#9ca3af', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {insights.recommendations?.map((rec, i) => (
                            <li key={i}>{rec}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Subscriptions Table & Filter Bar */}
            <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: '1 1 300px' }}>
                        {/* Search Input */}
                        <input
                            type="text"
                            placeholder="Search subscriptions by name or category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                padding: '9px 14px',
                                background: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '13px',
                                width: '280px'
                            }}
                        />

                        {/* Status Filters */}
                        <div style={{ display: 'flex', background: '#1f2937', padding: '3px', borderRadius: '8px', border: '1px solid #374151' }}>
                            {['ALL', 'ACTIVE', 'ZOMBIE', 'CANCELLED'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => setStatusFilter(st)}
                                    style={{
                                        background: statusFilter === st ? '#4f46e5' : 'transparent',
                                        color: statusFilter === st ? '#fff' : '#9ca3af',
                                        border: 'none',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {st === 'ZOMBIE' ? '🧟 Zombies' : st}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>Category:</span>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                background: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '13px'
                            }}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Subscriptions Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '780px' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #374151', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                <th style={{ padding: '12px 14px' }}>Service & Category</th>
                                <th style={{ padding: '12px 14px' }}>Billing Cycle</th>
                                <th style={{ padding: '12px 14px' }}>Cost & Baseline</th>
                                <th style={{ padding: '12px 14px' }}>Cost-Per-Use ROI</th>
                                <th style={{ padding: '12px 14px' }}>Usage Tracker</th>
                                <th style={{ padding: '12px 14px' }}>Status</th>
                                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Defense Actions</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '14px' }}>
                            {filteredSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                                        No matching subscriptions found. Click "+ Add Subscription" to track a service!
                                    </td>
                                </tr>
                            ) : (
                                filteredSubscriptions.map((sub) => {
                                    // Usage and zombie calculations
                                    const uses = Number(sub.usage_count) || 0;
                                    const amount = Number(sub.amount) || 0;
                                    const costPerUse = uses > 0 ? (amount / uses).toFixed(2) : amount.toFixed(2);
                                    
                                    const daysIdle = sub.last_used_date 
                                        ? Math.floor(Math.abs(new Date() - new Date(sub.last_used_date)) / (1000 * 60 * 60 * 24))
                                        : 90;
                                    const isZombie = (daysIdle >= 60 || (uses === 0 && daysIdle >= 30)) && sub.status === 'ACTIVE';

                                    // Price hike check
                                    const baseAmount = Number(sub.historical_base_amount);
                                    const hasPriceHike = baseAmount && amount > baseAmount;
                                    const hikePct = hasPriceHike ? Math.round(((amount - baseAmount) / baseAmount) * 100) : 0;

                                    return (
                                        <tr
                                            key={sub.id || sub.paypal_sub_id}
                                            style={{
                                                borderBottom: '1px solid #1f2937',
                                                background: isZombie ? 'rgba(239, 68, 68, 0.04)' : 'transparent'
                                            }}
                                        >
                                            {/* Service & Category */}
                                            <td style={{ padding: '14px' }}>
                                                <div style={{ fontWeight: '700', color: '#f9fafb' }}>
                                                    {sub.name}
                                                </div>
                                                <span style={{
                                                    fontSize: '11px',
                                                    color: '#9ca3af',
                                                    background: '#1f2937',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    display: 'inline-block',
                                                    marginTop: '4px'
                                                }}>
                                                    {sub.category || 'Other'}
                                                </span>
                                            </td>

                                            {/* Billing Cycle */}
                                            <td style={{ padding: '14px', color: '#9ca3af' }}>
                                                {sub.billing_cycle || 'MONTHLY'}
                                            </td>

                                            {/* Cost & Baseline */}
                                            <td style={{ padding: '14px' }}>
                                                <div style={{ fontWeight: '700', color: '#f3f4f6' }}>
                                                    ${amount.toFixed(2)}
                                                </div>
                                                {hasPriceHike && (
                                                    <div style={{ fontSize: '11px', color: '#f87171', fontWeight: '700', marginTop: '2px' }}>
                                                        📈 +{hikePct}% hike (was ${baseAmount.toFixed(2)})
                                                    </div>
                                                )}
                                            </td>

                                            {/* Cost-Per-Use ROI Score */}
                                            <td style={{ padding: '14px' }}>
                                                <div style={{ fontWeight: '800', color: isZombie ? '#ef4444' : '#10b981' }}>
                                                    ${costPerUse} <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'normal' }}>/ use</span>
                                                </div>
                                                <div style={{ marginTop: '3px' }}>
                                                    {isZombie ? (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            fontWeight: '800',
                                                            background: 'rgba(239, 68, 68, 0.2)',
                                                            color: '#f87171',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px'
                                                        }}>
                                                            🚨 ZOMBIE ({daysIdle}d idle)
                                                        </span>
                                                    ) : (
                                                        <span style={{
                                                            fontSize: '10px',
                                                            fontWeight: '700',
                                                            background: uses >= 10 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                                            color: uses >= 10 ? '#34d399' : '#60a5fa',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px'
                                                        }}>
                                                            {uses >= 10 ? 'High ROI' : 'Moderate ROI'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Quick Usage Tracker */}
                                            <td style={{ padding: '14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '13px', color: '#d1d5db', fontWeight: '600' }}>
                                                        {uses} uses
                                                    </span>
                                                    <button
                                                        onClick={() => onLogUsage(sub.id, uses)}
                                                        title="Log usage for today"
                                                        style={{
                                                            background: '#1f2937',
                                                            border: '1px solid #4b5563',
                                                            color: '#a5b4fc',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontSize: '11px',
                                                            fontWeight: '700',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        +1 Use
                                                    </button>
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '3px' }}>
                                                    Last: {sub.last_used_date || 'Never'}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td style={{ padding: '14px' }}>
                                                <span style={{
                                                    padding: '3px 9px',
                                                    borderRadius: '6px',
                                                    fontSize: '11px',
                                                    fontWeight: '800',
                                                    background: sub.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                    color: sub.status === 'ACTIVE' ? '#34d399' : '#f87171'
                                                }}>
                                                    {sub.status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: '14px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                                                    {/* AI Assistant Button */}
                                                    <button
                                                        onClick={() => onOpenAiAssistant({
                                                            id: sub.id,
                                                            name: sub.name,
                                                            amount: sub.amount,
                                                            currency: sub.currency,
                                                            strategy: isZombie ? 'ZOMBIE_INACTIVITY' : (hasPriceHike ? 'UNEXPECTED_HIKE' : 'FTC_DARK_PATTERN')
                                                        })}
                                                        title="Open AI Cancellation & Dark-Pattern Assistant"
                                                        style={{
                                                            background: '#4f46e5',
                                                            color: '#fff',
                                                            border: 'none',
                                                            padding: '6px 10px',
                                                            borderRadius: '6px',
                                                            fontSize: '12px',
                                                            fontWeight: '700',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        🤖 AI Assist
                                                    </button>

                                                    {/* Cancel PayPal */}
                                                    {sub.status === 'ACTIVE' && (
                                                        <button
                                                            onClick={() => onCancelSubscription(sub.paypal_sub_id || sub.id, sub.name)}
                                                            style={{
                                                                background: 'rgba(239, 68, 68, 0.12)',
                                                                color: '#f87171',
                                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                                padding: '6px 10px',
                                                                borderRadius: '6px',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => onDeleteSubscription(sub.id)}
                                                        title="Remove from SubShield"
                                                        style={{
                                                            background: 'transparent',
                                                            color: '#6b7280',
                                                            border: 'none',
                                                            padding: '6px',
                                                            cursor: 'pointer',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

