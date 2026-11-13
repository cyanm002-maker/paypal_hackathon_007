import React, { useState, useEffect } from 'react';
import { 
    Bot, 
    X, 
    Mail, 
    MessageSquare, 
    Shield, 
    Copy, 
    Check, 
    Sparkles, 
    Scale, 
    Send,
    TrendingDown,
    AlertTriangle,
    SlidersHorizontal,
    Layers,
    ArrowRight
} from 'lucide-react';
import { 
    generateCancellationScript, 
    getLiveChatCopilot, 
    getAlternatives, 
    getAuditTerms 
} from '../services/api';

export default function AiAssistantModal({ isOpen, onClose, initialData = null, subscriptions = [], onMarkCancelled }) {
    const [selectedSubId, setSelectedSubId] = useState(initialData?.id || '');
    const [serviceName, setServiceName] = useState(initialData?.name || '');
    const [amount, setAmount] = useState(initialData?.amount || '');
    const [currency, setCurrency] = useState(initialData?.currency || 'USD');
    const [category, setCategory] = useState(initialData?.category || 'Other');
    const [strategy, setStrategy] = useState(initialData?.strategy || 'FTC_DARK_PATTERN');
    const [tone, setTone] = useState('FIRM_LEGAL');
    const [userReason, setUserReason] = useState(initialData?.userReason || '');
    
    // Core modes: 'email' | 'copilot' | 'auditor' | 'arbitrage' | 'playbook'
    const [activeTab, setActiveTab] = useState('email');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    // Feature 1: Cancellation Pack Output
    const [generatedScript, setGeneratedScript] = useState(null);

    // Feature 2: Real-time Live Chat Copilot States
    const [copilotInput, setCopilotInput] = useState('');
    const [copilotGoal, setCopilotGoal] = useState('CANCEL_IMMEDIATELY');
    const [copilotResult, setCopilotResult] = useState(null);
    const [copilotLoading, setCopilotLoading] = useState(false);

    // Feature 3: Terms Fine-Print Auditor States
    const [auditResult, setAuditResult] = useState(null);
    const [auditLoading, setAuditLoading] = useState(false);
    const [customTermsText, setCustomTermsText] = useState('');

    // Feature 4: Competitor & Alternative Arbitrage States
    const [arbitrageResult, setArbitrageResult] = useState(null);
    const [arbitrageLoading, setArbitrageLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setServiceName(initialData.name || '');
            setAmount(initialData.amount || '');
            setCurrency(initialData.currency || 'USD');
            if (initialData.category) setCategory(initialData.category);
            if (initialData.strategy) setStrategy(initialData.strategy);
            if (initialData.userReason) setUserReason(initialData.userReason);
        } else if (subscriptions.length > 0 && !serviceName) {
            const first = subscriptions[0];
            setSelectedSubId(first.id);
            setServiceName(first.name);
            setAmount(first.amount);
            setCurrency(first.currency || 'USD');
            setCategory(first.category || 'Other');
        }
    }, [initialData, subscriptions]);

    const handleSelectChange = (e) => {
        const id = e.target.value;
        setSelectedSubId(id);
        const sub = subscriptions.find(s => String(s.id) === String(id));
        if (sub) {
            setServiceName(sub.name);
            setAmount(sub.amount);
            setCurrency(sub.currency || 'USD');
            setCategory(sub.category || 'Other');
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setCopied(false);
        try {
            const res = await generateCancellationScript({
                serviceName: serviceName || 'Service',
                amount: amount || '19.99',
                currency: currency || 'USD',
                strategy,
                tone,
                userReason
            });
            if (res?.script) {
                setGeneratedScript(res.script);
            }
        } catch (err) {
            console.error('Failed to generate script:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRunCopilot = async (e) => {
        if (e) e.preventDefault();
        if (!copilotInput.trim()) return;
        setCopilotLoading(true);
        try {
            const res = await getLiveChatCopilot({
                serviceName: serviceName || 'Service',
                agentMessage: copilotInput,
                userGoal: copilotGoal
            });
            if (res?.copilot) {
                setCopilotResult(res.copilot);
            }
        } catch (err) {
            console.error('Live chat copilot failed:', err);
        } finally {
            setCopilotLoading(false);
        }
    };

    const handleRunAudit = async () => {
        setAuditLoading(true);
        try {
            const res = await getAuditTerms({
                serviceName: serviceName || 'Service',
                termsText: customTermsText
            });
            if (res?.audit) {
                setAuditResult(res.audit);
            }
        } catch (err) {
            console.error('Audit terms failed:', err);
        } finally {
            setAuditLoading(false);
        }
    };

    const handleRunArbitrage = async () => {
        setArbitrageLoading(true);
        try {
            const res = await getAlternatives({
                serviceName: serviceName || 'Service',
                currentAmount: Number(amount) || 20,
                currency: currency || 'USD',
                category: category || 'Other'
            });
            if (res?.arbitrage) {
                setArbitrageResult(res.arbitrage);
            }
        } catch (err) {
            console.error('Arbitrage lookup failed:', err);
        } finally {
            setArbitrageLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && serviceName) {
            handleGenerate();
        }
    }, [isOpen]);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.84)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 110,
            padding: '20px'
        }}>
            <div style={{
                background: '#0d131f',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '860px',
                maxHeight: '92vh',
                overflowY: 'auto',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
                color: '#f8fafc',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Modal Header */}
                <div style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#121826'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#818cf8'
                        }}>
                            <Bot size={18} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#f8fafc' }}>
                                    AI Financial Defense & Dark-Pattern Engine
                                </h2>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    background: 'rgba(99, 102, 241, 0.2)',
                                    color: '#a5b4fc',
                                    border: '1px solid rgba(99, 102, 241, 0.4)'
                                }}>
                                    OpenRouter LLM
                                </span>
                            </div>
                            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                                Real-time chat de-escalation, terms auditing, and competitor arbitrage
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Configuration Bar */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: '#090d16' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>
                                Target Service
                            </label>
                            {subscriptions.length > 0 ? (
                                <select
                                    value={selectedSubId}
                                    onChange={handleSelectChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        background: '#121826',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '13px'
                                    }}
                                >
                                    {subscriptions.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} ({s.currency} {s.amount})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={serviceName}
                                    onChange={(e) => setServiceName(e.target.value)}
                                    placeholder="Service name (e.g. Adobe, Gym, Netflix)"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        background: '#121826',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '13px'
                                    }}
                                />
                            )}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>
                                Primary Directive
                            </label>
                            <select
                                value={strategy}
                                onChange={(e) => setStrategy(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    background: '#121826',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '13px'
                                }}
                            >
                                <option value="FTC_DARK_PATTERN">Bypass Dark Pattern (FTC Click-to-Cancel)</option>
                                <option value="RETENTION_DISCOUNT">Negotiate 50% Retention Discount</option>
                                <option value="UNEXPECTED_HIKE">Dispute Unauthorized Price Increase</option>
                                <option value="ZOMBIE_INACTIVITY">Decommission Dormant Account</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '5px' }}>
                                Letter Tone
                            </label>
                            <select
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    background: '#121826',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    fontSize: '13px'
                                }}
                            >
                                <option value="FIRM_LEGAL">Strict Legal (FTC Statutory Citations)</option>
                                <option value="POLITE_PERSUASIVE">Polite & Promotional Matching</option>
                                <option value="STUDENT_HARDSHIP">Financial Hardship / Downgrade</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* SubShield Multi-Feature Tab Navigation */}
                <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '12px 24px', background: '#0e1422', overflowX: 'auto' }}>
                    <button
                        onClick={() => setActiveTab('email')}
                        style={{
                            background: activeTab === 'email' ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                            color: activeTab === 'email' ? '#c7d2fe' : '#94a3b8',
                            border: activeTab === 'email' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Mail size={13} />
                        <span>Cancellation Letter</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('copilot')}
                        style={{
                            background: activeTab === 'copilot' ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                            color: activeTab === 'copilot' ? '#c7d2fe' : '#94a3b8',
                            border: activeTab === 'copilot' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <MessageSquare size={13} />
                        <span>Live Chat Copilot</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('auditor'); if (!auditResult) handleRunAudit(); }}
                        style={{
                            background: activeTab === 'auditor' ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                            color: activeTab === 'auditor' ? '#c7d2fe' : '#94a3b8',
                            border: activeTab === 'auditor' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <AlertTriangle size={13} />
                        <span>Terms & Fine-Print Auditor</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('arbitrage'); if (!arbitrageResult) handleRunArbitrage(); }}
                        style={{
                            background: activeTab === 'arbitrage' ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                            color: activeTab === 'arbitrage' ? '#c7d2fe' : '#94a3b8',
                            border: activeTab === 'arbitrage' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <TrendingDown size={13} />
                        <span>Competitor Arbitrage</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('playbook')}
                        style={{
                            background: activeTab === 'playbook' ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                            color: activeTab === 'playbook' ? '#c7d2fe' : '#94a3b8',
                            border: activeTab === 'playbook' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12.5px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Shield size={13} />
                        <span>FTC Compliance Playbook</span>
                    </button>
                </div>

                {/* Tab 1: Formal Cancellation Notice */}
                {activeTab === 'email' && generatedScript && (
                    <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ background: '#121826', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Subject Line:</span>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#a5b4fc', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                                {generatedScript.subject}
                            </div>
                        </div>

                        <textarea
                            readOnly
                            value={generatedScript.emailBody}
                            rows={11}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: '#07090e',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '8px',
                                color: '#cbd5e1',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '12.5px',
                                lineHeight: '1.65',
                                resize: 'vertical'
                            }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap', gap: '8px' }}>
                            <button
                                onClick={() => copyToClipboard(`Subject: ${generatedScript.subject}\n\n${generatedScript.emailBody}`)}
                                style={{
                                    background: copied ? '#059669' : '#4f46e5',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '9px 18px',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                <span>{copied ? 'Copied to Clipboard' : 'Copy Full Script'}</span>
                            </button>

                            {onMarkCancelled && selectedSubId && (
                                <button
                                    onClick={() => {
                                        onMarkCancelled(selectedSubId);
                                        onClose();
                                    }}
                                    style={{
                                        background: 'rgba(244, 63, 94, 0.1)',
                                        color: '#fb7185',
                                        border: '1px solid rgba(244, 63, 94, 0.25)',
                                        padding: '9px 15px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Mark as Cancelled in SubShield
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab 2: Real-time Live Chat Copilot */}
                {activeTab === 'copilot' && (
                    <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 4px 0' }}>
                                Real-Time Support Chat De-escalator
                            </h3>
                            <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0 }}>
                                Paste what the customer representative just said in your live chat. SubShield analyzes the psychological dark pattern and crafts an instant legal rebuttal.
                            </p>
                        </div>

                        <form onSubmit={handleRunCopilot} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600' }}>Your Target Goal:</label>
                                <select
                                    value={copilotGoal}
                                    onChange={(e) => setCopilotGoal(e.target.value)}
                                    style={{
                                        padding: '6px 10px',
                                        background: '#121826',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '6px',
                                        color: '#fff',
                                        fontSize: '12px'
                                    }}
                                >
                                    <option value="CANCEL_IMMEDIATELY">Enforce Immediate Full Cancellation</option>
                                    <option value="FORCE_DISCOUNT">Demand 50% Loyalty Discount</option>
                                    <option value="DISPUTE_FEE">Dispute Unauthorized Renewal Fee</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    placeholder='Paste support rep message (e.g. "You must call our phone line to complete this" or "We can offer 2 months at $3.99")...'
                                    value={copilotInput}
                                    onChange={(e) => setCopilotInput(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '11px 14px',
                                        background: '#07090e',
                                        border: '1px solid rgba(255, 255, 255, 0.12)',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        fontSize: '13px'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={copilotLoading || !copilotInput.trim()}
                                    style={{
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '11px 18px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: copilotLoading ? 'wait' : 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <Send size={14} />
                                    <span>{copilotLoading ? 'Analyzing...' : 'Counter Rep'}</span>
                                </button>
                            </div>
                        </form>

                        {/* Copilot Response Output */}
                        {copilotResult && (
                            <div style={{
                                background: '#121826',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                borderRadius: '12px',
                                padding: '18px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <AlertTriangle size={15} color="#fbbf24" />
                                        <span style={{ fontSize: '12px', fontWeight: '700', color: '#fbbf24', textTransform: 'uppercase' }}>
                                            Pattern Identified: {copilotResult.darkPatternIdentified}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>OpenRouter LLM Synthesis</span>
                                </div>

                                <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0 }}>
                                    {copilotResult.patternExplanation}
                                </p>

                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#a5b4fc', textTransform: 'uppercase', marginBottom: '6px' }}>
                                        Copy-Paste Rebuttal:
                                    </div>
                                    <div style={{
                                        background: '#07090e',
                                        padding: '12px 14px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        fontSize: '13px',
                                        color: '#f8fafc',
                                        lineHeight: '1.5',
                                        fontFamily: 'var(--font-mono)'
                                    }}>
                                        {copilotResult.rebuttalSnippet}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                    <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '500' }}>
                                        Tactical tip: {copilotResult.proTip}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(copilotResult.rebuttalSnippet)}
                                        style={{
                                            background: copied ? '#059669' : '#4f46e5',
                                            color: '#fff',
                                            border: 'none',
                                            padding: '7px 14px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px'
                                        }}
                                    >
                                        {copied ? <Check size={13} /> : <Copy size={13} />}
                                        <span>{copied ? 'Copied' : 'Copy Rebuttal'}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 3: Terms & Fine-Print Auditor */}
                {activeTab === 'auditor' && (
                    <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 4px 0' }}>
                                Contract Fine-Print & Dark Pattern Auditor
                            </h3>
                            <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0 }}>
                                Audits cancellation friction, notice requirements, and early termination penalties for {serviceName}.
                            </p>
                        </div>

                        {auditLoading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                Auditing contract terms and cancellation barriers via OpenRouter...
                            </div>
                        ) : auditResult ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {/* Severity Score Card */}
                                <div style={{
                                    background: '#121826',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '12px',
                                    padding: '18px 22px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '12px'
                                }}>
                                    <div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>
                                            Dark Pattern Friction Score
                                        </div>
                                        <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: auditResult.darkPatternScore > 65 ? '#fb7185' : '#fbbf24', marginTop: '2px' }}>
                                            {auditResult.darkPatternScore} <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 'normal' }}>/ 100</span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
                                            Cancellation Barrier: <strong>{auditResult.cancellationDifficulty}</strong>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '11.5px',
                                            fontWeight: '700',
                                            background: auditResult.riskLevel === 'HIGH' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                            color: auditResult.riskLevel === 'HIGH' ? '#fb7185' : '#fbbf24',
                                            border: auditResult.riskLevel === 'HIGH' ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                                        }}>
                                            {auditResult.riskLevel} CONSUMER RISK
                                        </span>
                                    </div>
                                </div>

                                {/* Red Flag Clauses */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#e2e8f0', textTransform: 'uppercase' }}>
                                        Flagged Contract Clauses:
                                    </div>
                                    {auditResult.criticalClauses?.map((c, i) => (
                                        <div key={i} style={{ background: '#121826', padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>{c.clause}</span>
                                                <span style={{ fontSize: '10px', fontWeight: '700', color: c.severity === 'HIGH' ? '#fb7185' : '#fbbf24' }}>
                                                    {c.severity} SEVERITY
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                                                {c.risk}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '14px', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#34d399', textTransform: 'uppercase', marginBottom: '4px' }}>
                                        Recommended Escape Strategy:
                                    </div>
                                    <p style={{ fontSize: '12.5px', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>
                                        {auditResult.recommendedAction}
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* Tab 4: Competitor & Alternative Arbitrage */}
                {activeTab === 'arbitrage' && (
                    <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 4px 0' }}>
                                Competitor & Alternative Arbitrage Engine
                            </h3>
                            <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0 }}>
                                AI market scanner matching {serviceName} against free open-source tools and plan downgrade loopholes.
                            </p>
                        </div>

                        {arbitrageLoading ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                Scanning competitor pricing and open-source equivalents via OpenRouter...
                            </div>
                        ) : arbitrageResult ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                                {/* Free/Open-Source Card */}
                                <div style={{ background: '#121826', padding: '18px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#34d399', textTransform: 'uppercase' }}>
                                        Free / Open-Source (FOSS)
                                    </span>
                                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: '6px 0 2px' }}>
                                        {arbitrageResult.freeOrOpenSourceAlternative?.name}
                                    </h4>
                                    <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px', lineHeight: '1.45' }}>
                                        {arbitrageResult.freeOrOpenSourceAlternative?.description}
                                    </div>
                                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px' }}>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Annual Potential Savings:</span>
                                        <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                                            {arbitrageResult.freeOrOpenSourceAlternative?.estimatedAnnualSavings}
                                        </div>
                                    </div>
                                </div>

                                {/* Cheaper Commercial Competitor */}
                                <div style={{ background: '#121826', padding: '18px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#818cf8', textTransform: 'uppercase' }}>
                                        Budget Alternative Tier
                                    </span>
                                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', margin: '6px 0 2px' }}>
                                        {arbitrageResult.cheaperCommercialCompetitor?.name}
                                    </h4>
                                    <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px', lineHeight: '1.45' }}>
                                        {arbitrageResult.cheaperCommercialCompetitor?.advantage} (Typical: {arbitrageResult.cheaperCommercialCompetitor?.typicalPrice})
                                    </div>
                                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px' }}>
                                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>Annual Potential Savings:</span>
                                        <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#818cf8' }}>
                                            {arbitrageResult.cheaperCommercialCompetitor?.estimatedAnnualSavings}
                                        </div>
                                    </div>
                                </div>

                                {/* Arbitrage Hack Full Width */}
                                <div style={{ gridColumn: '1 / -1', background: '#0e1422', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#fbbf24', textTransform: 'uppercase', marginBottom: '4px' }}>
                                        Plan Arbitrage Hack for {serviceName}:
                                    </div>
                                    <p style={{ fontSize: '13px', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>
                                        {arbitrageResult.arbitrageHack}
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* Tab 5: FTC Compliance Playbook */}
                {activeTab === 'playbook' && (
                    <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '14px', borderRadius: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>
                                <Scale size={16} />
                                <span>Federal Trade Commission (FTC) "Click-to-Cancel" Rule</span>
                            </div>
                            <p style={{ color: '#cbd5e1', fontSize: '12.5px', margin: 0, lineHeight: '1.55' }}>
                                Under FTC enforcement guidelines, companies cannot require phone calls, multi-page retention surveys, or confusing labyrinth flows to terminate subscriptions enrolled online.
                            </p>
                        </div>

                        <div style={{ background: '#121826', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                            <h4 style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: '700', margin: '0 0 8px 0' }}>
                                Defense Tactics for {serviceName}:
                            </h4>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#94a3b8', fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <li style={{ color: '#e2e8f0' }}>Always decline the option to "pause" subscription—it auto-unpauses and resumes billing.</li>
                                <li style={{ color: '#e2e8f0' }}>Revoke PayPal pre-approvals via PayPal Settings &gt; Payments &gt; Automatic Payments.</li>
                                <li style={{ color: '#e2e8f0' }}>If charged post-notice, submit a dispute with your bank citing unauthorized recurring billing.</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
