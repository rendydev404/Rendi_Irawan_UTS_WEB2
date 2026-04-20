
const Theme = {
    init: () => {
        // Apply saved theme on load
        Theme.applyTheme();
        
        // Setup toggle listener for all toggle buttons
        document.querySelectorAll('.theme-toggle, #theme-toggle, #mobile-theme-toggle').forEach(btn => {
            btn.addEventListener('click', Theme.toggleTheme);
        });
    },

    getTheme: () => {
        return Storage.get(STORAGE_KEYS.THEME) || 'dark';
    },

    applyTheme: () => {
        const currentTheme = Theme.getTheme();
        const root = document.documentElement;
        
        const moonIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
        const sunIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';

        if (currentTheme === 'light') {
            root.classList.remove('dark');
            root.classList.add('light'); // Keep light class for our custom CSS targeting
            // Update all toggle icons
            document.querySelectorAll('.theme-icon, #theme-icon').forEach(iconSpan => {
                iconSpan.innerHTML = moonIcon;
            });
        } else {
            root.classList.add('dark');
            root.classList.remove('light');
            // Update all toggle icons
            document.querySelectorAll('.theme-icon, #theme-icon').forEach(iconSpan => {
                iconSpan.innerHTML = sunIcon;
            });
        }
    },

    toggleTheme: () => {
        const currentTheme = Theme.getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        Storage.set(STORAGE_KEYS.THEME, newTheme);
        Theme.applyTheme();
        
        // Optional: Show toast
        if (typeof Toast !== 'undefined') {
            Toast.show(`Switched to ${newTheme} mode`, 'success', 2000);
        }
    }
};

// Initialize on load
window.addEventListener('DOMContentLoaded', Theme.init);
