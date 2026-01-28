/**
 * IWT Rich Life Dashboard - Application Logic
 * Personal Nerd Wallet with Ramit Sethi's Conscious Spending Plan
 *
 * Data is stored in localStorage for persistence.
 * Use Export to backup, Import to restore.
 */

const STORAGE_KEY = 'iwt_dashboard_data';

// ============================================
// DATA MANAGEMENT
// ============================================

function loadData() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse stored data:', e);
        }
    }
    // Fall back to default data from finance-data.js
    return JSON.parse(JSON.stringify(FINANCE_DATA));
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getData() {
    if (!window._dashboardData) {
        window._dashboardData = loadData();
    }
    return window._dashboardData;
}

function resetData() {
    if (confirm('Reset all data to defaults? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        window._dashboardData = null;
        location.reload();
    }
}

function exportData() {
    const data = getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iwt-dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    closeSettingsModal();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data.snapshots && data.income) {
                saveData(data);
                window._dashboardData = data;
                location.reload();
            } else {
                alert('Invalid data format');
            }
        } catch (err) {
            alert('Failed to import: ' + err.message);
        }
    };
    reader.readAsText(file);
}

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

function formatPercent(value, decimals = 0) {
    return `${value.toFixed(decimals)}%`;
}

function calculatePercentage(part, whole) {
    if (whole === 0) return 0;
    return (part / whole) * 100;
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatShortDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function getLatestSnapshot() {
    const data = getData();
    return data.snapshots[data.snapshots.length - 1];
}

function getPreviousSnapshot() {
    const data = getData();
    if (data.snapshots.length < 2) return null;
    return data.snapshots[data.snapshots.length - 2];
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

// ============================================
// TREND CALCULATIONS
// ============================================

function calculateTrend(current, previous) {
    if (!previous || previous === 0) return { change: 0, percent: 0, direction: 'neutral' };
    const change = current - previous;
    const percent = (change / previous) * 100;
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    return { change, percent, direction };
}

function getTrendHTML(trend, invertColors = false) {
    const isPositive = invertColors ? trend.direction === 'down' : trend.direction === 'up';
    const colorClass = trend.direction === 'neutral' ? 'text-gray-400' :
                       isPositive ? 'text-green-500' : 'text-red-500';
    const arrow = trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→';
    const sign = trend.change >= 0 ? '+' : '';

    return `<span class="${colorClass} text-sm font-medium">${arrow} ${sign}${formatCurrency(trend.change)} (${sign}${trend.percent.toFixed(1)}%)</span>`;
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function openModal() {
    const modal = document.getElementById('snapshotModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Pre-fill with latest snapshot values
    const latest = getLatestSnapshot();
    const bd = latest.breakdown || {};

    document.getElementById('snapDate').value = new Date().toISOString().split('T')[0];

    // Net Worth
    document.getElementById('snapAssets').value = latest.netWorth.assets || 0;
    document.getElementById('snapInvestments').value = latest.netWorth.investments || 0;
    document.getElementById('snapSavings').value = latest.netWorth.savings || 0;
    document.getElementById('snapDebt').value = latest.netWorth.debt || 0;

    // Fixed Costs breakdown
    document.getElementById('snapRent').value = bd.rent || 0;
    document.getElementById('snapUtilities').value = bd.utilities || 0;
    document.getElementById('snapInsurance').value = bd.insurance || 0;
    document.getElementById('snapCar').value = bd.car || 0;
    document.getElementById('snapGroceries').value = bd.groceries || 0;
    document.getElementById('snapPhone').value = bd.phone || 0;
    document.getElementById('snapSubscriptions').value = bd.subscriptions || 0;
    document.getElementById('snapDebtPayments').value = bd.debtPayments || 0;
    document.getElementById('snapHaircut').value = bd.haircut || 0;
    document.getElementById('snapOtherFixed').value = bd.otherFixed || 0;

    // Investments breakdown
    document.getElementById('snapRothIRA').value = bd.rothIRA || 0;
    document.getElementById('snap401k').value = bd.contrib401k || 0;
    document.getElementById('snapStocks').value = bd.stocks || 0;
    document.getElementById('snapCrypto').value = bd.crypto || 0;

    // Savings Goals breakdown
    document.getElementById('snapVacations').value = bd.vacations || 0;
    document.getElementById('snapWedding').value = bd.wedding || 0;
    document.getElementById('snapEmergency').value = bd.emergency || 0;
    document.getElementById('snapHomeSavings').value = bd.homeSavings || 0;

    // Guilt-Free
    document.getElementById('snapGuiltFree').value = latest.csp.guiltFreeSpending || 0;

    // Trigger calculations
    calcNetWorth();
    calcCSP();
}

function closeModal() {
    const modal = document.getElementById('snapshotModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.getElementById('settingsIncome').value = getData().income.net;
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function updateIncome() {
    const newIncome = parseInt(document.getElementById('settingsIncome').value);
    if (newIncome && newIncome > 0) {
        const data = getData();
        data.income.net = newIncome;
        data.income.lastUpdated = new Date().toISOString().split('T')[0];
        saveData(data);
        window._dashboardData = data;
        refreshDashboard();
        closeSettingsModal();
    }
}

// Form calculation functions
function getVal(id) {
    return parseInt(document.getElementById(id).value) || 0;
}

function calcNetWorth() {
    const assets = getVal('snapAssets');
    const investments = getVal('snapInvestments');
    const savings = getVal('snapSavings');
    const debt = getVal('snapDebt');
    const total = assets + investments + savings - debt;

    document.getElementById('nwTotalCalc').textContent = formatCurrency(total);
}

function calcCSP() {
    const data = getData();
    const netIncome = data.income.net;

    // Fixed Costs
    const fixedTotal = getVal('snapRent') + getVal('snapUtilities') + getVal('snapInsurance') +
                       getVal('snapCar') + getVal('snapGroceries') + getVal('snapPhone') +
                       getVal('snapSubscriptions') + getVal('snapDebtPayments') +
                       getVal('snapHaircut') + getVal('snapOtherFixed');
    const fixedPct = (fixedTotal / netIncome) * 100;
    document.getElementById('fixedTotalCalc').textContent = formatCurrency(fixedTotal);
    document.getElementById('fixedPctCalc').textContent = `(${fixedPct.toFixed(0)}%)`;
    document.getElementById('fixedTotalCalc').className = fixedPct > 60 ? 'text-lg font-bold text-red-500' : 'text-lg font-bold text-fixed';

    // Investments
    const investTotal = getVal('snapRothIRA') + getVal('snap401k') + getVal('snapStocks') + getVal('snapCrypto');
    const investPct = (investTotal / netIncome) * 100;
    document.getElementById('investTotalCalc').textContent = formatCurrency(investTotal);
    document.getElementById('investPctCalc').textContent = `(${investPct.toFixed(0)}%)`;
    document.getElementById('investTotalCalc').className = investPct < 10 ? 'text-lg font-bold text-yellow-500' : 'text-lg font-bold text-invest';

    // Savings Goals
    const savingsTotal = getVal('snapVacations') + getVal('snapWedding') + getVal('snapEmergency') + getVal('snapHomeSavings');
    const savingsPct = (savingsTotal / netIncome) * 100;
    document.getElementById('savingsTotalCalc').textContent = formatCurrency(savingsTotal);
    document.getElementById('savingsPctCalc').textContent = `(${savingsPct.toFixed(0)}%)`;

    // Guilt-Free
    const guiltFreeTotal = getVal('snapGuiltFree');
    const guiltFreePct = (guiltFreeTotal / netIncome) * 100;
    document.getElementById('guiltFreeTotalCalc').textContent = formatCurrency(guiltFreeTotal);
    document.getElementById('guiltFreePctCalc').textContent = `(${guiltFreePct.toFixed(0)}%)`;
    document.getElementById('guiltFreeTotalCalc').className = guiltFreePct > 35 ? 'text-lg font-bold text-yellow-500' : 'text-lg font-bold text-guilt-free';

    // Total
    const totalSpending = fixedTotal + investTotal + savingsTotal + guiltFreeTotal;
    document.getElementById('totalSpendingCalc').textContent = formatCurrency(totalSpending);

    // Warning if over budget
    const warning = document.getElementById('spendingWarning');
    if (totalSpending > netIncome) {
        warning.textContent = `Warning: Spending exceeds income by ${formatCurrency(totalSpending - netIncome)}`;
        warning.classList.remove('hidden');
    } else {
        warning.classList.add('hidden');
    }
}

function handleSnapshotSubmit(e) {
    e.preventDefault();

    const assets = getVal('snapAssets');
    const investments = getVal('snapInvestments');
    const savings = getVal('snapSavings');
    const debt = getVal('snapDebt');

    // Calculate CSP totals from breakdown
    const fixedCosts = getVal('snapRent') + getVal('snapUtilities') + getVal('snapInsurance') +
                       getVal('snapCar') + getVal('snapGroceries') + getVal('snapPhone') +
                       getVal('snapSubscriptions') + getVal('snapDebtPayments') +
                       getVal('snapHaircut') + getVal('snapOtherFixed');

    const cspInvestments = getVal('snapRothIRA') + getVal('snap401k') + getVal('snapStocks') + getVal('snapCrypto');

    const savingsGoals = getVal('snapVacations') + getVal('snapWedding') + getVal('snapEmergency') + getVal('snapHomeSavings');

    const guiltFreeSpending = getVal('snapGuiltFree');

    const snapshot = {
        date: document.getElementById('snapDate').value,
        netWorth: {
            assets,
            investments,
            savings,
            debt,
            total: assets + investments + savings - debt
        },
        csp: {
            fixedCosts,
            investments: cspInvestments,
            savingsGoals,
            guiltFreeSpending
        },
        breakdown: {
            // Fixed costs
            rent: getVal('snapRent'),
            utilities: getVal('snapUtilities'),
            insurance: getVal('snapInsurance'),
            car: getVal('snapCar'),
            groceries: getVal('snapGroceries'),
            phone: getVal('snapPhone'),
            subscriptions: getVal('snapSubscriptions'),
            debtPayments: getVal('snapDebtPayments'),
            haircut: getVal('snapHaircut'),
            otherFixed: getVal('snapOtherFixed'),
            // Investments
            rothIRA: getVal('snapRothIRA'),
            contrib401k: getVal('snap401k'),
            stocks: getVal('snapStocks'),
            crypto: getVal('snapCrypto'),
            // Savings
            vacations: getVal('snapVacations'),
            wedding: getVal('snapWedding'),
            emergency: getVal('snapEmergency'),
            homeSavings: getVal('snapHomeSavings')
        }
    };

    const data = getData();
    data.snapshots.push(snapshot);

    // Sort by date
    data.snapshots.sort((a, b) => new Date(a.date) - new Date(b.date));

    saveData(data);
    window._dashboardData = data;

    closeModal();
    refreshDashboard();
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
    renderCSPChart();
}

// ============================================
// CSP HEALTH CHECK
// ============================================

function getCSPHealth() {
    const data = getData();
    const latest = getLatestSnapshot();
    const netIncome = data.income.net;
    const targets = data.targets;

    const fixedPct = calculatePercentage(latest.csp.fixedCosts, netIncome);
    const investPct = calculatePercentage(latest.csp.investments, netIncome);
    const savingsPct = calculatePercentage(latest.csp.savingsGoals, netIncome);
    const guiltFreePct = calculatePercentage(latest.csp.guiltFreeSpending, netIncome);

    const issues = [];
    let score = 0;

    if (fixedPct <= targets.fixedCosts.max) {
        score += 25;
    } else {
        issues.push(`Fixed costs at ${formatPercent(fixedPct)} (target: ≤${targets.fixedCosts.max}%)`);
    }

    if (investPct >= targets.investments.min) {
        score += 25;
    } else {
        issues.push(`Investments at ${formatPercent(investPct)} (target: ≥${targets.investments.min}%)`);
    }

    if (savingsPct >= targets.savingsGoals.min) {
        score += 25;
    } else {
        issues.push(`Savings at ${formatPercent(savingsPct)} (target: ≥${targets.savingsGoals.min}%)`);
    }

    if (guiltFreePct >= targets.guiltFreeSpending.min && guiltFreePct <= targets.guiltFreeSpending.max) {
        score += 25;
    } else if (guiltFreePct > targets.guiltFreeSpending.max) {
        issues.push(`Guilt-free at ${formatPercent(guiltFreePct)} (target: ≤${targets.guiltFreeSpending.max}%)`);
    }

    return { score, isHealthy: score >= 75, issues, percentages: { fixedPct, investPct, savingsPct, guiltFreePct } };
}

function updateHealthIndicator() {
    const health = getCSPHealth();
    const indicator = document.getElementById('healthIndicator');

    if (health.score === 100) {
        indicator.innerHTML = `<span class="w-2 h-2 rounded-full bg-green-500"></span><span class="text-green-500">Perfect</span>`;
        indicator.className = 'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-500/10';
    } else if (health.score >= 75) {
        indicator.innerHTML = `<span class="w-2 h-2 rounded-full bg-green-500"></span><span class="text-green-500">Healthy</span>`;
        indicator.className = 'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-500/10';
    } else if (health.score >= 50) {
        indicator.innerHTML = `<span class="w-2 h-2 rounded-full bg-yellow-500"></span><span class="text-yellow-500">Needs Work</span>`;
        indicator.className = 'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/10';
    } else {
        indicator.innerHTML = `<span class="w-2 h-2 rounded-full bg-red-500 health-pulse"></span><span class="text-red-500">Attention</span>`;
        indicator.className = 'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-red-500/10';
    }
    indicator.title = health.issues.length > 0 ? health.issues.join('\n') : 'All targets met!';
}

// ============================================
// CSP DOUGHNUT CHART
// ============================================

function renderCSPChart() {
    const ctx = document.getElementById('cspChart').getContext('2d');
    const latest = getLatestSnapshot();
    const isDark = document.documentElement.classList.contains('dark');

    const data = [
        latest.csp.fixedCosts,
        latest.csp.investments,
        latest.csp.savingsGoals,
        latest.csp.guiltFreeSpending
    ];

    if (cspChart) {
        cspChart.destroy();
    }

    cspChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Fixed Costs', 'Investments', 'Savings Goals', 'Guilt-Free'],
            datasets: [{
                data: data,
                backgroundColor: ['#ef4444', '#22c55e', '#3b82f6', '#a855f7'],
                borderColor: isDark ? '#1f2937' : '#ffffff',
                borderWidth: 3,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '65%',
            animation: { animateRotate: true, duration: 800 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? '#374151' : '#ffffff',
                    titleColor: isDark ? '#ffffff' : '#1f2937',
                    bodyColor: isDark ? '#d1d5db' : '#4b5563',
                    borderColor: isDark ? '#4b5563' : '#e5e7eb',
                    borderWidth: 1,
                    padding: 12,
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
    const data = getData();
    const latest = getLatestSnapshot();
    const netIncome = data.income.net;

    document.getElementById('monthlyIncome').textContent = formatCurrency(netIncome);

    const fixedPct = calculatePercentage(latest.csp.fixedCosts, netIncome);
    document.getElementById('cspFixed').textContent = formatCurrency(latest.csp.fixedCosts);
    document.getElementById('cspFixedPct').textContent = `(${formatPercent(fixedPct)})`;

    const investPct = calculatePercentage(latest.csp.investments, netIncome);
    document.getElementById('cspInvest').textContent = formatCurrency(latest.csp.investments);
    document.getElementById('cspInvestPct').textContent = `(${formatPercent(investPct)})`;

    const savingsPct = calculatePercentage(latest.csp.savingsGoals, netIncome);
    document.getElementById('cspSavings').textContent = formatCurrency(latest.csp.savingsGoals);
    document.getElementById('cspSavingsPct').textContent = `(${formatPercent(savingsPct)})`;

    const guiltFreePct = calculatePercentage(latest.csp.guiltFreeSpending, netIncome);
    document.getElementById('cspGuiltFree').textContent = formatCurrency(latest.csp.guiltFreeSpending);
    document.getElementById('cspGuiltFreePct').textContent = `(${formatPercent(guiltFreePct)})`;
}

// ============================================
// NET WORTH LINE CHART
// ============================================

function renderNetWorthChart() {
    const ctx = document.getElementById('netWorthChart').getContext('2d');
    const data = getData();
    let snapshots = [...data.snapshots];

    if (currentChartRange > 0 && snapshots.length > currentChartRange) {
        snapshots = snapshots.slice(-currentChartRange);
    }

    const labels = snapshots.map(s => formatShortDate(s.date));
    const totals = snapshots.map(s => s.netWorth.total);

    if (netWorthChart) {
        netWorthChart.destroy();
    }

    netWorthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Net Worth',
                data: totals,
                borderColor: '#7c3aed',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 4,
                pointBackgroundColor: '#7c3aed',
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: false,
            animation: { duration: 800, easing: 'easeOutQuart' },
            interaction: { intersect: false, mode: 'index' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#374151',
                    titleColor: '#ffffff',
                    bodyColor: '#d1d5db',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw);
                        }
                    }
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#9ca3af' } },
                y: {
                    grid: { color: '#374151' },
                    ticks: {
                        color: '#9ca3af',
                        callback: function(value) {
                            return '$' + (value / 1000) + 'k';
                        }
                    }
                }
            }
        }
    });
}

function setChartRange(months) {
    currentChartRange = months;
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
    const latest = getLatestSnapshot();
    const previous = getPreviousSnapshot();
    const nw = latest.netWorth;

    document.getElementById('netWorthTotal').textContent = formatCurrency(nw.total);
    document.getElementById('nwAssets').textContent = formatCurrency(nw.assets);
    document.getElementById('nwInvestments').textContent = formatCurrency(nw.investments);
    document.getElementById('nwSavings').textContent = formatCurrency(nw.savings);
    document.getElementById('nwDebt').textContent = formatCurrency(nw.debt);

    const changeContainer = document.getElementById('netWorthChange');
    if (previous) {
        const trend = calculateTrend(nw.total, previous.netWorth.total);
        changeContainer.innerHTML = `
            ${getTrendHTML(trend)}
            <span class="text-gray-500 text-sm ml-2">since ${formatShortDate(previous.date)}</span>
        `;
    } else {
        changeContainer.innerHTML = '<span class="text-gray-500 text-sm">First snapshot</span>';
    }
}

// ============================================
// STATS CARDS
// ============================================

function updateStatsCards() {
    const data = getData();
    const snapshots = data.snapshots;
    const latest = getLatestSnapshot();
    const first = snapshots[0];

    const allTimeGrowth = calculateTrend(latest.netWorth.total, first.netWorth.total);
    const monthsTracked = snapshots.length;
    const avgMonthlyGrowth = allTimeGrowth.change / Math.max(monthsTracked - 1, 1);

    const statsContainer = document.getElementById('statsContainer');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="bg-gray-800/50 rounded-xl p-4">
                <p class="text-gray-500 text-xs uppercase">All-Time Growth</p>
                <p class="text-xl font-bold text-white">${formatCurrency(allTimeGrowth.change)}</p>
                <p class="text-green-500 text-sm">+${allTimeGrowth.percent.toFixed(1)}%</p>
            </div>
            <div class="bg-gray-800/50 rounded-xl p-4">
                <p class="text-gray-500 text-xs uppercase">Avg Monthly</p>
                <p class="text-xl font-bold text-white">${formatCurrency(avgMonthlyGrowth)}</p>
                <p class="text-gray-400 text-sm">${monthsTracked} snapshots</p>
            </div>
            <div class="bg-gray-800/50 rounded-xl p-4">
                <p class="text-gray-500 text-xs uppercase">Debt Paid Off</p>
                <p class="text-xl font-bold text-white">${formatCurrency(first.netWorth.debt - latest.netWorth.debt)}</p>
                <p class="text-green-500 text-sm">${formatCurrency(latest.netWorth.debt)} remaining</p>
            </div>
        `;
    }
}

// ============================================
// GOALS RENDERING
// ============================================

function renderGoals() {
    const data = getData();
    const goals = data.goals;
    const container = document.getElementById('goalsContainer');

    container.innerHTML = '';

    Object.entries(goals).forEach(([key, goal]) => {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const remaining = goal.targetAmount - goal.currentAmount;
        const monthsToGoal = getMonthsUntilGoal(remaining, goal.monthlyContribution);
        const estimatedDate = addMonths(new Date(), monthsToGoal);

        const iconMap = {
            ring: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`,
            vacation: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/></svg>`,
            home: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`,
            emergency: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`,
            default: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
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
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white">${icon}</div>
                    <div>
                        <h4 class="font-semibold text-white">${goal.name}</h4>
                        <p class="text-sm text-gray-500">${formatCurrency(goal.monthlyContribution)}/month</p>
                    </div>
                </div>
                <span class="text-xs font-medium px-2 py-1 rounded-full ${goal.priority === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-gray-700 text-gray-400'}">${goal.priority}</span>
            </div>
            <div class="mb-4">
                <div class="flex justify-between text-sm mb-2">
                    <span class="text-gray-400">Progress</span>
                    <span class="text-white font-medium">${formatPercent(progress, 1)}</span>
                </div>
                <div class="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r ${gradientClass} rounded-full transition-all duration-1000" style="width: ${Math.min(progress, 100)}%"></div>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm">
                <div><p class="text-gray-500">Saved</p><p class="text-white font-semibold">${formatCurrency(goal.currentAmount)}</p></div>
                <div><p class="text-gray-500">Goal</p><p class="text-white font-semibold">${formatCurrency(goal.targetAmount)}</p></div>
                <div><p class="text-gray-500">Remaining</p><p class="text-white font-semibold">${formatCurrency(remaining)}</p></div>
                <div><p class="text-gray-500">Est. Complete</p><p class="text-iwt-purple font-semibold">${monthsToGoal === Infinity ? 'N/A' : estimatedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p></div>
            </div>
            ${goal.notes ? `<p class="mt-4 text-xs text-gray-500 italic">"${goal.notes}"</p>` : ''}
        `;
        container.appendChild(card);
    });
}

// ============================================
// REFRESH & INITIALIZATION
// ============================================

function refreshDashboard() {
    updateLastUpdated();
    updateNetWorthDisplay();
    updateCSPBreakdown();
    updateHealthIndicator();
    updateStatsCards();
    renderCSPChart();
    renderNetWorthChart();
    renderGoals();
}

function updateLastUpdated() {
    const latest = getLatestSnapshot();
    document.getElementById('lastUpdated').textContent = `Last: ${formatDate(latest.date)}`;
}

function init() {
    // Load data (from localStorage or defaults)
    getData();

    // Check dark mode
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'false') {
        toggleDarkMode();
    }

    // Setup form handler
    document.getElementById('snapshotForm').addEventListener('submit', handleSnapshotSubmit);

    // Close modals on backdrop click
    document.getElementById('snapshotModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    document.getElementById('settingsModal').addEventListener('click', function(e) {
        if (e.target === this) closeSettingsModal();
    });

    // Initial render
    refreshDashboard();

    console.log('Dashboard loaded with', getData().snapshots.length, 'snapshots');
}

// Init is called by auth.js after successful authentication
// document.addEventListener('DOMContentLoaded', init);
