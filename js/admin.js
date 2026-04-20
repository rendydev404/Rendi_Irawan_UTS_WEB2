/**
 * UTSmart - Admin Logic
 */

const Admin = {
    init: () => {
        if (!Auth.isLoggedIn() || Auth.session.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
        
        Admin.renderDashboard();
    },

    renderDashboard: () => {
        const users = Storage.get(STORAGE_KEYS.USERS) || [];
        const orders = Storage.get(STORAGE_KEYS.ORDERS) || [];
        
        let totalRevenue = 0;
        orders.forEach(o => totalRevenue += o.total);

        document.getElementById('stat-users').textContent = users.length;
        document.getElementById('stat-orders').textContent = orders.length;
        document.getElementById('stat-revenue').textContent = Cart.formatCurrency(totalRevenue);

        Admin.renderOrdersTable(orders);
    },

    renderOrdersTable: (orders) => {
        const tbody = document.getElementById('orders-tbody');
        
        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-text-secondary">No orders yet</td></tr>';
            return;
        }

        // Sort latest first
        orders.sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = orders.map(order => {
            let statusBadge = '';
            if (order.status === 'Processing') statusBadge = '<span class="px-2 py-1 bg-warning/20 text-warning rounded text-xs font-bold">Processing</span>';
            if (order.status === 'Shipped') statusBadge = '<span class="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold">Shipped</span>';
            if (order.status === 'Delivered') statusBadge = '<span class="px-2 py-1 bg-success/20 text-success rounded text-xs font-bold">Delivered</span>';

            return `
                <tr class="border-b border-border hover:bg-bg-tertiary/50">
                    <td class="py-3 px-4 font-mono text-sm">${order.id}</td>
                    <td class="py-3 px-4 text-sm">${order.userEmail}</td>
                    <td class="py-3 px-4 text-sm">${App.formatDate(order.date)}</td>
                    <td class="py-3 px-4">${statusBadge}</td>
                    <td class="py-3 px-4 font-bold text-right">${Cart.formatCurrency(order.total)}</td>
                    <td class="py-3 px-4 text-right">
                        <select onchange="Admin.updateStatus('${order.id}', this.value)" class="bg-bg-tertiary border border-border rounded px-2 py-1 text-xs">
                            <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                            <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        </select>
                    </td>
                </tr>
            `;
        }).join('');
    },

    updateStatus: (orderId, newStatus) => {
        if (Orders.updateOrderStatus(orderId, newStatus)) {
            Toast.show(`Order ${orderId} status updated to ${newStatus}`, 'success');
            Admin.renderDashboard(); // Re-render to update UI (optional but good for consistency)
        }
    }
};

// Expose to window for inline onclicks
window.Admin = Admin;
window.addEventListener('DOMContentLoaded', Admin.init);
