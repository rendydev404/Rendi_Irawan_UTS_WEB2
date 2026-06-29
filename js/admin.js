/**
 * UTSmart - Admin Logic (terhubung ke Backend API)
 * Modul: Dashboard (stats), Produk (CRUD), Pesanan (status), Pengguna.
 */

const Admin = {
    products: [],
    users: [],
    _usersPollTimer: null,

    init: async () => {
        // Proteksi halaman: hanya admin
        if (!Auth.isLoggedIn() || Auth.session.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }

        Admin.setupTabs();
        Admin.setupProductModal();
        Admin.setupUserModal();

        await Admin.loadDashboard();
        await Admin.loadProducts();
        await Admin.loadOrders();
        await Admin.loadUsers();
        Admin.startUsersPolling();
    },

    // ---------- Tabs ----------
    setupTabs: () => {
        document.querySelectorAll('.admin-tab').forEach((tab) => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;

                document.querySelectorAll('.admin-tab').forEach((t) => {
                    t.classList.remove('border-accent', 'text-text-primary');
                    t.classList.add('border-transparent', 'text-text-secondary');
                });
                tab.classList.add('border-accent', 'text-text-primary');
                tab.classList.remove('border-transparent', 'text-text-secondary');

                document.querySelectorAll('.admin-section').forEach((s) => s.classList.add('hidden'));
                document.getElementById('section-' + target).classList.remove('hidden');
            });
        });
    },

    // ---------- Dashboard ----------
    loadDashboard: async () => {
        try {
            const res = await API.get('/api/admin/stats');
            const s = res.data;
            document.getElementById('stat-users').textContent = s.totalUsers;
            document.getElementById('stat-products').textContent = s.totalProducts;
            document.getElementById('stat-orders').textContent = s.totalOrders;
            document.getElementById('stat-revenue').textContent = Cart.formatCurrency(s.totalRevenue);
            document.getElementById('stat-online').textContent = s.onlineUsers ?? 0;
        } catch (err) {
            Toast.show(err.message, 'error');
        }
    },

    // ---------- Produk ----------
    loadProducts: async () => {
        try {
            const res = await API.get('/api/products', { auth: false });
            Admin.products = res.data || [];
            Admin.renderProductsTable();
        } catch (err) {
            Toast.show(err.message, 'error');
        }
    },

    renderProductsTable: () => {
        const tbody = document.getElementById('products-tbody');
        if (Admin.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-text-secondary">Belum ada produk</td></tr>';
            return;
        }
        tbody.innerHTML = Admin.products
            .map(
                (p) => `
            <tr class="border-b border-border hover:bg-bg-tertiary/50">
                <td class="py-3 px-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-white overflow-hidden flex-none">
                            <img src="${p.image}" class="w-full h-full object-cover mix-blend-multiply" onerror="this.src='https://via.placeholder.com/40'">
                        </div>
                        <span class="font-medium text-sm line-clamp-1">${p.name}</span>
                    </div>
                </td>
                <td class="py-3 px-4 text-sm text-text-secondary">${p.category || '-'}</td>
                <td class="py-3 px-4 text-sm text-right font-medium">${Cart.formatCurrency(p.price)}</td>
                <td class="py-3 px-4 text-sm text-right">${p.stock}</td>
                <td class="py-3 px-4 text-right whitespace-nowrap">
                    <button onclick="Admin.openProductModal(${p.id})" class="text-accent hover:underline text-sm mr-3">Edit</button>
                    <button onclick="Admin.deleteProduct(${p.id})" class="text-danger hover:underline text-sm">Hapus</button>
                </td>
            </tr>`
            )
            .join('');
    },

    setupProductModal: () => {
        document.getElementById('btn-add-product').addEventListener('click', () => Admin.openProductModal());
        document.getElementById('product-modal-close').addEventListener('click', Admin.closeProductModal);
        document.getElementById('product-cancel').addEventListener('click', Admin.closeProductModal);
        document.getElementById('product-form').addEventListener('submit', Admin.saveProduct);
        document.getElementById('p-image-file').addEventListener('change', Admin.handleImageUpload);
    },

    updateImagePreview: (url) => {
        const preview = document.getElementById('p-image-preview');
        preview.innerHTML = url
            ? `<img src="${url}" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<i data-lucide=\\'image-off\\' class=\\'w-6 h-6\\'></i>';lucide.createIcons();">`
            : `<i data-lucide="image" class="w-6 h-6"></i>`;
        lucide.createIcons();
    },

    handleImageUpload: async (e) => {
        const file = e.target.files[0];
        const status = document.getElementById('p-image-status');
        if (!file) return;

        status.textContent = 'Mengupload...';
        try {
            const res = await API.upload('/api/upload', file);
            document.getElementById('p-image').value = res.url;
            Admin.updateImagePreview(res.url);
            status.textContent = 'Upload berhasil ✓';
            Toast.show('Gambar berhasil diupload', 'success');
        } catch (err) {
            status.textContent = '';
            Toast.show(err.message || 'Upload gagal', 'error');
        }
    },

    openProductModal: (id = null) => {
        const form = document.getElementById('product-form');
        form.reset();
        document.getElementById('p-id').value = '';
        document.getElementById('p-image-status').textContent = '';
        Admin.updateImagePreview('');

        if (id) {
            const p = Admin.products.find((x) => x.id === id);
            if (!p) return;
            document.getElementById('product-modal-title').textContent = 'Edit Produk';
            document.getElementById('p-id').value = p.id;
            document.getElementById('p-name').value = p.name;
            document.getElementById('p-price').value = p.price;
            document.getElementById('p-stock').value = p.stock;
            document.getElementById('p-category').value = p.category || '';
            document.getElementById('p-brand').value = p.brand || '';
            document.getElementById('p-rating').value = p.rating || 0;
            document.getElementById('p-discount').value = p.discount || 0;
            document.getElementById('p-badge').value = p.badge || '';
            document.getElementById('p-image').value = p.image || '';
            document.getElementById('p-description').value = p.description || '';
            Admin.updateImagePreview(p.image || '');
        } else {
            document.getElementById('product-modal-title').textContent = 'Tambah Produk';
        }

        document.getElementById('product-modal').classList.remove('hidden');
    },

    closeProductModal: () => {
        document.getElementById('product-modal').classList.add('hidden');
    },

    saveProduct: async (e) => {
        e.preventDefault();
        const id = document.getElementById('p-id').value;
        const payload = {
            name: document.getElementById('p-name').value,
            price: Number(document.getElementById('p-price').value),
            stock: Number(document.getElementById('p-stock').value),
            category: document.getElementById('p-category').value,
            brand: document.getElementById('p-brand').value,
            rating: Number(document.getElementById('p-rating').value),
            discount: Number(document.getElementById('p-discount').value),
            badge: document.getElementById('p-badge').value,
            image: document.getElementById('p-image').value,
            description: document.getElementById('p-description').value,
        };

        try {
            if (id) {
                await API.put('/api/products/' + id, payload);
                Toast.show('Produk berhasil diperbarui', 'success');
            } else {
                await API.post('/api/products', payload);
                Toast.show('Produk berhasil ditambahkan', 'success');
            }
            Admin.closeProductModal();
            await Admin.loadProducts();
            await Admin.loadDashboard();
        } catch (err) {
            Toast.show(err.message, 'error');
        }
    },

    deleteProduct: async (id) => {
        if (!confirm('Yakin ingin menghapus produk ini?')) return;
        try {
            await API.del('/api/products/' + id);
            Toast.show('Produk dihapus', 'success');
            await Admin.loadProducts();
            await Admin.loadDashboard();
        } catch (err) {
            Toast.show(err.message, 'error');
        }
    },

    // ---------- Pesanan ----------
    loadOrders: async () => {
        const tbody = document.getElementById('orders-tbody');
        try {
            const res = await API.get('/api/orders');
            const orders = res.data || [];

            if (orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-text-secondary">Belum ada pesanan</td></tr>';
                return;
            }

            tbody.innerHTML = orders
                .map((order) => {
                    const badge = Admin.statusBadge(order.status);
                    return `
                    <tr class="border-b border-border hover:bg-bg-tertiary/50">
                        <td class="py-3 px-4 font-mono text-sm">${order.id}</td>
                        <td class="py-3 px-4 text-sm">${order.customerName || order.userEmail || '-'}</td>
                        <td class="py-3 px-4 text-sm">${App.formatDate(order.date)}</td>
                        <td class="py-3 px-4">${badge}</td>
                        <td class="py-3 px-4 font-bold text-right">${Cart.formatCurrency(order.total)}</td>
                        <td class="py-3 px-4 text-right">
                            <select onchange="Admin.updateStatus('${order.id}', this.value)" class="bg-bg-tertiary border border-border rounded px-2 py-1 text-xs">
                                ${['Processing', 'Shipped', 'Delivered', 'Cancelled']
                                    .map((st) => `<option value="${st}" ${order.status === st ? 'selected' : ''}>${st}</option>`)
                                    .join('')}
                            </select>
                        </td>
                    </tr>`;
                })
                .join('');
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="6" class="py-4 text-center text-danger">${err.message}</td></tr>`;
        }
    },

    statusBadge: (status) => {
        const map = {
            Processing: 'bg-warning/20 text-warning',
            Shipped: 'bg-blue-500/20 text-blue-400',
            Delivered: 'bg-success/20 text-success',
            Cancelled: 'bg-danger/20 text-danger',
        };
        const cls = map[status] || 'bg-bg-tertiary text-text-secondary';
        return `<span class="px-2 py-1 ${cls} rounded text-xs font-bold">${status}</span>`;
    },

    updateStatus: async (orderId, newStatus) => {
        const ok = await Orders.updateOrderStatus(orderId, newStatus);
        if (ok) {
            Toast.show(`Status order ${orderId} → ${newStatus}`, 'success');
            await Admin.loadOrders();
            await Admin.loadDashboard();
        }
    },

    // ---------- Pengguna ----------
    loadUsers: async () => {
        const tbody = document.getElementById('users-tbody');
        try {
            const res = await API.get('/api/admin/users');
            Admin.users = res.data || [];

            if (Admin.users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="py-4 text-center text-text-secondary">Belum ada pengguna</td></tr>';
                return;
            }

            tbody.innerHTML = Admin.users
                .map((u) => {
                    const statusDot = u.isOnline
                        ? '<span class="inline-flex items-center gap-1.5 text-success text-xs font-bold"><span class="w-2 h-2 rounded-full bg-success inline-block"></span>Online</span>'
                        : '<span class="inline-flex items-center gap-1.5 text-text-secondary text-xs font-bold"><span class="w-2 h-2 rounded-full bg-border inline-block"></span>Offline</span>';
                    return `
                <tr class="border-b border-border hover:bg-bg-tertiary/50">
                    <td class="py-3 px-4">${statusDot}</td>
                    <td class="py-3 px-4 text-sm font-medium">${u.name}</td>
                    <td class="py-3 px-4 text-sm text-text-secondary">${u.email}</td>
                    <td class="py-3 px-4 text-sm">
                        <span class="px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-danger/20 text-danger' : 'bg-bg-tertiary text-text-secondary'}">${u.role}</span>
                    </td>
                    <td class="py-3 px-4 text-sm text-text-secondary">${App.formatDate(u.created_at)}</td>
                    <td class="py-3 px-4 text-right whitespace-nowrap">
                        <button onclick="Admin.openUserModal('${u.id}')" class="text-accent hover:underline text-sm mr-3">Edit</button>
                        <button onclick="Admin.deleteUser('${u.id}')" class="text-danger hover:underline text-sm">Hapus</button>
                    </td>
                </tr>`;
                })
                .join('');
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="6" class="py-4 text-center text-danger">${err.message}</td></tr>`;
        }
    },

    /** Polling ringan agar status online/offline & dashboard tetap update tanpa reload manual. */
    startUsersPolling: () => {
        if (Admin._usersPollTimer) return;
        Admin._usersPollTimer = setInterval(() => {
            Admin.loadUsers();
            Admin.loadDashboard();
        }, 15000);
    },

    setupUserModal: () => {
        document.getElementById('btn-add-user').addEventListener('click', () => Admin.openUserModal());
        document.getElementById('user-modal-close').addEventListener('click', Admin.closeUserModal);
        document.getElementById('user-cancel').addEventListener('click', Admin.closeUserModal);
        document.getElementById('user-form').addEventListener('submit', Admin.saveUser);
    },

    openUserModal: (id = null) => {
        const form = document.getElementById('user-form');
        form.reset();
        document.getElementById('u-id').value = '';
        document.getElementById('u-password').required = true;
        document.getElementById('u-password-hint').textContent = '';

        if (id) {
            const u = Admin.users.find((x) => String(x.id) === String(id));
            if (!u) return;
            document.getElementById('user-modal-title').textContent = 'Edit Pengguna';
            document.getElementById('u-id').value = u.id;
            document.getElementById('u-name').value = u.name;
            document.getElementById('u-email').value = u.email;
            document.getElementById('u-role').value = u.role;
            document.getElementById('u-password').required = false;
            document.getElementById('u-password-hint').textContent = '(kosongkan jika tidak diubah)';
        } else {
            document.getElementById('user-modal-title').textContent = 'Tambah Pengguna';
        }

        document.getElementById('user-modal').classList.remove('hidden');
    },

    closeUserModal: () => {
        document.getElementById('user-modal').classList.add('hidden');
    },

    saveUser: async (e) => {
        e.preventDefault();
        const id = document.getElementById('u-id').value;
        const password = document.getElementById('u-password').value;

        const payload = {
            name: document.getElementById('u-name').value,
            email: document.getElementById('u-email').value,
            role: document.getElementById('u-role').value,
        };
        if (password) payload.password = password;

        try {
            if (id) {
                await API.put('/api/admin/users/' + id, payload);
                Toast.show('Pengguna berhasil diperbarui', 'success');
            } else {
                await API.post('/api/admin/users', payload);
                Toast.show('Pengguna berhasil ditambahkan', 'success');
            }
            Admin.closeUserModal();
            await Admin.loadUsers();
            await Admin.loadDashboard();
        } catch (err) {
            Toast.show(err.message, 'error');
        }
    },

    deleteUser: async (id) => {
        if (!confirm('Yakin ingin menghapus pengguna ini?')) return;
        try {
            await API.del('/api/admin/users/' + id);
            Toast.show('Pengguna dihapus', 'success');
            await Admin.loadUsers();
            await Admin.loadDashboard();
        } catch (err) {
            Toast.show(err.message, 'error');
        }
    },
};

// Expose to window for inline onclicks
window.Admin = Admin;
window.addEventListener('DOMContentLoaded', Admin.init);
