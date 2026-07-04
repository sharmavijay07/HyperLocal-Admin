/* Dashboard Module */

const Dashboard = {
    async init() {
        // Ensure storage is initialized
        if (window.AppStorage) {
            await window.AppStorage.init();
        }

        this.loadKPIs();
        this.loadRecentOrders();
        this.loadTopPharmacies();
        this.loadRecentActivities();
        this.setupLiveSimulation();
    },

    // Load and calculate KPI values
    loadKPIs() {
        const pharmacies = window.AppStorage.get('pharmacies') || [];
        const riders = window.AppStorage.get('riders') || [];
        const orders = window.AppStorage.get('orders') || [];

        const activePharmacies = pharmacies.filter(p => p.status === 'Active').length;
        const activeRiders = riders.filter(r => r.status === 'Active').length;
        const totalOrders = orders.length;

        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

        // Calculate pending verifications
        const pendingPharmacies = pharmacies.filter(p => p.verification === 'Pending').length;
        const pendingRiders = riders.filter(r => r.verification === 'Pending').length;
        const verificationQueue = pendingPharmacies + pendingRiders;

        // Update UI elements
        document.getElementById('kpi-total-orders').textContent = totalOrders;
        document.getElementById('kpi-active-pharmacies').textContent = activePharmacies;
        document.getElementById('kpi-active-riders').textContent = activeRiders;
        document.getElementById('kpi-revenue').textContent = `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('kpi-verification-queue').textContent = verificationQueue;
    },

    // Load recent orders table
    loadRecentOrders() {
        const orders = window.AppStorage.get('orders') || [];
        const tbody = document.getElementById('recent-orders-tbody');
        if (!tbody) return;

        // Sort by orderTime descending and take top 5
        const recentOrders = [...orders]
            .sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime))
            .slice(0, 5);

        tbody.innerHTML = '';

        if (recentOrders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-secondary">No recent orders found.</td></tr>`;
            return;
        }

        recentOrders.forEach(order => {
            let statusClass = 'bg-surface-container-highest text-secondary';
            if (order.status === 'Delivered') statusClass = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            else if (order.status === 'Out for Delivery') statusClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            else if (order.status === 'Preparing' || order.status === 'Accepted') statusClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            else if (order.status === 'Pending') statusClass = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            else if (order.status === 'Cancelled') statusClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-surface-container-low transition-colors cursor-pointer hoverable';
            tr.onclick = () => {
                window.location.href = `order-monitoring.html?id=${order.id}`;
            };

            tr.innerHTML = `
        <td class="px-6 py-4 font-label-md text-primary font-bold">${order.id}</td>
        <td class="px-6 py-4">
          <div class="flex items-center gap-2">
            <span class="text-body-sm font-semibold">${order.customerName}</span>
          </div>
        </td>
        <td class="px-6 py-4 text-body-sm text-secondary">${order.pharmacyName}</td>
        <td class="px-6 py-4">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${statusClass}">${order.status}</span>
        </td>
        <td class="px-6 py-4 text-right font-bold text-body-sm">$${order.total.toFixed(2)}</td>
      `;
            tbody.appendChild(tr);
        });
    },

    // Load top performing pharmacies
    loadTopPharmacies() {
        const pharmacies = window.AppStorage.get('pharmacies') || [];
        const container = document.getElementById('top-pharmacies-container');
        if (!container) return;

        // Sort by revenue descending and take top 3
        const topPharmacies = [...pharmacies]
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 3);

        container.innerHTML = '';

        if (topPharmacies.length === 0) {
            container.innerHTML = `<p class="text-center text-secondary py-4">No pharmacy data available.</p>`;
            return;
        }

        topPharmacies.forEach((pharmacy, index) => {
            const div = document.createElement('div');
            div.className = 'flex items-center gap-3 py-2';
            div.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
          ${index + 1}
        </div>
        <div class="flex-grow">
          <p class="font-label-md font-semibold text-sm">${pharmacy.name}</p>
          <p class="text-xs text-secondary">${pharmacy.ordersCompleted} orders completed</p>
        </div>
        <div class="text-primary font-bold text-sm">$${pharmacy.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
      `;
            container.appendChild(div);
        });
    },

    // Load recent activities from audit logs
    loadRecentActivities() {
        const logs = window.AppStorage.get('audit_logs') || [];
        const container = document.getElementById('recent-activities-container');
        if (!container) return;

        container.innerHTML = '';

        // Take top 4 recent logs
        const recentLogs = logs.slice(0, 4);

        if (recentLogs.length === 0) {
            // Add some default activities if empty
            const defaults = [
                { action: 'System Init', details: 'MedEasy Logistics Portal initialized', timestamp: new Date().toISOString() },
                { action: 'Data Loaded', details: 'Static JSON data imported successfully', timestamp: new Date(Date.now() - 60000).toISOString() }
            ];
            defaults.forEach(log => this.renderActivityItem(container, log));
            return;
        }

        recentLogs.forEach(log => this.renderActivityItem(container, log));
    },

    renderActivityItem(container, log) {
        const div = document.createElement('div');
        div.className = 'relative pl-8 pb-4';

        let colorClass = 'bg-primary';
        if (log.action.includes('Alert') || log.action.includes('Error') || log.action.includes('Reject')) {
            colorClass = 'bg-error';
        } else if (log.action.includes('Pending') || log.action.includes('Update')) {
            colorClass = 'bg-amber-500';
        }

        const timeDiff = this.formatTimeAgo(new Date(log.timestamp));

        div.innerHTML = `
      <div class="absolute left-1 top-1 w-4 h-4 rounded-full ${colorClass} border-4 border-white dark:border-inverse-surface shadow-sm"></div>
      <p class="font-label-md leading-tight font-semibold text-sm">${log.action}</p>
      <p class="text-xs text-secondary mt-1">${log.details}</p>
      <p class="text-[10px] text-outline font-bold mt-1 uppercase">${timeDiff}</p>
    `;
        container.appendChild(div);
    },

    formatTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    },

    // Setup live simulation of orders and revenue
    setupLiveSimulation() {
        setInterval(() => {
            // Randomly update revenue slightly to simulate live transactions
            const orders = window.AppStorage.get('orders') || [];
            if (orders.length > 0) {
                const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
                // Add a small random fluctuation
                const simulatedRevenue = totalRevenue + (Math.random() * 50);
                const revEl = document.getElementById('kpi-revenue');
                if (revEl) {
                    revEl.textContent = `$${simulatedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                }
            }
        }, 5000);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
});

window.Dashboard = Dashboard;
