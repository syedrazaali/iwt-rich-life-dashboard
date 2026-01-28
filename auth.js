/**
 * Simple Password Gate Authentication
 * This is a deterrent layer for casual visitors, not bank-level security.
 *
 * To change the password:
 * 1. Open browser console on any page
 * 2. Run: await crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR_NEW_PASSWORD')).then(h => Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join(''))
 * 3. Copy the hash and replace PASSWORD_HASH below
 */

const AUTH = {
    // SHA-256 hash of password - default is "richlife"
    // To change: run in browser console:
    // hashPassword('YOUR_NEW_PASSWORD').then(h => console.log('New hash:', h))
    PASSWORD_HASH: "c2417fc03d9cd8633f4e308d92d78c99917d58227947d9a53706950259da7d74",

    // Session duration in days
    SESSION_DAYS: 30,

    // Storage key
    STORAGE_KEY: "iwt_auth_token"
};

// Generate hash from password
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "_iwt_salt_2024");
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem(AUTH.STORAGE_KEY);
    if (!token) return false;

    try {
        const data = JSON.parse(atob(token));
        const expiry = new Date(data.expiry);
        return expiry > new Date();
    } catch {
        return false;
    }
}

// Set authentication
function setAuthenticated() {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + AUTH.SESSION_DAYS);
    const token = btoa(JSON.stringify({ auth: true, expiry: expiry.toISOString() }));
    localStorage.setItem(AUTH.STORAGE_KEY, token);
}

// Clear authentication
function clearAuth() {
    localStorage.removeItem(AUTH.STORAGE_KEY);
    showLoginScreen();
}

// Verify password
async function verifyPassword(password) {
    const hash = await hashPassword(password);
    return hash === AUTH.PASSWORD_HASH;
}

// Handle login form submit
async function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('authPassword').value;
    const errorEl = document.getElementById('authError');
    const submitBtn = document.getElementById('authSubmit');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';
    errorEl.classList.add('hidden');

    // Small delay to prevent brute force
    await new Promise(r => setTimeout(r, 500));

    const isValid = await verifyPassword(password);

    if (isValid) {
        setAuthenticated();
        showDashboard();
    } else {
        errorEl.textContent = 'Incorrect password';
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Access Dashboard';
        document.getElementById('authPassword').value = '';
    }
}

// Show login screen
function showLoginScreen() {
    document.getElementById('authScreen').innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-4">
            <div class="w-full max-w-md">
                <div class="text-center mb-8">
                    <div class="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-iwt-purple to-blue-500 flex items-center justify-center mb-4">
                        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                    </div>
                    <h1 class="text-3xl font-bold bg-gradient-to-r from-iwt-purple to-blue-400 bg-clip-text text-transparent">
                        Rich Life Dashboard
                    </h1>
                    <p class="text-gray-500 mt-2">Enter password to access your dashboard</p>
                </div>

                <form onsubmit="handleLogin(event)" class="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-400 mb-2">Password</label>
                        <input
                            type="password"
                            id="authPassword"
                            required
                            autocomplete="current-password"
                            class="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-iwt-purple focus:outline-none focus:ring-1 focus:ring-iwt-purple"
                            placeholder="Enter your password"
                        >
                    </div>

                    <div id="authError" class="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm hidden"></div>

                    <button
                        type="submit"
                        id="authSubmit"
                        class="w-full px-6 py-3 bg-iwt-purple text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
                    >
                        Access Dashboard
                    </button>
                </form>

                <p class="text-center text-gray-700 text-xs mt-8">
                    Personal Finance Dashboard
                </p>
            </div>
        </div>
    `;
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('dashboardContent').classList.add('hidden');

    // Focus password field
    setTimeout(() => document.getElementById('authPassword')?.focus(), 100);
}

// Show dashboard
function showDashboard() {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('dashboardContent').classList.remove('hidden');

    // Add logout button to header
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) {
        userDisplay.innerHTML = `
            <button onclick="clearAuth()" class="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors" title="Sign Out">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
            </button>
        `;
    }

    // Initialize dashboard
    if (typeof init === 'function') {
        init();
    }
}

// Check auth on page load
function checkAuth() {
    if (isAuthenticated()) {
        showDashboard();
    } else {
        showLoginScreen();
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', checkAuth);
