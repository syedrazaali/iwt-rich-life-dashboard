/**
 * IWT Rich Life Dashboard - Application Logic
 *
 * This file handles all chart rendering, calculations, and UI updates.
 * Data is sourced from finance-data.js - update that file monthly.
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatPercent(value) {
    return `${Math.round(value)}%`;
}

function calculatePercentage(part, whole) {
    if (whole === 0) return 0;
    return (part / whole) * 100;
}

function getMonthsUntilGoal(remaining, monthlyContribution) {
    if (monthlyContribution <= 0) return Infinity;
    return Math.ceil(remaining / monthlyContribution);
}

function addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// ============================================
// CHART INSTANCES
// ============================================

let cspChart = null;
let netWorthChart = null;
let currentChartRange = 12;

// ============================================
// DARK MODE
// ============================================

function toggleDarkMode() {
    const html = document.documentElement;
    const darkIcon = document.getElementById('darkIcon');
    const lightIcon = document.getElementById('lightIcon');

    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        document.body.classList.remove('bg-gray-950', 'text-gray-100');
        document.body.classList.add('bg-gray-100', 'text-gray-900');
        darkIcon.classList.remove('hidden');
        lightIcon.classList.add('hidden');
        localStorage.setItem('darkMode', 'false');
    } else {
        html.classList.add('dark');
        document.body.classList.add('bg-gray-950', 'text-gray-100');
        document.body.classList.remove('bg-gray-100', 'text-gray-900');
        darkIcon.classList.add('hidden');
        lightIcon.classList.remove('hidden');
        localStorage.setItem('darkMode', 'true');
    }

    // Recreate charts with new colors
    renderCSPChart();
    renderNetWorthChart();
}

// ============================================
// CSP HEALTH CHECK
// ============================================

function getCSPHealth() {
    const { csp, income } = FINANCE_DATA;
    const netIncome = income.net;

    const fixedPct = calculatePercentage(csp.fixedCosts.total, netIncome);
    const investPct = calculatePercentage(csp.investments.total, netIncome);
    const savingsPct = calculatePercentage(csp.savingsGoals.total, netIncome);

    const issues = [];

    // Check Fixed Costs (should be 50-60%)
    if (fixedPct > 60) {
        issues.push(`Fixed costs at ${formatPercent(fixedPct)} (target: 50-60%)`);
    }

    // Check Investments (should be at least 10%)
    if (investPct < 10) {
        issues.push(`Investments at ${formatPercent(investPct)} (target: 10%+)`);
    }

    // Check Savings (should be 5-10%)
    if (savingsPct < 5) {
        issues.push(`Savings at ${formatPercent(savingsPct)} (target: 5-10%)`);
    }

    return {
        isHealthy: issues.length === 0,
        issues: issues,
        fixedCostsWarning: fixedPct > 60
    };
}

function updateHealthIndicator() {
    const health = getCSPHealth();
    const indicator = document.getElementById('healthIndicator');

    if (health.isHealthy) {
        indicator.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-green-500"></span>
            <span class="text-green-500">Healthy</span>
        `;
        indicator.className = 'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-500/10';
    } else {
        indicator.innerHTML = `
            <span class="w-2 h-2 rounded-full bg-red-500 health-pulse"></span>
            <span class="text-red-500">Needs Attention</span>
        `;
        indicator.className = 'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-red-500/10';
        indicator.title = health.issues.join('\n');
    }
}

// ============================================
// CSP DOUGHNUT CHART
// ============================================

function renderCSPChart() {
    const ctx = document.getElementById('cspChart').getContext('2d');
    const { csp } = FINANCE_DATA;

    const data = [
        csp.fixedCosts.total,
        csp.investments.total,
        csp.savingsGoals.total,
        csp.guiltFreeSpending.total
    ];

    const isDark = document.documentElement.classList.contains('dark');

    if (cspChart) {
        cspChart.destroy();
    }

    cspChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Fixed Costs', 'Investments', 'Savings Goals', 'Guilt-Free Spending'],
            datasets: [{
                data: data,
                backgroundColor: [
                    '#ef4444', // Fixed - Red
                    '#22c55e', // Invest - Green
                    '#3b82f6', // Savings - Blue
                    '#a855f7'  // Guilt-Free - Purple
                ],
                borderColor: isDark ? '#1f2937' : '#ffffff',
                borderWidth: 3,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '65%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    titleColor: isDark ? '#ffffff' : '#1f2937',
                    bodyColor: isDark ? '#d1d5db' : '#4b5563',
                    borderColor: isDark ? '#4b5563' : '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((value / total) * 100).toFixed(1);
                            return `${formatCurrency(value)} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

function updateCSPBreakdown() {
    const { csp, income } = FINANCE_DATA;
    const netIncome = income.net;

    document.getElementById('monthlyIncome').textContent = formatCurrency(netIncome);

    // Fixed Costs
    document.getElementById('cspFixed').textContent = formatCurrency(csp.fixedCosts.total);
    document.getElementById('cspFixedPct').textContent = `(${formatPercent(calculatePercentage(csp.fixedCosts.total, netIncome))})`;

    // Investments
    document.getElementById('cspInvest').textContent = formatCurrency(csp.investments.total);
    document.getElementById('cspInvestPct').textContent = `(${formatPercent(calculatePercentage(csp.investments.total, netIncome))})`;

    // Savings
    document.getElementById('cspSavings').textContent = formatCurrency(csp.savingsGoals.total);
    document.getElementById('cspSavingsPct').textContent = `(${formatPercent(calculatePercentage(csp.savingsGoals.total, netIncome))})`;

    // Guilt-Free
    document.getElementById('cspGuiltFree').textContent = formatCurrency(csp.guiltFreeSpending.total);
    document.getElementById('cspGuiltFreePct').textContent = `(${formatPercent(calculatePercentage(csp.guiltFreeSpending.total, netIncome))})`;
}

// ============================================
// NET WORTH LINE CHART
// ============================================

function renderNetWorthChart() {
    const ctx = document.getElementById('netWorthChart').getContext('2d');
    const { netWorth } = FINANCE_DATA;

    let historyData = [...netWorth.history];

    // Apply range filter
    if (currentChartRange > 0 && historyData.length > currentChartRange) {
        historyData = historyData.slice(-currentChartRange);
    }

    const labels = historyData.map(item => item.month);
    const totals = historyData.map(item => item.total);

    const isDark = document.documentElement.classList.contains('dark');

    if (netWorthChart) {
        netWorthChart.destroy();
    }

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.3)');
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0.0)');

    netWorthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Net Worth',
                data: totals,
                borderColor: '#7c3aed',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#7c3aed',
                pointBorderColor: isDark ? '#1f2937' : '#ffffff',
                pointBorderWidth: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    titleColor: isDark ? '#ffffff' : '#1f2937',
                    bodyColor: isDark ? '#d1d5db' : '#4b5563',
                    borderColor: isDark ? '#4b5563' : '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: isDark ? '#9ca3af' : '#4b5563',
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    grid: {
                        color: isDark ? '#374151' : '#e5e7eb'
                    },
                    ticks: {
                        color: isDark ? '#9ca3af' : '#4b5563',
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function setChartRange(months) {
    currentChartRange = months;

    // Update button styles
    document.querySelectorAll('.chart-range-btn').forEach(btn => {
        const btnRange = parseInt(btn.dataset.range);
        if (btnRange === months) {
            btn.classList.remove('bg-gray-800', 'text-gray-400');
            btn.classList.add('bg-iwt-purple', 'text-white');
        } else {
            btn.classList.add('bg-gray-800', 'text-gray-400');
            btn.classList.remove('bg-iwt-purple', 'text-white');
        }
    });

    renderNetWorthChart();
}

function updateNetWorthDisplay() {
    const { netWorth } = FINANCE_DATA;
    const current = netWorth.current;
    const history = netWorth.history;

    // Update totals
    document.getElementById('netWorthTotal').textContent = formatCurrency(current.total);
    document.getElementById('nwAssets').textContent = formatCurrency(current.assets);
    document.getElementById('nwInvestments').textContent = formatCurrency(current.investments);
    document.getElementById('nwSavings').textContent = formatCurrency(current.savings);
    document.getElementById('nwDebt').textContent = formatCurrency(current.debt);

    // Calculate Month-over-Month change
    if (history.length >= 2) {
        const currentTotal = history[history.length - 1].total;
        const previousTotal = history[history.length - 2].total;
        const change = currentTotal - previousTotal;
        const changePercent = ((change / previousTotal) * 100).toFixed(1);

        const changeContainer = document.getElementById('netWorthChange');
        const isPositive = change >= 0;

        changeContainer.innerHTML = `
            <span class="flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}">
                <svg class="w-4 h-4 ${isPositive ? '' : 'rotate-180'}" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"/>
                </svg>
                ${isPositive ? '+' : ''}${formatCurrency(change)} (${isPositive ? '+' : ''}${changePercent}%)
            </span>
            <span class="text-gray-500 text-sm">vs last month</span>
        `;
    }
}

// ============================================
// GOALS RENDERING
// ============================================

function renderGoals() {
    const { goals } = FINANCE_DATA;
    const container = document.getElementById('goalsContainer');

    container.innerHTML = '';

    Object.entries(goals).forEach(([key, goal]) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const remaining = goal.targetAmount - goal.currentAmount;
        const monthsToGoal = getMonthsUntilGoal(remaining, goal.monthlyContribution);
        const estimatedDate = addMonths(new Date(), monthsToGoal);

        const iconMap = {
            ring: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>`,
            vacation: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/>
            </svg>`,
            home: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>`,
            default: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>`
        };

        const icon = iconMap[goal.icon] || iconMap.default;

        const priorityColors = {
            high: 'from-rose-500 to-pink-500',
            medium: 'from-amber-500 to-orange-500',
            low: 'from-blue-500 to-cyan-500'
        };

        const gradientClass = priorityColors[goal.priority] || priorityColors.medium;

        const card = document.createElement('div');
        card.className = 'bg-gray-900 rounded-2xl p-6 border border-gray-800 card-glow transition-all';
        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white">
                        ${icon}
                    </div>
                    <div>
                        <h4 class="font-semibold text-white">${goal.name}</h4>
                        <p class="text-sm text-gray-500">${formatCurrency(goal.monthlyContribution)}/month</p>
                    </div>
                </div>
                <span class="text-xs font-medium px-2 py-1 rounded-full ${goal.priority === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-gray-700 text-gray-400'}">
                    ${goal.priority}
                </span>
            </div>

            <div class="mb-4">
                <div class="flex justify-between text-sm mb-2">
                    <span class="text-gray-400">Progress</span>
                    <span class="text-white font-medium">${formatPercent(progress)}</span>
                </div>
                <div class="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r ${gradientClass} rounded-full transition-all duration-500" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p class="text-gray-500">Saved</p>
                    <p class="text-white font-semibold">${formatCurrency(goal.currentAmount)}</p>
                </div>
                <div>
                    <p class="text-gray-500">Goal</p>
                    <p class="text-white font-semibold">${formatCurrency(goal.targetAmount)}</p>
                </div>
                <div>
                    <p class="text-gray-500">Remaining</p>
                    <p class="text-white font-semibold">${formatCurrency(remaining)}</p>
                </div>
                <div>
                    <p class="text-gray-500">Est. Completion</p>
                    <p class="text-iwt-purple font-semibold">${monthsToGoal === Infinity ? 'N/A' : formatDate(estimatedDate)}</p>
                </div>
            </div>

            ${goal.notes ? `<p class="mt-4 text-xs text-gray-500 italic">"${goal.notes}"</p>` : ''}
        `;

        container.appendChild(card);
    });
}

// ============================================
// INITIALIZATION
// ============================================

function updateLastUpdated() {
    const { lastUpdated, currentMonth } = FINANCE_DATA;
    document.getElementById('lastUpdated').textContent = `Data: ${currentMonth}`;
}

function init() {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'false') {
        toggleDarkMode();
    }

    // Update all displays
    updateLastUpdated();
    updateNetWorthDisplay();
    updateCSPBreakdown();
    updateHealthIndicator();

    // Render charts
    renderCSPChart();
    renderNetWorthChart();

    // Render goals
    renderGoals();
}

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', init);
