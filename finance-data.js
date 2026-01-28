/**
 * IWT Rich Life Dashboard - Finance Data
 *
 * UPDATE INSTRUCTIONS:
 * 1. Update the values below each month after reviewing your accounts
 * 2. Add a new entry to netWorthHistory array with the new month's data
 * 3. Update currentMonth to reflect the data period
 * 4. Refresh the dashboard to see changes
 */

const FINANCE_DATA = {
    // Data last updated
    lastUpdated: "2023-12-01",
    currentMonth: "December 2023",

    // === INCOME ===
    income: {
        gross: 12639,
        net: 7859
    },

    // === CONSCIOUS SPENDING PLAN (CSP) ===
    // The 4 Pillars of IWT
    csp: {
        fixedCosts: {
            total: 2935,
            targetRange: { min: 50, max: 60 },
            breakdown: {
                rent: 2000,
                insurance: 319,
                carPayment: 486,
                haircut: 50,
                subscriptions: 80
            }
        },
        investments: {
            total: 425,
            targetRange: { min: 10, max: 10 },
            breakdown: {
                rothIRA: 425,
                stocks: 0,
                crypto: 0
            }
        },
        savingsGoals: {
            total: 1500,
            targetRange: { min: 5, max: 10 },
            breakdown: {
                vacations: 500,
                wedding: 1000,
                emergencyFund: 0,
                homeDownPayment: 0
            }
        },
        guiltFreeSpending: {
            total: 2999,
            targetRange: { min: 20, max: 35 }
        }
    },

    // === NET WORTH ===
    netWorth: {
        current: {
            assets: 18700,
            investments: 148642,
            savings: 39437,
            debt: 9970,
            total: 196809
        },
        // Historical data for tracking growth - ADD NEW MONTHS HERE
        history: [
            { month: "Jan 2023", total: 145000, assets: 15000, investments: 110000, savings: 28000, debt: 12000 },
            { month: "Feb 2023", total: 148500, assets: 15200, investments: 113500, savings: 29200, debt: 11600 },
            { month: "Mar 2023", total: 152000, assets: 15500, investments: 117000, savings: 30500, debt: 11200 },
            { month: "Apr 2023", total: 156800, assets: 16000, investments: 121500, savings: 31700, debt: 10800 },
            { month: "May 2023", total: 161200, assets: 16500, investments: 126000, savings: 32900, debt: 10400 },
            { month: "Jun 2023", total: 166000, assets: 17000, investments: 130000, savings: 34000, debt: 10200 },
            { month: "Jul 2023", total: 171500, assets: 17200, investments: 134500, savings: 35200, debt: 10000 },
            { month: "Aug 2023", total: 176800, assets: 17500, investments: 138500, savings: 36400, debt: 10000 },
            { month: "Sep 2023", total: 181500, assets: 17800, investments: 141500, savings: 37200, debt: 10000 },
            { month: "Oct 2023", total: 186200, assets: 18200, investments: 144000, savings: 38000, debt: 10000 },
            { month: "Nov 2023", total: 191500, assets: 18500, investments: 146500, savings: 38700, debt: 9970 },
            { month: "Dec 2023", total: 196809, assets: 18700, investments: 148642, savings: 39437, debt: 9970 }
        ]
    },

    // === GOALS ===
    goals: {
        wedding: {
            name: "Wedding Fund",
            icon: "ring",
            targetAmount: 30000,
            currentAmount: 8500,
            monthlyContribution: 1000,
            startDate: "2023-06-01",
            targetDate: null, // Will be calculated based on velocity
            priority: "high",
            notes: "Dream wedding celebration"
        }
        // Add more goals here as needed:
        // vacation: { name: "Dream Vacation", targetAmount: 5000, currentAmount: 2000, monthlyContribution: 500 },
        // emergency: { name: "Emergency Fund", targetAmount: 25000, currentAmount: 15000, monthlyContribution: 500 },
    },

    // === IWT TARGET BENCHMARKS ===
    targets: {
        fixedCosts: { min: 50, max: 60, label: "Fixed Costs", color: "#ef4444" },
        investments: { min: 10, max: 10, label: "Investments", color: "#22c55e" },
        savingsGoals: { min: 5, max: 10, label: "Savings Goals", color: "#3b82f6" },
        guiltFreeSpending: { min: 20, max: 35, label: "Guilt-Free", color: "#a855f7" }
    }
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FINANCE_DATA;
}
