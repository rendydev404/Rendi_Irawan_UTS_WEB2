
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

    isEmailUnique: (email) => {
        const users = Storage.get(STORAGE_KEYS.USERS) || [];
        return !users.some(user => user.email === email);
    },

    /**
     * Register a new user
     */
    register: (name, email, password) => {
        if (!Auth.isEmailUnique(email)) {
            return { success: false, message: 'Email already registered' };
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password, // Note: Storing plain text password for this UTS simulation
            role: 'user', // Default role
            createdAt: new Date().toISOString()
        };

        const users = Storage.get(STORAGE_KEYS.USERS) || [];
        users.push(newUser);
        Storage.set(STORAGE_KEYS.USERS, users);

        return { success: true, message: 'Registration successful' };
    },

    /**
     * Login an existing user
     */
    login: (email, password) => {
        // Admin hardcoded check (Bonus)
        if (email === 'admin@utsmart.com' && password === 'admin123') {
             const adminUser = {
                id: 'admin',
                name: 'Administrator',
                email: 'admin@utsmart.com',
                role: 'admin'
            };
            Auth.session = adminUser;
            Storage.set(STORAGE_KEYS.SESSION, adminUser);
            return { success: true, message: 'Admin login successful', isAdmin: true };
        }

        const users = Storage.get(STORAGE_KEYS.USERS) || [];
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Don't store password in session
            const { password: _, ...userWithoutPassword } = user;
            Auth.session = userWithoutPassword;
            Storage.set(STORAGE_KEYS.SESSION, userWithoutPassword);
            Auth.updateUI();
            return { success: true, message: 'Login successful', isAdmin: false };
        }

        return { success: false, message: 'Invalid email or password' };
    },

    /**
     * Logout current user
     */
    logout: () => {
        Auth.session = null;
        Storage.remove(STORAGE_KEYS.SESSION);
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
