/**
 * UTSmart - Orders Logic
 */

const Orders = {
    init: () => {
        // Initialization
    },

    getUserOrders: () => {
        if (!Auth.isLoggedIn()) return [];
        const allOrders = Storage.get(STORAGE_KEYS.ORDERS) || [];
        // Sort by date desc
        return allOrders.filter(o => o.userId === Auth.session.id).sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    getOrderById: (orderId) => {
        const orders = Storage.get(STORAGE_KEYS.ORDERS) || [];
        return orders.find(o => o.id === orderId);
    },

    updateOrderStatus: (orderId, newStatus) => {
        const orders = Storage.get(STORAGE_KEYS.ORDERS) || [];
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
            Storage.set(STORAGE_KEYS.ORDERS, orders);
            return true;
        }
        return false;
    }
};
