/**
 * Firebase Google Authentication
 * Only allows access for specific email address
 *
 * SETUP (one-time, ~5 minutes):
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project (or use existing)
 * 3. Go to Authentication → Sign-in method → Enable Google
 * 4. Go to Project Settings → General → Your apps → Add web app
 * 5. Copy the firebaseConfig values below
 * 6. Go to Authentication → Settings → Authorized domains
 *    Add: syedrazaali.github.io
 */

// Firebase Configuration
const firebaseConfig = {
    apiKey: "REMOVED_API_KEY",
    authDomain: "iwt-dashboard.firebaseapp.com",
    projectId: "iwt-dashboard",
    storageBucket: "iwt-dashboard.firebasestorage.app",
    messagingSenderId: "REMOVED_SENDER_ID",
    appId: "1:REMOVED_SENDER_ID:web:0323300f00056f54ecc0db"
};

// Only these emails can access the dashboard
const ALLOWED_EMAILS = [
    "srazaaliabidi@gmail.com",
    "farhussain16@gmail.com"
];

// Firebase instances
let auth = null;
let provider = null;

// Initialize Firebase
function initFirebase() {
    if (firebaseConfig.apiKey === "YOUR_API_KEY") {
        showSetupRequired();
        return false;
    }

    try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        return true;
    } catch (error) {
        console.error("Firebase init error:", error);
        showError("Failed to initialize authentication");
        return false;
    }
}

// Check authentication state
function checkAuth() {
    if (!initFirebase()) return;

    showLoading();

    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in - verify email is in allowed list
            const isAllowed = ALLOWED_EMAILS.some(
                email => email.toLowerCase() === user.email.toLowerCase()
            );
            if (isAllowed) {
                showDashboard(user);
            } else {
                // Wrong email - sign them out
                showAccessDenied(user.email);
                setTimeout(() => signOut(), 3000);
            }
        } else {
            // No user signed in
            showLoginScreen();
        }
    });
}

// Sign in with Google
async function signIn() {
    if (!auth) return;

    showLoading();

    try {
        await auth.signInWithPopup(provider);
        // onAuthStateChanged will handle the rest
    } catch (error) {
        console.error("Sign in error:", error);
        if (error.code === 'auth/popup-closed-by-user') {
            showLoginScreen();
        } else if (error.code === 'auth/unauthorized-domain') {
            showError("Domain not authorized. Add this domain in Firebase Console → Authentication → Settings → Authorized domains");
        } else {
            showError(error.message || "Sign in failed");
        }
    }
}

// Sign out
async function signOut() {
    if (!auth) return;

    try {
        await auth.signOut();
    } catch (error) {
        console.error("Sign out error:", error);
    }
    showLoginScreen();
}

// UI Functions
function showLoading() {
    document.getElementById('authScreen').innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen bg-gray-950">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-iwt-purple border-t-transparent"></div>
            <p class="mt-4 text-gray-400">Authenticating...</p>
        </div>
    `;
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('dashboardContent').classList.add('hidden');
}

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
                    <p class="text-gray-500 mt-2">Sign in to access your dashboard</p>
                </div>

                <div class="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                    <button onclick="signIn()" class="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-gray-800 rounded-xl font-medium hover:bg-gray-100 transition-colors">
                        <svg class="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Sign in with Google
                    </button>

                    <p class="text-center text-gray-600 text-xs mt-6">
                        Only authorized accounts can access this dashboard
                    </p>
                </div>
            </div>
        </div>
    `;
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('dashboardContent').classList.add('hidden');
}

function showSetupRequired() {
    document.getElementById('authScreen').innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-4">
            <div class="w-full max-w-lg text-center">
                <div class="w-20 h-20 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center mb-6">
                    <svg class="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-white mb-4">Firebase Setup Required</h2>
                <div class="text-left bg-gray-900 rounded-xl p-6 border border-gray-800 text-sm text-gray-400">
                    <ol class="list-decimal list-inside space-y-2">
                        <li>Go to <a href="https://console.firebase.google.com/" target="_blank" class="text-iwt-purple hover:underline">Firebase Console</a></li>
                        <li>Create a new project</li>
                        <li>Authentication → Sign-in method → Enable Google</li>
                        <li>Project Settings → Add web app</li>
                        <li>Copy config to <code class="bg-gray-800 px-1 rounded">auth.js</code></li>
                        <li>Auth → Settings → Add <code class="bg-gray-800 px-1 rounded">syedrazaali.github.io</code></li>
                    </ol>
                </div>
            </div>
        </div>
    `;
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('dashboardContent').classList.add('hidden');
}

function showAccessDenied(email) {
    document.getElementById('authScreen').innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-4">
            <div class="w-full max-w-md text-center">
                <div class="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                    <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-white mb-2">Access Denied</h2>
                <p class="text-gray-400 mb-2">
                    <span class="text-red-400">${email}</span>
                </p>
                <p class="text-gray-500 text-sm">
                    This account is not authorized. Signing out...
                </p>
            </div>
        </div>
    `;
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('dashboardContent').classList.add('hidden');
}

function showError(message) {
    document.getElementById('authScreen').innerHTML = `
        <div class="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-4">
            <div class="w-full max-w-md text-center">
                <div class="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                    <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
                <h2 class="text-2xl font-bold text-white mb-2">Error</h2>
                <p class="text-gray-400 mb-6">${message}</p>
                <button onclick="showLoginScreen()" class="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                    Try Again
                </button>
            </div>
        </div>
    `;
    document.getElementById('authScreen').classList.remove('hidden');
    document.getElementById('dashboardContent').classList.add('hidden');
}

function showDashboard(user) {
    document.getElementById('authScreen').classList.add('hidden');
    document.getElementById('dashboardContent').classList.remove('hidden');

    // Show user info and logout in header
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) {
        userDisplay.innerHTML = `
            <img src="${user.photoURL || ''}" alt="" class="w-8 h-8 rounded-full border-2 border-gray-700 hidden sm:block">
            <button onclick="signOut()" class="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors" title="Sign Out">
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

// Start auth check on page load
document.addEventListener('DOMContentLoaded', checkAuth);
