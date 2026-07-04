/* Order Monitoring Module */

const Orders = {
    columns: ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'],

    init() {
        this.renderBoard();
        this.setupRiderDropdown();
    },

    // Render Kanban Board columns and cards
    renderBoard() {
        const orders = window.AppStorage.get('orders') || [];

        this.columns.forEach(col => {
            const colId = `col-${col.toLowerCase().replace(/\s+/g, '-')}`;
            const container = document.getElementById(colId);
            if (!container) return;

            container.innerHTML = '';

            const colOrders = orders.filter(o => o.status === col);

            // Update column count badge
            const countBadge = document.getElementById(`count-${col.toLowerCase().replace(/\s+/g, '-')}`);
            if (countBadge) {
                countBadge.textContent = colOrders.length;
            }

            if (colOrders.length === 0) {
                container.innerHTML = `<div class="text-center py-8 text-xs text-secondary border border-dashed border-outline-variant rounded-xl">No orders</div>`;
                return;
            }

            colOrders.forEach(order => {
                const card = document.createElement('div');
                card.className = 'bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 card-lift';
                card.onclick = () => this.openOrderDetails(order.id);

                let riskBadge = '';
                if (order.riskScore === 'High') {
                    riskBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">High Risk</span>`;
                } else if (order.riskScore === 'Medium') {
                    riskBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Med Risk</span>`;
                }

                const riderText = order.riderName ? `🏍️ ${order.riderName}` : '⚠️ Unassigned';

                card.innerHTML = `
          <div class="flex justify-between items-start">
            <span class="font-bold text-primary text-xs">${order.id}</span>
            <div class="flex gap-1">${riskBadge}</div>
          </div>
          <div>
            <p class="font-semibold text-sm leading-tight">${order.customerName}</p>
            <p class="text-xs text-secondary mt-1">From: ${order.pharmacyName}</p>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-outline-variant/30 text-xs">
            <span class="text-secondary font-medium">${riderText}</span>
            <span class="font-bold text-on-surface">$${order.total.toFixed(2)}</span>
          </div>
        `;
                container.appendChild(card);
            });
        });
    },

    // Open order details modal
    openOrderDetails(id) {
        const orders = window.AppStorage.get('orders') || [];
        const order = orders.find(o => o.id === id);
        if (!order) return;

        document.getElementById('detail-order-id').textContent = order.id;
        document.getElementById('detail-customer').textContent = `${order.customerName} (${order.customerPhone})`;
        document.getElementById('detail-address').textContent = order.address;
        document.getElementById('detail-pharmacy').textContent = order.pharmacyName;
        document.getElementById('detail-payment').textContent = `${order.paymentMethod} ($${order.total.toFixed(2)})`;
        document.getElementById('detail-status').value = order.status;

        // Risk details
        const riskEl = document.getElementById('detail-risk');
        riskEl.textContent = `${order.riskScore} (${order.riskReason})`;
        riskEl.className = 'font-semibold text-sm ';
        if (order.riskScore === 'High') riskEl.className += 'text-error';
        else if (order.riskScore === 'Medium') riskEl.className += 'text-amber-500';
        else riskEl.className += 'text-primary';

        // Populate items list
        const itemsList = document.getElementById('detail-items-list');
        itemsList.innerHTML = '';
        order.items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'flex justify-between text-xs py-1 border-b border-outline-variant/20';
            li.innerHTML = `<span>${item.name} x ${item.qty}</span><span class="font-bold">$${(item.price * item.qty).toFixed(2)}</span>`;
            itemsList.appendChild(li);
        });

        // Populate rider dropdown
        const riderSelect = document.getElementById('detail-rider');
        riderSelect.value = order.riderId || '';

        // Save button handler
        const saveBtn = document.getElementById('save-order-details-btn');
        saveBtn.onclick = () => this.saveOrderDetails(order.id);

        window.UI.openModal('order-details-modal');
    },

    // Setup rider dropdown list
    setupRiderDropdown() {
        const riders = window.AppStorage.get('riders') || [];
        const select = document.getElementById('detail-rider');
        if (!select) return;

        select.innerHTML = '<option value="">-- Assign Rider --</option>';
        const activeRiders = riders.filter(r => r.status === 'Active');
        activeRiders.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = `${r.name} (${r.vehicleType})`;
            select.appendChild(opt);
        });
    },

    // Save order details (status and rider assignment)
    saveOrderDetails(id) {
        const status = document.getElementById('detail-status').value;
        const riderId = document.getElementById('detail-rider').value;

        const riders = window.AppStorage.get('riders') || [];
        const assignedRider = riders.find(r => r.id === riderId);
        const riderName = assignedRider ? assignedRider.name : null;

        window.AppStorage.updateInList('orders', id, {
            status,
            riderId: riderId || null,
            riderName: riderName
        });

        window.AppStorage.logAction('Update Order', `Updated order ${id} status to ${status} and rider to ${riderName || 'Unassigned'}`);
        window.UI.showToast(`Order ${id} updated successfully.`, 'success');
        window.UI.closeModal('order-details-modal');
        this.renderBoard();
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('col-pending')) {
        Orders.init();
    }
});

window.Orders = Orders;
