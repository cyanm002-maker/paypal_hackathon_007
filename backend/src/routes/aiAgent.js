const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { callOpenRouter, isOpenRouterAvailable } = require("../services/openrouter");

// 1. GET /api/agent/insights - Budget Advisor & Spending Health
router.get("/insights", (req, res) => {
    const userBudget = parseFloat(req.query.budget) || 50.00;

    const query = `
        SELECT 
            SUM(CASE WHEN status = 'ACTIVE' THEN CAST(amount AS REAL) ELSE 0 END) AS totalSpend,
            COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) AS activeCount
        FROM subscriptions;
    `;

    db.get(query, [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const currentSpend = Number(row?.totalSpend) || 0;
        const activeCount = Number(row?.activeCount) || 0;

        const recommendations = [];
        let statusMessage = "Your subscriptions are looking healthy!";
        let healthScore = 85;

        if (currentSpend > userBudget) {
            const overage = currentSpend - userBudget;
            statusMessage = "Budget Warning: Spending exceeds your monthly target ceiling";
            recommendations.push(`You are spending $${currentSpend.toFixed(2)}/mo, which is $${overage.toFixed(2)} above your $${userBudget.toFixed(2)} target.`);
            recommendations.push("Decommission inactive accounts or request loyalty retention discounts to restore margin.");
            healthScore = Math.max(30, Math.round(100 - (overage / userBudget) * 60));
        } else {
            const remaining = userBudget - currentSpend;
            const pctUsed = userBudget > 0 ? Math.round((currentSpend / userBudget) * 100) : 0;
            statusMessage = `Optimal: Monthly allocation is within safe thresholds (${pctUsed}% utilized).`;
            recommendations.push(`You have $${remaining.toFixed(2)} in headroom under your monthly budget limit.`);
            healthScore = 90;
        }

        if (activeCount >= 4) {
            recommendations.push(`You maintain ${activeCount} active recurring services. Audit category overlap to verify you are not paying for redundant tiers.`);
        }

        res.json({
            success: true,
            agent_analysis: {
                monthly_budget: userBudget,
                current_monthly_spend: Number(currentSpend.toFixed(2)),
                active_subscriptions: activeCount,
                health_score: healthScore,
                status: statusMessage,
                recommendations: recommendations,
                llm_powered: isOpenRouterAvailable()
            }
        });
    });
});

// 2. POST /api/agent/cancellation-script - AI Cancellation & Negotiation Assistant (OpenRouter LLM + Fallback)
router.post("/cancellation-script", async (req, res) => {
    const {
        serviceName = "Service",
        amount = "19.99",
        currency = "USD",
        strategy = "FTC_DARK_PATTERN",
        tone = "FIRM_LEGAL",
        userReason = ""
    } = req.body || {};

    const formattedAmount = `${currency} ${amount}`;
    const dateToday = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // If OpenRouter is available, generate bespoke, highly contextual output via LLM
    if (isOpenRouterAvailable()) {
        try {
            const systemPrompt = `You are SubShield's Senior Consumer Protection Attorney and Anti-Dark-Pattern Negotiator.
Your goal is to generate an ironclad, legally formidable cancellation letter or aggressive discount negotiation for the user.
You cite real federal and state statutory provisions when applicable:
- FTC "Click-to-Cancel" Rule (16 CFR Part 425 / 89 FR 85724)
- California Automatic Renewal Law (Cal. Bus. & Prof. Code § 17602)
- Restore Online Shoppers' Confidence Act (ROSCA, 15 U.S.C. §§ 8401–8405)

You must output ONLY valid JSON matching this exact structure:
{
  "subject": "Clear, urgent email subject line",
  "emailBody": "Full, well-spaced letter/email with placeholders [Your Full Name], [Your Account Email]",
  "liveChatScript": [
    { "role": "Agent", "text": "Representative objection or retention pitch" },
    { "role": "You (AI Counter)", "text": "Exact lethal counter-response citing statutory rights" },
    { "role": "Agent", "text": "Second typical friction response (e.g. phone call or pause)" },
    { "role": "You (AI Counter)", "text": "Decisive counter-response demanding immediate confirmation number" }
  ],
  "playbookTips": [
    "Tactical tip 1",
    "Tactical tip 2",
    "Tactical tip 3"
  ]
}`;

            const userPrompt = `Generate a cancellation/negotiation pack for:
Service: "${serviceName}"
Renewal Rate: "${formattedAmount}"
Strategy: "${strategy}" (FTC_DARK_PATTERN = Demand immediate termination bypassing dark patterns; RETENTION_DISCOUNT = Demand 50% competitor price-matching to stay; UNEXPECTED_HIKE = Dispute stealth rate jump without explicit affirmative consent; ZOMBIE_INACTIVITY = Terminate dormant account with purge of payment details).
Tone: "${tone}"
User Context: "${userReason || 'None provided'}"
Date: "${dateToday}"

Output JSON only.`;

            const rawResponse = await callOpenRouter({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.3
            });

            // Parse JSON response safely
            const jsonText = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(jsonText);

            return res.json({
                success: true,
                llm: true,
                script: {
                    serviceName,
                    amount: formattedAmount,
                    strategy,
                    tone,
                    subject: parsed.subject,
                    emailBody: parsed.emailBody,
                    liveChatScript: parsed.liveChatScript,
                    playbookTips: parsed.playbookTips
                }
            });
        } catch (llmError) {
            console.warn("OpenRouter generation fallback triggered:", llmError.message);
            // Fall through to algorithmic backup below
        }
    }

    // Algorithmic Fallback Engine
    let subject = `IMMEDIATE CANCELLATION NOTICE - ${serviceName} [Account Email]`;
    let emailBody = `To Billing Department for ${serviceName},\n\nThis is formal notice to terminate my subscription to ${serviceName} (${formattedAmount}/period) immediately under FTC Click-to-Cancel regulations.\n\nDate: ${dateToday}\nSincerely,\n[Your Full Name]`;
    let liveChatScript = [
        { role: "Agent", text: "Would you like 3 months at 50% off to remain enrolled?" },
        { role: "You (AI Counter)", text: "No. Under FTC Click-to-Cancel enforcement, please terminate this subscription immediately and issue confirmation." }
    ];
    let playbookTips = [
        "Take a screenshot of this confirmation transcript.",
        "Revoke PayPal billing permissions in PayPal Settings > Payments > Automatic Payments."
    ];

    if (strategy === 'RETENTION_DISCOUNT') {
        subject = `Subscription Review: Request for promotional rate matching on ${serviceName}`;
        emailBody = `Hello ${serviceName} Retention Team,\n\nI am auditing recurring software expenses. Competitors are offering equivalent tiers at 40-50% below my ${formattedAmount}/mo rate. Can you match a 50% retention promo tier?\n\nSincerely,\n[Your Full Name]`;
    }

    res.json({
        success: true,
        llm: false,
        script: { serviceName, amount: formattedAmount, strategy, tone, subject, emailBody, liveChatScript, playbookTips }
    });
});

// 3. POST /api/agent/chat-copilot - Real-Time Live Chat Retention De-escalator
router.post("/chat-copilot", async (req, res) => {
    const {
        serviceName = "Service",
        agentMessage = "",
        userGoal = "CANCEL_IMMEDIATELY", // 'CANCEL_IMMEDIATELY' | 'FORCE_DISCOUNT' | 'DISPUTE_FEE'
        conversationHistory = []
    } = req.body || {};

    if (!agentMessage.trim()) {
        return res.status(400).json({ error: "agentMessage is required." });
    }

    if (isOpenRouterAvailable()) {
        try {
            const systemPrompt = `You are SubShield's Live Chat Copilot. The user is in an active customer service chat trying to cancel or negotiate with "${serviceName}".
The support representative just said: "${agentMessage}"
User Goal: "${userGoal}"

Analyze the agent's message. Identify their psychological retention dark pattern (e.g. Sunk Cost, Forced Phone Call, Pause Trap, Phantom Fee Threat, Survey Delay).
Formulate the exact killer reply the user can paste right now to bypass the friction. Cite FTC Click-to-Cancel regulations or California Automatic Renewal Law if relevant.

Return ONLY valid JSON:
{
  "darkPatternIdentified": "Short name of dark pattern tactic",
  "patternExplanation": "1-2 sentence explanation of why the agent is saying this",
  "rebuttalSnippet": "The exact concise, powerful response for the user to paste",
  "proTip": "Actionable instruction (e.g. 'Do not click pause', 'Demand ticket number')"
}`;

            const raw = await callOpenRouter({
                messages: [
                    { role: "system", content: systemPrompt },
                    ...conversationHistory.slice(-4),
                    { role: "user", content: `The agent just told me: "${agentMessage}". What do I say?` }
                ],
                temperature: 0.2
            });

            const jsonText = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(jsonText);

            return res.json({
                success: true,
                copilot: parsed
            });
        } catch (err) {
            console.error("Chat copilot LLM error:", err.message);
        }
    }

    // Default fallback
    res.json({
        success: true,
        copilot: {
            darkPatternIdentified: "Retention Deflection",
            patternExplanation: "Representative is attempting to delay termination with procedural friction.",
            rebuttalSnippet: "I understand your policy, but under FTC Click-to-Cancel rules, I am entitled to cancel online right now. Please process this cancellation immediately and provide my confirmation number.",
            proTip: "Remain firm and decline any offer to 'pause' or 'call a specialist'."
        }
    });
});

// 4. POST /api/agent/alternatives - Cheaper Alternative & Competitor Arbitrage Engine
router.post("/alternatives", async (req, res) => {
    const {
        serviceName = "Service",
        currentAmount = 20,
        currency = "USD",
        category = "General"
    } = req.body || {};

    if (isOpenRouterAvailable()) {
        try {
            const prompt = `Analyze the recurring service "${serviceName}" costing ${currency} ${currentAmount}/month in category "${category}".
Recommend:
1. Free or Open-Source alternative (FOSS)
2. Lower-cost commercial competitor
3. Plan arbitrage hack (secret student tier, annual bundle discount, regional trick, or downgrade loophole)
4. Estimated annual dollar savings if they switch

Output ONLY valid JSON:
{
  "serviceName": "${serviceName}",
  "currentAnnualCost": ${Number(currentAmount) * 12},
  "freeOrOpenSourceAlternative": {
    "name": "Alternative Name",
    "description": "What it is and how to use it",
    "cost": "$0/yr",
    "estimatedAnnualSavings": "${currency} ${(Number(currentAmount) * 12).toFixed(2)}"
  },
  "cheaperCommercialCompetitor": {
    "name": "Competitor Name",
    "typicalPrice": "$X/mo",
    "advantage": "Key benefit",
    "estimatedAnnualSavings": "${currency} ${(Number(currentAmount) * 6).toFixed(2)}"
  },
  "arbitrageHack": "Specific tactic to lower cost on ${serviceName} without leaving",
  "verdict": "Executive recommendation"
}`;

            const raw = await callOpenRouter({
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3
            });

            const jsonText = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(jsonText);

            return res.json({
                success: true,
                arbitrage: parsed
            });
        } catch (err) {
            console.error("Alternatives LLM error:", err.message);
        }
    }

    // Default fallback
    res.json({
        success: true,
        arbitrage: {
            serviceName,
            currentAnnualCost: Number(currentAmount) * 12,
            freeOrOpenSourceAlternative: {
                name: "Community Open-Source Alternative",
                description: "Free self-hosted or open-source tier with comparable core features.",
                cost: "$0/yr",
                estimatedAnnualSavings: `${currency} ${(Number(currentAmount) * 12).toFixed(2)}`
            },
            cheaperCommercialCompetitor: {
                name: "Budget Competitor Tier",
                typicalPrice: "50% lower",
                advantage: "Lean feature set without enterprise markup",
                estimatedAnnualSavings: `${currency} ${(Number(currentAmount) * 6).toFixed(2)}`
            },
            arbitrageHack: "Contact billing stating you received a competitor offer; ask for their unadvertised loyalty downgrade plan.",
            verdict: "Audit whether you utilize premium features or can transition to open-source."
        }
    });
});

// 5. POST /api/agent/audit-terms - Contract Fine-Print & Dark Pattern Auditor
router.post("/audit-terms", async (req, res) => {
    const { serviceName = "Subscription Service", termsText = "" } = req.body || {};

    if (isOpenRouterAvailable()) {
        try {
            const prompt = `Analyze the cancellation terms and contract fine print for the subscription service: "${serviceName}".
${termsText ? `Provided terms text: """${termsText}"""` : 'Use your internal legal knowledge of typical contracts and terms of service for this company.'}

Audit for consumer-hostile dark patterns:
- Hidden renewal price jumps
- Forced telephone calls or physical mail to cancel
- Early termination fees / liquidated damages
- Minimum notice windows (e.g. must give 30 days notice)
- Automatic conversion from free trial without notification

Output ONLY valid JSON:
{
  "serviceName": "${serviceName}",
  "darkPatternScore": 75,
  "riskLevel": "HIGH",
  "criticalClauses": [
    { "clause": "Clause name", "risk": "Description of consumer risk", "severity": "HIGH" },
    { "clause": "Notice requirement", "risk": "Must notify X days before renewal", "severity": "MEDIUM" }
  ],
  "cancellationDifficulty": "Hard / Multi-step / Mandatory hotline",
  "recommendedAction": "Actionable advice to neutralize this contract trap"
}`;

            const raw = await callOpenRouter({
                messages: [{ role: "user", content: prompt }],
                temperature: 0.2
            });

            const jsonText = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            const parsed = JSON.parse(jsonText);

            return res.json({
                success: true,
                audit: parsed
            });
        } catch (err) {
            console.error("Audit terms LLM error:", err.message);
        }
    }

    res.json({
        success: true,
        audit: {
            serviceName,
            darkPatternScore: 68,
            riskLevel: "MODERATE",
            criticalClauses: [
                { clause: "Continuous Auto-Renewal", risk: "Bills automatically without requiring affirmative renewal consent.", severity: "MEDIUM" },
                { clause: "Pre-Billing Window", risk: "May process charge up to 48 hours prior to renewal date.", severity: "HIGH" }
            ],
            cancellationDifficulty: "Moderate online friction",
            recommendedAction: "Cancel recurring pre-approval directly in PayPal to bypass merchant retention mazes."
        }
    });
});

module.exports = router;
