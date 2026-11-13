const express = require("express");
const router = express.Router();
const db = require("../config/database");

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

        // Smart agent evaluation logic
        if (currentSpend > userBudget) {
            const overage = currentSpend - userBudget;
            statusMessage = "⚠️ Budget Alert: You are exceeding your monthly subscription limit!";
            recommendations.push(`You are spending $${currentSpend.toFixed(2)}/mo, which is $${overage.toFixed(2)} over your $${userBudget.toFixed(2)} budget target.`);
            recommendations.push("Recommendation: Cancel flagged 'Zombie' subscriptions or negotiate a retention discount to immediately bring spending under control.");
            healthScore = Math.max(30, Math.round(100 - (overage / userBudget) * 60));
        } else {
            const remaining = userBudget - currentSpend;
            const pctUsed = userBudget > 0 ? Math.round((currentSpend / userBudget) * 100) : 0;
            statusMessage = `✅ Safe: Spending within budget (${pctUsed}% used).`;
            recommendations.push(`You have $${remaining.toFixed(2)} headroom left in your monthly budget.`);
            healthScore = 90;
        }

        if (activeCount >= 4) {
            recommendations.push(`You have ${activeCount} active recurring services. We recommend checking for category overlap (e.g. redundant streaming or cloud tiers).`);
        }

        res.json({
            success: true,
            agent_analysis: {
                monthly_budget: userBudget,
                current_monthly_spend: Number(currentSpend.toFixed(2)),
                active_subscriptions: activeCount,
                health_score: healthScore,
                status: statusMessage,
                recommendations: recommendations
            }
        });
    });
});

// 2. POST /api/agent/cancellation-script - AI Cancellation & Negotiation Assistant
router.post("/cancellation-script", (req, res) => {
    const {
        serviceName = "Service",
        amount = "19.99",
        currency = "USD",
        strategy = "FTC_DARK_PATTERN", // 'FTC_DARK_PATTERN' | 'RETENTION_DISCOUNT' | 'UNEXPECTED_HIKE' | 'ZOMBIE_INACTIVITY'
        tone = "FIRM_LEGAL",           // 'FIRM_LEGAL' | 'POLITE_PERSUASIVE' | 'STUDENT_HARDSHIP'
        userReason = ""
    } = req.body || {};

    const formattedAmount = `${currency} ${amount}`;
    const dateToday = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    let subject = "";
    let emailBody = "";
    let liveChatScript = [];
    let playbookTips = [];

    switch (strategy) {
        case 'FTC_DARK_PATTERN':
            subject = `IMMEDIATE CANCELLATION NOTICE - Account linked to [Account Email] - Non-consensual retention bypass`;
            emailBody = `To Customer Support & Billing Department for ${serviceName},

This is an unambiguous, formal instruction to immediately cancel my subscription to ${serviceName} (${formattedAmount}/billing cycle) and terminate all automated payment authorizations on my PayPal/card ending in [Last 4 Digits].

Under FTC "Click-to-Cancel" enforcement guidelines and Section 5 of the FTC Act, consumers cannot be subjected to deceptive dark patterns, hidden multi-step cancellation mazes, mandatory phone call barriers, or unrequested retention quizzes.

Details:
- Service: ${serviceName}
- Billing Rate: ${formattedAmount}
- Date of Notice: ${dateToday}
${userReason ? `- Reason: ${userReason}` : ''}

Please process this cancellation immediately and email confirmation of termination within 24 business hours. If any further charges occur post-notice, I will immediately submit a dispute with PayPal/my banking institution citing unauthorized recurring billing.

Sincerely,
[Your Full Name]
[Your Account Email]`;
            liveChatScript = [
                { role: "Agent", text: "We're sorry to see you go! Before we cancel, would you be interested in keeping access at 50% off for the next 3 months?" },
                { role: "You (AI Counter)", text: "No thank you. Please do not offer retention incentives. Process the immediate cancellation of my account right now and confirm the confirmation reference number." },
                { role: "Agent", text: "You will need to call our billing support phone line between 9am-5pm to complete this." },
                { role: "You (AI Counter)", text: "Under FTC regulations, cancellation mechanisms must be as simple as the signup mechanism. I enrolled online without a phone call; I am entitled to cancel online right now in this chat." }
            ];
            playbookTips = [
                "Citing the FTC Click-to-Cancel Rule usually causes level-1 support bots to bypass tier retention questions.",
                "Take a screenshot of the chat transcript or save the email sent timestamp.",
                "If they stall, revoke billing permissions in PayPal Settings -> Payments -> Automatic Payments."
            ];
            break;

        case 'RETENTION_DISCOUNT':
            subject = `Subscription Review: Request for promotional rate matching on ${serviceName}`;
            emailBody = `Hello ${serviceName} Retention Team,

I have been reviewing my recurring monthly software expenses and noticed my ${serviceName} subscription currently renews at ${formattedAmount}/month.

While I appreciate the platform, competing services are currently offering promo rates at 40-50% below this pricing. Before I initiate an account migration, I wanted to reach out and see if there are any loyalty retention discounts, annual promotion tiers, or student/hardship matching offers available for my account.

${userReason ? `Note: ${userReason}` : ''}

If we can lower my rate to around ${currency} ${(Number(amount) * 0.5).toFixed(2)}/mo or apply an extended promotional discount, I would gladly stay with ${serviceName}. Otherwise, please treat this email as a request to downgrade or cancel at the end of the current billing cycle.

Looking forward to your options,
[Your Full Name]
[Your Account Email]`;
            liveChatScript = [
                { role: "Agent", text: "How can I help you today?" },
                { role: "You (AI Counter)", text: `Hi! I enjoy ${serviceName}, but my current ${formattedAmount} fee is no longer within my budget. Competitors are offering lower tiers. Can you match a 50% discount or apply a retention promo code to keep my account active?` },
                { role: "Agent", text: "The best I can do right now is 15% off for 1 month." },
                { role: "You (AI Counter)", text: "I have seen other members offered 6 months at 40-50% off. Could you check with your supervisor for tier retention discounts before I finalize cancellation?" }
            ];
            playbookTips = [
                "Retention chat reps typically have pre-authorized 30% to 50% discounts they only unlock on the 2nd pushback.",
                "Always be courteous but firm: reps are measured on saving subscribers.",
                "If they refuse, cancel and watch for the 'We miss you' re-engagement email 48 hours later with steep discounts."
            ];
            break;

        case 'UNEXPECTED_HIKE':
            subject = `DISPUTE: Unauthorized price increase without adequate consent on ${serviceName}`;
            emailBody = `Dear ${serviceName} Billing Department,

I am writing regarding the recent price increase on my subscription to ${formattedAmount}. My original agreement was established at a lower baseline rate, and I did not provide explicit affirmative consent for this recent price hike.

Under consumer protection guidelines and automatic renewal statutes, material changes to subscription billing terms require clear and conspicuous advance notice with an effortless opt-out mechanism.

I request either:
1. Reversion to my previous agreed-upon rate, OR
2. Immediate cancellation with a full prorated refund for the excess amount billed.

Account Email: [Your Account Email]
Service: ${serviceName}
Current Rate: ${formattedAmount}

Please provide written confirmation of the adjustment or cancellation within 2 business days.

Regards,
[Your Full Name]`;
            liveChatScript = [
                { role: "Agent", text: "Our prices increased across all tiers last month as notified in our terms." },
                { role: "You (AI Counter)", text: "I did not receive affirmative notice or agree to this price jump. I request either my grandfathered rate be restored or an immediate full cancellation with a refund for the price difference." }
            ];
            playbookTips = [
                "Companies frequently reverse hikes or grant credits if you dispute within 30 days of the rate jump.",
                "Mentioning 'lack of clear advance notice' triggers compliance escalation flags in ticketing systems."
            ];
            break;

        case 'ZOMBIE_INACTIVITY':
        default:
            subject = `Cancellation of dormant account: ${serviceName}`;
            emailBody = `Hello ${serviceName} Support,

I am writing to request the cancellation of my ${serviceName} account effective immediately. Our audit showed zero activity on this account over the past two billing cycles.

Please terminate all recurring charges (${formattedAmount}/period) and send a written confirmation of cancellation. Please also purge any saved payment methods from the profile.

Account Details:
- Name: [Your Full Name]
- Registered Email: [Your Account Email]
- Date: ${dateToday}

Thank you for your prompt assistance.

Best regards,
[Your Full Name]`;
            liveChatScript = [
                { role: "Agent", text: "Would you like to pause your subscription for 30 days instead of cancelling?" },
                { role: "You (AI Counter)", text: "No, please permanently cancel the subscription right now. I do not wish to pause or remain enrolled." }
            ];
            playbookTips = [
                "Pausing a subscription is a dark pattern that re-bills automatically after 30 days. Always insist on full termination.",
                "Ask the representative to delete stored card or PayPal billing agreements."
            ];
            break;
    }

    res.json({
        success: true,
        script: {
            serviceName,
            amount: formattedAmount,
            strategy,
            tone,
            subject,
            emailBody,
            liveChatScript,
            playbookTips
        }
    });
});

module.exports = router;
