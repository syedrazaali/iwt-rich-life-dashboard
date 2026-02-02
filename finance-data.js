/**
 * IWT Rich Life Dashboard - Finance Data
 * Your Personal "Nerd Wallet" powered by Ramit Sethi's Conscious Spending Plan
 *
 * HOW TO UPDATE:
 * 1. Add a new entry to the `snapshots` array each time you check your finances
 * 2. The dashboard will automatically calculate trends and show your progress
 * 3. Update as often as you like - daily, weekly, or monthly
 *
 * FORMULA TARGETS (IWT):
 * - Fixed Costs: 50-60% of take-home pay
 * - Investments: 10% minimum
 * - Savings Goals: 5-10%
 * - Guilt-Free Spending: 20-35%
 */

const FINANCE_DATA = {
    // Your profile
    profile: {
        name: "Raza",
        currency: "USD",
        incomeFrequency: "monthly" // monthly, biweekly, weekly
    },

    // Current income (update when salary changes)
    income: {
        gross: 12639,
        net: 7859,
        lastUpdated: "2023-12-01"
    },

    // IWT Target Ranges
    targets: {
        fixedCosts: { min: 50, max: 60, label: "Fixed Costs" },
        investments: { min: 10, max: 15, label: "Investments" },
        savingsGoals: { min: 5, max: 10, label: "Savings Goals" },
        guiltFreeSpending: { min: 20, max: 35, label: "Guilt-Free" }
    },

    // =========================================================
    // SNAPSHOTS - Add a new entry each time you update
    // =========================================================
    snapshots: [
        {
            date: "2023-01-15",
            netWorth: {
                assets: 15000,
                investments: 110000,
                savings: 28000,
                debt: 12000,
                total: 141000
            },
            csp: {
                fixedCosts: 2800,
                investments: 400,
                savingsGoals: 1200,
                guiltFreeSpending: 3459
            }
        },
        {
            date: "2023-02-15",
            netWorth: {
                assets: 15200,
                investments: 113500,
                savings: 29200,
                debt: 11600,
                total: 146300
            },
            csp: {
                fixedCosts: 2850,
                investments: 400,
                savingsGoals: 1300,
                guiltFreeSpending: 3309
            }
        },
        {
            date: "2023-03-15",
            netWorth: {
                assets: 15500,
                investments: 117000,
                savings: 30500,
                debt: 11200,
                total: 151800
            },
            csp: {
                fixedCosts: 2900,
                investments: 425,
                savingsGoals: 1400,
                guiltFreeSpending: 3134
            }
        },
        {
            date: "2023-04-15",
            netWorth: {
                assets: 16000,
                investments: 121500,
                savings: 31700,
                debt: 10800,
                total: 158400
            },
            csp: {
                fixedCosts: 2900,
                investments: 425,
                savingsGoals: 1400,
                guiltFreeSpending: 3134
            }
        },
        {
            date: "2023-05-15",
            netWorth: {
                assets: 16500,
                investments: 126000,
                savings: 32900,
                debt: 10400,
                total: 165000
            },
            csp: {
                fixedCosts: 2920,
                investments: 425,
                savingsGoals: 1450,
                guiltFreeSpending: 3064
            }
        },
        {
            date: "2023-06-15",
            netWorth: {
                assets: 17000,
                investments: 130000,
                savings: 34000,
                debt: 10200,
                total: 170800
            },
            csp: {
                fixedCosts: 2935,
                investments: 425,
                savingsGoals: 1500,
                guiltFreeSpending: 2999
            }
        },
        {
            date: "2023-07-15",
            netWorth: {
                assets: 17200,
                investments: 134500,
                savings: 35200,
                debt: 10000,
                total: 176900
            },
            csp: {
                fixedCosts: 2935,
                investments: 425,
                savingsGoals: 1500,
                guiltFreeSpending: 2999
            }
        },
        {
            date: "2023-08-15",
            netWorth: {
                assets: 17500,
                investments: 138500,
                savings: 36400,
                debt: 10000,
                total: 182400
            },
            csp: {
                fixedCosts: 2935,
                investments: 425,
                savingsGoals: 1500,
                guiltFreeSpending: 2999
            }
        },
        {
            date: "2023-09-15",
            netWorth: {
                assets: 17800,
                investments: 141500,
                savings: 37200,
                debt: 10000,
                total: 186500
            },
            csp: {
                fixedCosts: 2935,
                investments: 425,
                savingsGoals: 1500,
                guiltFreeSpending: 2999
            }
        },
        {
            date: "2023-10-15",
            netWorth: {
                assets: 18200,
                investments: 144000,
                savings: 38000,
                debt: 10000,
                total: 190200
            },
            csp: {
                fixedCosts: 2935,
                investments: 425,
                savingsGoals: 1500,
                guiltFreeSpending: 2999
            }
        },
        {
            date: "2023-11-15",
            netWorth: {
                assets: 18500,
                investments: 146500,
                savings: 38700,
                debt: 9970,
                total: 193730
            },
            csp: {
                fixedCosts: 2935,
                investments: 425,
                savingsGoals: 1500,
                guiltFreeSpending: 2999
            }
        },
        // ⬇️ ADD NEW SNAPSHOTS BELOW THIS LINE ⬇️
        {
            date: "2023-12-01",
            netWorth: {
                assets: 18700,
                investments: 148642,
                savings: 39437,
                debt: 9970,
                total: 196809
            },
            csp: {
                fixedCosts: 2935,
                investments: 425,
                savingsGoals: 1500,
                guiltFreeSpending: 2999
            },
            breakdown: {
                // Fixed Costs
                rent: 2000,
                utilities: 0,
                insurance: 319,
                car: 486,
                groceries: 0,
                phone: 0,
                subscriptions: 80,
                debtPayments: 0,
                haircut: 50,
                otherFixed: 0,
                // Investments
                rothIRA: 425,
                contrib401k: 0,
                stocks: 0,
                crypto: 0,
                // Savings Goals
                vacations: 500,
                wedding: 1000,
                emergency: 0,
                homeSavings: 0
            }
        }
    ],

    // =========================================================
    // FIXED COSTS BREAKDOWN (for detailed tracking)
    // =========================================================
    fixedCostsBreakdown: {
        rent: 2000,
        insurance: 319,
        carPayment: 486,
        haircut: 50,
        subscriptions: 80
        // Add more categories as needed
    },

    // =========================================================
    // SAVINGS GOALS - Track progress toward specific goals
    // =========================================================
    goals: {
        wedding: {
            name: "Wedding Fund",
            icon: "ring",
            targetAmount: 24500,
            currentAmount: 8500,
            monthlyContribution: 1300,
            targetDate: "2027-08-25",
            priority: "high",
            notes: "Save $24,500 by August 25th, 2027"
        }
        // Add more goals:
        // emergency: { name: "Emergency Fund", targetAmount: 25000, currentAmount: 15000, monthlyContribution: 500, priority: "high" },
        // vacation: { name: "Dream Vacation", targetAmount: 5000, currentAmount: 2000, monthlyContribution: 300, priority: "medium" },
    },

    // =========================================================
    // WEDDING PLANNING TASKS
    // =========================================================
    weddingTasks: [
        {
            id: 1,
            task: "Measurements for sherwani and nikkah outfit",
            completed: false,
            priority: "high",
            dueDate: null,
            notes: ""
        },
        {
            id: 2,
            task: "Plan out and book Bali Honeymoon",
            completed: false,
            priority: "high",
            dueDate: null,
            notes: ""
        },
        {
            id: 3,
            task: "Find a suitable 2 bedroom apartment in the Bay Area",
            completed: false,
            priority: "high",
            dueDate: null,
            notes: ""
        }
    ]
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FINANCE_DATA;
}
