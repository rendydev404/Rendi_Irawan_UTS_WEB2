/**
 * UTSmart - Orders Logic
 */

const Orders = {
    init: () => {
        // Initialization
    },

    /** Order milik user yang login (admin mendapat semua order dari backend). */
    getUserOrders: async () => {
        if (!Auth.isLoggedIn()) return [];
        try {
            const res = await API.get('/api/orders');
            return res.data || [];
        } catch (err) {
            if (typeof Toast !== 'undefined') Toast.show(err.message, 'error');
            return [];
        }
    },

    getOrderById: async (orderId) => {
        try {
            const res = await API.get('/api/orders/' + encodeURIComponent(orderId));
            return res.data;
        } catch (err) {
            return null;
        }
    },

    updateOrderStatus: async (orderId, newStatus) => {
        try {
            await API.put('/api/orders/' + encodeURIComponent(orderId) + '/status', { status: newStatus });
            return true;
        } catch (err) {
            if (typeof Toast !== 'undefined') Toast.show(err.message, 'error');
            return false;
        }
    }
};
