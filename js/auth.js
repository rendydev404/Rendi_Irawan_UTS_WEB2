
const Auth = {
    // Current logged-in user session
    session: Storage.get(STORAGE_KEYS.SESSION),

    init: () => {
        Auth.updateUI();
    },

    updateUI: () => {
        const userMenu = document.getElementById('user-menu');
        const authLinks = document.getElementById('auth-links');
        const userGreeting = document.getElementById('user-greeting');
        const mobileAuthLinks = document.getElementById('mobile-nav-auth-links');
        const mobileLogoutBtn = document.getElementById('mobile-nav-logout-btn');

        if (Auth.isLoggedIn()) {
            const userName = Auth.session.name;
            if (userMenu) userMenu.classList.remove('hidden');
            if (authLinks) authLinks.classList.add('hidden');
            if (userGreeting) userGreeting.textContent = `Hi, ${userName.split(' ')[0]}`;
            if (mobileAuthLinks) mobileAuthLinks.classList.add('hidden');
            if (mobileLogoutBtn) mobileLogoutBtn.classList.remove('hidden');
        } else {
            if (userMenu) userMenu.classList.add('hidden');
            if (authLinks) authLinks.classList.remove('hidden');
            if (mobileAuthLinks) mobileAuthLinks.classList.remove('hidden');
            if (mobileLogoutBtn) mobileLogoutBtn.classList.add('hidden');
        }
    },

    isLoggedIn: () => {
        return Auth.session !== null;
    },

    getCurrentUser: () => {
        return Auth.session;
    },

    /**
     * Register a new user (via API)
     */
    register: async (name, email, password) => {
        try {
            const res = await API.post('/api/auth/register', { name, email, password }, { auth: false });
            if (res.token) {
                Storage.set(STORAGE_KEYS.TOKEN, res.token);
                Auth.session = res.user;
                Storage.set(STORAGE_KEYS.SESSION, res.user);
            }
            return { success: true, message: res.message || 'Registration successful', isAdmin: false };
        } catch (err) {
            return { success: false, message: err.message };
        }
    },

    /**
     * Login an existing user (via API)
     */
    login: async (email, password) => {
        try {
            const res = await API.post('/api/auth/login', { email, password }, { auth: false });
            Storage.set(STORAGE_KEYS.TOKEN, res.token);
            Auth.session = res.user;
            Storage.set(STORAGE_KEYS.SESSION, res.user);
            Auth.updateUI();
            return { success: true, message: res.message || 'Login successful', isAdmin: !!res.isAdmin };
        } catch (err) {
            return { success: false, message: err.message };
        }
    },

    /**
     * Logout current user
     */
    logout: () => {
        Auth.session = null;
        Storage.remove(STORAGE_KEYS.SESSION);
        Storage.remove(STORAGE_KEYS.TOKEN);
        Auth.updateUI();
        
        // Clear sensitive data on logout
        Storage.remove(STORAGE_KEYS.CART);
        Storage.remove(STORAGE_KEYS.WISHLIST);
        
        // Trigger event
        window.dispatchEvent(new Event('auth-change'));
        
        // Redirect to home if on protected page
        const protectedPages = ['cart.html', 'checkout.html', 'orders.html', 'wishlist.html'];
        const currentPage = window.location.pathname.split('/').pop();
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
    },
    
    /**
     * Require login wrapper function
     */
    requireLogin: (callback) => {
        if (Auth.isLoggedIn()) {
            if(callback) callback();
            return true;
        } else {
            Toast.show('Please login to continue', 'warning');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return false;
        }
    }
};

// Initialize on load
window.addEventListener('DOMContentLoaded', Auth.init);

// Global logout handler
document.addEventListener('click', (e) => {
    if (e.target.closest('#logout-btn') || e.target.closest('#mobile-nav-logout-btn')) {
        e.preventDefault();
        Auth.logout();
        Toast.show('Logged out successfully', 'success');
        setTimeout(() => window.location.reload(), 1000);
    }
});
