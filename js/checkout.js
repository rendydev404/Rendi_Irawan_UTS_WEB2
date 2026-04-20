
const Checkout = {
    init: () => {
        // Form initialization happens in the HTML page
    },

    generateTransactionId: () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `TRX-${year}${month}${day}-${randomStr}`;
    },

    placeOrder: (shippingInfo, paymentMethod) => {
        if (!Auth.isLoggedIn()) return false;
        
        const cartItems = Cart.items;
        if (cartItems.length === 0) {
            Toast.show('Cart is empty', 'error');
            return false;
        }

        const totals = Cart.getTotals();
        
        const newOrder = {
            id: Checkout.generateTransactionId(),
            userId: Auth.session.id,
            userEmail: Auth.session.email,
            date: new Date().toISOString(),
            status: 'Processing', // Default status
            items: [...cartItems],
            shipping: shippingInfo,
            paymentMethod: paymentMethod,
            subtotal: totals.subtotal,
            discount: totals.discountTotal,
            total: totals.total
        };

        const orders = Storage.get(STORAGE_KEYS.ORDERS) || [];
        orders.push(newOrder);
        Storage.set(STORAGE_KEYS.ORDERS, orders);

        // Clear Cart
        Cart.clear();

        return newOrder.id;
    }
};
