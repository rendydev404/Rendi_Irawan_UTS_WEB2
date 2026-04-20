
const Cart = {
    items: Storage.get(STORAGE_KEYS.CART) || [],

    init: () => {
        Cart.updateBadge();
    },

    /**
     * Add product to cart
     */
    add: (product, quantity = 1) => {
        if (!Auth.isLoggedIn()) {
            Toast.show('Please login to add items to cart', 'warning');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return false;
        }

        const existingItem = Cart.items.find(item => item.id === product.id);

        if (existingItem) {
            // Check stock limit
            if (existingItem.quantity + quantity > product.stock) {
                Toast.show('Cannot add more than available stock', 'error');
                return false;
            }
            existingItem.quantity += quantity;
        } else {
            if (quantity > product.stock) {
                Toast.show('Requested quantity exceeds stock', 'error');
                return false;
            }
            Cart.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                stock: product.stock,
                discount: product.discount || 0,
                quantity: quantity
            });
        }

        Cart.save();
        Toast.show(`${product.name} added to cart`, 'success');
        return true;
    },

    /**
     * Remove product from cart
     */
    remove: (productId) => {
        Cart.items = Cart.items.filter(item => item.id !== productId);
        Cart.save();
        
        // Trigger event for cart page update
        window.dispatchEvent(new CustomEvent('cart-updated'));
    },

    /**
     * Update quantity of a cart item
     */
    updateQuantity: (productId, newQuantity) => {
        const item = Cart.items.find(item => item.id === productId);
        if (!item) return false;

        if (newQuantity <= 0) {
            Cart.remove(productId);
            return true;
        }

        if (newQuantity > item.stock) {
            Toast.show(`Only ${item.stock} items available`, 'warning');
            item.quantity = item.stock;
        } else {
            item.quantity = newQuantity;
        }

        Cart.save();
        // Trigger event for cart page update
        window.dispatchEvent(new CustomEvent('cart-updated'));
        return true;
    },

    /**
     * Clear the entire cart
     */
    clear: () => {
        Cart.items = [];
        Cart.save();
        window.dispatchEvent(new CustomEvent('cart-updated'));
    },

    /**
     * Calculate totals
     */
    getTotals: () => {
        let subtotal = 0;
        let discountTotal = 0;

        Cart.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            if (item.discount > 0) {
                const discountAmount = itemTotal * (item.discount / 100);
                discountTotal += discountAmount;
            }
        });

        const total = subtotal - discountTotal;

        return { subtotal, discountTotal, total };
    },

    /**
     * Get number of unique items
     */
    getCount: () => {
        return Cart.items.length;
    },

    /**
     * Format currency helper
     */
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Save to localStorage and update UI
     */
    save: () => {
        Storage.set(STORAGE_KEYS.CART, Cart.items);
        Cart.updateBadge();
    },

    /**
     * Update navbar cart badge
     */
    updateBadge: () => {
        const badges = document.querySelectorAll('.cart-badge');
        const count = Cart.getCount();
        
        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count;
                badge.classList.remove('hidden');
                // Trigger small animation
                badge.classList.remove('animate-scale-in');
                void badge.offsetWidth; // trigger reflow
                badge.classList.add('animate-scale-in');
            } else {
                badge.classList.add('hidden');
            }
        });
    }
};

// Initialize on load
window.addEventListener('DOMContentLoaded', Cart.init);
