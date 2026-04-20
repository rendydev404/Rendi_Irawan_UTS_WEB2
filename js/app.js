
const App = {
    init: () => {
        App.setupDropdowns();
        App.setupScrollEffects();
        const yearElem = document.getElementById('current-year');
        if (yearElem) yearElem.textContent = new Date().getFullYear();
    },

    setupDropdowns: () => {
        // Global click listener to handle dropdown toggling
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.dropdown-btn');
            const menuClick = e.target.closest('.dropdown-menu');
            
            // If clicking inside the menu itself (but not a link), do nothing
            if (!btn && menuClick && !e.target.closest('a')) {
                return;
            }

            // If clicking a link inside the menu, or clicking outside entirely, close menus
            if (!btn) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.classList.add('opacity-0', 'invisible', 'scale-95');
                    menu.classList.remove('opacity-100', 'visible', 'scale-100');
                });
                return;
            }
            
            // Find the dropdown menu next to the clicked button
            const wrapper = btn.closest('.group') || btn.parentElement;
            const menu = wrapper.querySelector('.dropdown-menu');
            
            if (menu) {
                // Close other open dropdowns first (optional, but good practice)
                document.querySelectorAll('.dropdown-menu').forEach(otherMenu => {
                    if (otherMenu !== menu) {
                        otherMenu.classList.add('opacity-0', 'invisible', 'scale-95');
                        otherMenu.classList.remove('opacity-100', 'visible', 'scale-100');
                    }
                });

                // Toggle current menu
                const isOpen = !menu.classList.contains('opacity-0');
                if (isOpen) {
                    menu.classList.add('opacity-0', 'invisible', 'scale-95');
                    menu.classList.remove('opacity-100', 'visible', 'scale-100');
                } else {
                    menu.classList.remove('opacity-0', 'invisible', 'scale-95');
                    menu.classList.add('opacity-100', 'visible', 'scale-100');
                }
            }
        });
    },

    setupScrollEffects: () => {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                navbar.classList.add('shadow-lg', 'bg-bg-primary/95', 'backdrop-blur-md');
                navbar.classList.remove('bg-transparent');
                navbar.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            } else {
                navbar.classList.remove('shadow-lg', 'bg-bg-primary/95', 'backdrop-blur-md');
                navbar.style.borderBottom = '1px solid transparent';
            }
        });
    },

    /**
     * Utility to format date
     */
    formatDate: (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }
};

// Initialize on load
window.addEventListener('DOMContentLoaded', App.init);

// Custom Event Listeners
window.addEventListener('toggle-wishlist', (e) => {
    const productId = e.detail;
    // Wishlist logic will be handled in wishlist.js if loaded, 
    // but we can provide a fallback basic implementation here for immediate feedback
    if (typeof Wishlist === 'undefined') {
        if (!Auth.isLoggedIn()) {
            Toast.show('Login required for wishlist', 'warning');
            return;
        }
        
        let wishlist = Storage.get(STORAGE_KEYS.WISHLIST) || [];
        const index = wishlist.indexOf(productId);
        
        if (index === -1) {
            wishlist.push(productId);
            Storage.set(STORAGE_KEYS.WISHLIST, wishlist);
            Toast.show('Added to Wishlist', 'success');
        } else {
            wishlist.splice(index, 1);
            Storage.set(STORAGE_KEYS.WISHLIST, wishlist);
            Toast.show('Removed from Wishlist', 'info');
        }
        
        // Toggle icon visual
        document.querySelectorAll(`.wishlist-btn[data-id="${productId}"]`).forEach(btn => {
            const icon = btn.querySelector('.heart-icon');
            if (index === -1) {
                icon.setAttribute('fill', 'currentColor');
                btn.classList.add('text-danger');
            } else {
                icon.setAttribute('fill', 'none');
                btn.classList.remove('text-danger');
            }
        });
    }
});
