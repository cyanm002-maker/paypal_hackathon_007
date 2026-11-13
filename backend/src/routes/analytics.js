const express = require("express");
const router = express.Router();
const db = require("../config/database");

// 1. GET /api/analytics/summary - High-level metrics
router.get('/summary', (req, res) => {
    const query = `
        SELECT 
            SUM(CASE WHEN status = 'ACTIVE' THEN CAST(amount AS REAL) ELSE 0 END) AS totalMonthlySpend,
            COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) AS activeSubscriptionsCount,
            COUNT(*) AS totalSubscriptionsCount
        FROM subscriptions;
    `;

    db.get(query, [], (err, summaryRow) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const categoryQuery = `
            SELECT category, SUM(CAST(amount AS REAL)) as categorySpend, COUNT(*) as count
            FROM subscriptions
            WHERE status = 'ACTIVE'
            GROUP BY category;
        `;

        db.all(categoryQuery, [], (err, categoryRows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({
                success: true,
                analytics: {
                    totalMonthlySpend: Number(summaryRow?.totalMonthlySpend) || 0,
                    activeSubscriptionsCount: Number(summaryRow?.activeSubscriptionsCount) || 0,
                    totalSubscriptionsCount: Number(summaryRow?.totalSubscriptionsCount) || 0,
                    categoryBreakdown: categoryRows || []
                }
            });
        });
    });
});

// 2. GET /api/analytics/anomalies - Smart Anomaly & Price-Hike Detection
router.get('/anomalies', (req, res) => {
    db.all(`SELECT * FROM subscriptions WHERE status = 'ACTIVE'`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const anomalies = [];
        const seenCategories = {};
        const seenNames = {};

        rows.forEach(sub => {
            const currentAmount = Number(sub.amount) || 0;
            const baseAmount = Number(sub.historical_base_amount);

            // Anomaly Check 1: Price-Hike Detection
            if (baseAmount && currentAmount > baseAmount) {
                const increase = currentAmount - baseAmount;
                const percentIncrease = ((increase / baseAmount) * 100).toFixed(1);

                if (percentIncrease >= 5) { // 5%+ price hike flag
                    anomalies.push({
                        id: `hike-${sub.id}`,
                        type: 'PRICE_HIKE',
                        severity: percentIncrease > 25 ? 'HIGH' : 'MEDIUM',
                        subscriptionId: sub.id,
                        subscriptionName: sub.name,
                        currency: sub.currency,
                        currentAmount,
                        baseAmount,
                        increaseAmount: Number(increase.toFixed(2)),
                        percentIncrease: Number(percentIncrease),
                        message: `Price increased by +${percentIncrease}% (${sub.currency} ${increase.toFixed(2)} extra/mo) compared to your historical baseline of ${sub.currency} ${baseAmount.toFixed(2)}.`
                    });
                }
            }

            // Anomaly Check 2: Potential Duplicate / Redundant Subscriptions
            const normalizedName = sub.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (seenNames[normalizedName]) {
                anomalies.push({
                    id: `dup-${sub.id}-${seenNames[normalizedName].id}`,
                    type: 'DUPLICATE_BILLING',
                    severity: 'HIGH',
                    subscriptionId: sub.id,
                    subscriptionName: sub.name,
                    partnerId: seenNames[normalizedName].id,
                    partnerName: seenNames[normalizedName].name,
                    amount: currentAmount,
                    currency: sub.currency,
                    message: `Possible duplicate charge detected! You have two active subscriptions under "${sub.name}".`
                });
            } else {
                seenNames[normalizedName] = sub;
            }

            // Anomaly Check 3: Redundant Category Bloat (e.g. 3+ entertainment or music services)
            const cat = sub.category || 'Other';
            if (!seenCategories[cat]) seenCategories[cat] = [];
            seenCategories[cat].push(sub);
        });

        // Evaluate category overlaps
        Object.keys(seenCategories).forEach(cat => {
            const list = seenCategories[cat];
            if (list.length >= 2 && ['Entertainment', 'Music', 'Cloud & Dev'].includes(cat)) {
                const totalCatSpend = list.reduce((sum, s) => sum + Number(s.amount), 0);
                anomalies.push({
                    id: `overlap-${cat}`,
                    type: 'CATEGORY_OVERLAP',
                    severity: 'LOW',
                    category: cat,
                    count: list.length,
                    totalSpend: Number(totalCatSpend.toFixed(2)),
                    subscriptions: list.map(s => s.name),
                    message: `Category overlap: You have ${list.length} active services under "${cat}" costing ${list[0].currency} ${totalCatSpend.toFixed(2)}/mo. Consider consolidating.`
                });
            }
        });

        res.json({
            success: true,
            totalAnomalies: anomalies.length,
            anomalies
        });
    });
});

// 3. GET /api/analytics/roi-and-zombies - Cost-Per-Use ROI Score & Zombie Subscriptions
router.get('/roi-and-zombies', (req, res) => {
    db.all(`SELECT * FROM subscriptions WHERE status = 'ACTIVE'`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const today = new Date();
        let totalZombieWasteMonthly = 0;
        const evaluatedSubscriptions = [];

        rows.forEach(sub => {
            const amount = Number(sub.amount) || 0;
            const usageCount = Number(sub.usage_count) || 0;
            
            // Days since last used
            let daysSinceLastUsed = 0;
            if (sub.last_used_date) {
                const lastUsed = new Date(sub.last_used_date);
                const diffTime = Math.abs(today - lastUsed);
                daysSinceLastUsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            } else {
                daysSinceLastUsed = 90; // Default if never logged
            }

            // Cost per use calculation
            // If monthly subscription, cost-per-use = amount / usageCount (min 1 use considered to avoid div by zero)
            const effectiveUses = Math.max(usageCount, 1);
            const costPerUse = Number((amount / effectiveUses).toFixed(2));

            // Flag Zombie Subscriptions: Unused for 60+ days OR usage_count === 0 with >30 days inactivity
            const isZombie = daysSinceLastUsed >= 60 || (usageCount === 0 && daysSinceLastUsed >= 30);

            if (isZombie) {
                totalZombieWasteMonthly += amount;
            }

            // ROI Tier classification
            let roiTier = 'GOOD';
            let roiScore = 80; // 0 - 100
            if (isZombie) {
                roiTier = 'ZOMBIE';
                roiScore = 10;
            } else if (costPerUse <= 1.50) {
                roiTier = 'EXCELLENT';
                roiScore = 95;
            } else if (costPerUse <= 5.00) {
                roiTier = 'GOOD';
                roiScore = 80;
            } else if (costPerUse <= 15.00) {
                roiTier = 'FAIR';
                roiScore = 55;
            } else {
                roiTier = 'POOR';
                roiScore = 30;
            }

            evaluatedSubscriptions.push({
                id: sub.id,
                paypal_sub_id: sub.paypal_sub_id,
                name: sub.name,
                category: sub.category,
                amount,
                currency: sub.currency,
                billing_cycle: sub.billing_cycle,
                usage_count: usageCount,
                last_used_date: sub.last_used_date,
                daysSinceLastUsed,
                costPerUse,
                isZombie,
                roiTier,
                roiScore
            });
        });

        // Sort by worst ROI / Zombies first
        evaluatedSubscriptions.sort((a, b) => {
            if (a.isZombie && !b.isZombie) return -1;
            if (!a.isZombie && b.isZombie) return 1;
            return b.costPerUse - a.costPerUse;
        });

        const zombieCount = evaluatedSubscriptions.filter(s => s.isZombie).length;

        res.json({
            success: true,
            zombieCount,
            totalZombieWasteMonthly: Number(totalZombieWasteMonthly.toFixed(2)),
            potentialAnnualSavings: Number((totalZombieWasteMonthly * 12).toFixed(2)),
            subscriptions: evaluatedSubscriptions
        });
    });
});

module.exports = router;
