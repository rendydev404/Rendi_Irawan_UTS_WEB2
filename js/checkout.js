
const Checkout = {
    init: () => {
        // Form initialization happens in the HTML page
    },

    /**
     * Membuat order via API backend. Backend menghitung ulang total,
     * mengurangi stok, dan mengembalikan link WhatsApp (wa.me) berisi
     * detail pesanan untuk dikirim customer ke owner.
     * @returns {Promise<{orderId:string, whatsappUrl:string|null}|false>}
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
            return { orderId: res.orderId, whatsappUrl: res.whatsappUrl || null };
        } catch (err) {
            Toast.show(err.message || 'Gagal membuat order', 'error');
            return false;
        }
    }
};
