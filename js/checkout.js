
const Checkout = {
    init: () => {
        // Form initialization happens in the HTML page
    },

    /**
     * Membuat order via API backend. Backend menghitung ulang total,
     * mengurangi stok, dan mengirim notifikasi ke WhatsApp owner (Fonnte).
     * @returns {Promise<string|false>} orderId jika sukses, false jika gagal.
     */
    placeOrder: async (shippingInfo, paymentMethod) => {
        if (!Auth.isLoggedIn()) return false;

        const cartItems = Cart.items;
        if (cartItems.length === 0) {
            Toast.show('Cart is empty', 'error');
            return false;
        }

        const payload = {
            items: cartItems.map(item => ({ id: item.id, quantity: item.quantity })),
            shipping: shippingInfo,
            paymentMethod: paymentMethod,
        };

        try {
            const res = await API.post('/api/checkout', payload);
            // Clear Cart setelah order berhasil
            Cart.clear();
            return res.orderId;
        } catch (err) {
            Toast.show(err.message || 'Gagal membuat order', 'error');
            return false;
        }
    }
};
