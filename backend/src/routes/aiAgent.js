const express = require("express");
const router = express.Router();
const db = require("../config/database");

// get apu key 
router.get("/insights",(req,res)=>{
    const userBudget = parseFloat(req.query.budget) || 50.00;


    const query = `
        SELECT 
            SUM(CASE WHEN status = 'ACTIVE' THEN CAST(amount AS REAL) ELSE 0 END) AS totalSpend,
            COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) AS activeCount
        FROM subscriptions;
    `;

    db.get(query,[],(err,row)=>{
        if(err){
            return res.status(500).json({error:err.message});

        }

        const currentSpend = row.totalSpend || 0;
        const activeCount = row.activeCount || 0;

        // let recommendations = [];
        // let statusMessage = "Your subscriptions are looking healthy";

        // // logic for ai agent

        // if(currentSpend>userBudget){
        //     statusMessage = "Budget Alert: You ae exceeding your montly budget";
        //     recommendations.push(`You are currently spending $${currentSpend.toFixed(2)}, which is over your $${userBudget.toFixed(2)} budget.`);
        //     recommendations.push("Consider auditing your digital media or entertainment");

        // }else{
        //     const remaning = userBudget - currentSpend;
        //     recommendations.push(`You have $${remaining.toFixed(2)} left in your monthly subscription budget.`);


        // }

        // if(activeCount>3) {
        //     recommendations.push(`You have ${activeCount} active subscriptions running simultaneously. Review if you use all of them weekly.`);

        // }
        let recommendations = [];
        let statusMessage = "Your subscriptions are looking healthy!";

        // Smart agent evaluation logic
        if (currentSpend > userBudget) {
            statusMessage = "Budget Alert: You are exceeding your monthly subscription limit!";
            recommendations.push(`You are currently spending $${currentSpend.toFixed(2)}, which is over your $${userBudget.toFixed(2)} budget.`);
            recommendations.push("Consider auditing your digital media or entertainment categories for unused services.");
        } else {
            // Calculate remaining safely here
            const remaining = userBudget - currentSpend;
            recommendations.push(`You have $${remaining.toFixed(2)} left in your monthly subscription budget.`);
        }

        if (activeCount > 3) {
            recommendations.push(`You have ${activeCount} active subscriptions running simultaneously. Review if you use all of them weekly.`);
        }
        res.json({
            success: true,
            agent_analysis: {
                monthly_budget: userBudget,
                current_monthly_spend: currentSpend,
                active_subscriptions: activeCount,
                status: statusMessage,
                recommendations: recommendations
            }
        });


    });
});


module.exports = router;
