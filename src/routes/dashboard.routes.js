const express=require("express");
const db= require("./../config/db");
const {authenticateToken,authorizeStatus,authorizeRole}= require("../middleware/auth.middleware"); 

const router= express.Router();

const executeQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

router.get("/summary", authenticateToken, authorizeStatus, authorizeRole(['ADMIN', 'ANALYST', 'VIEWER']), async (req, res) => {
    try {
        const totalsSql = `SELECT type, SUM(amount) as total FROM transactionRecord GROUP BY type`;
        
       
        const categorySql = `SELECT category, SUM(amount) as total FROM transactionRecord GROUP BY category ORDER BY total DESC`;
        
        const recentSql = `SELECT id, amount, type, category, date FROM transactionRecord ORDER BY date DESC, created_at DESC LIMIT 5`;
        
        const trendsSql = `
            SELECT strftime('%Y-%m', date) as month, type, SUM(amount) as total 
            FROM transactionRecord 
            GROUP BY month, type 
            ORDER BY month DESC 
            LIMIT 12
        `;
        const [totalsData, categoryData, recentActivity, trendsData] = await Promise.all([
            executeQuery(totalsSql),
            executeQuery(categorySql),
            executeQuery(recentSql),
            executeQuery(trendsSql)
        ]);

        let totalIncome = 0;
        let totalExpense = 0;

        totalsData.forEach(row => {
            if (row.type === 'INCOME') totalIncome = row.total;
            if (row.type === 'EXPENSE') totalExpense = row.total;
        });

        const netBalance = totalIncome - totalExpense;

        return res.status(200).json({
            message: "Dashboard summary successfully retrieved",
            data: {
                overview: {
                    total_income: totalIncome,
                    total_expenses: totalExpense,
                    net_balance: netBalance
                },
                category_breakdown: categoryData,
                recent_activity: recentActivity,
                monthly_trends: trendsData
            }
        });

    } catch (e) {
        return res.status(500).json({ message: "An internal server error occurred while fetching dashboard data." });
    }
});





module.exports=router;
