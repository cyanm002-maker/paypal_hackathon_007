const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET/api/analytics/summary - Get the metrices for dashboard card 

router.get('/summary',(req,res)=>{
    // Query to get total montly spend,active count 

    const query = `
        SELECT 
            SUM(CASE WHEN status = 'ACTIVE' THEN CAST(amount AS REAL) ELSE 0 END) AS totalMonthlySpend,
            COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) AS activeSubscriptionsCount,
            COUNT(*) AS totalSubscriptionsCount
        FROM subscriptions;
    `;

    db.get(query,[],(err,summaryRow) =>{
        if(err){
            return res.status(500).json({error:error.message});
            
        }

        const categoryQuery = `
            SELECT category, SUM(CAST(amount AS REAL)) as categorySpend
            FROM subscriptions
            WHERE status = 'ACTIVE'
            GROUP BY category;
        `;

        db.all(categoryQuery,[],(err,categoryRows)=>{
            if(err){
                return res.status(500).json({error:err.message});

            }

            res.json({
                success: true,
                analytics: {
                    totalMonthlySpend: summaryRow.totalMonthlySpend || 0,
                    activeSubscriptionsCount: summaryRow.activeSubscriptionsCount || 0,
                    totalSubscriptionsCount: summaryRow.totalSubscriptionsCount || 0,
                    categoryBreakdown: categoryRows}
            });
        });
    });

});

module.exports = router;
