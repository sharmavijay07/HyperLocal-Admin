/* Users (Customer) Management Module */

const Users = {
  currentPage: 1,
  rowsPerPage: 5,
  filterStatus: 'All',
  searchQuery: '',
  sortBy: 'name',
  sortOrder: 'asc',

  init() {
    this.renderList();
    this.setupEventListeners();
  },

  // Calculate stats for a customer (number of orders, total spent)
  getCustomerStats(customerName, orders) {
    const customerOrders = orders.filter(o => o.customerName === customerName);
    const totalOrders = customerOrders.length;
    const totalSpent = customerOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    return { totalOrders, totalSpent };
  },

  // Render the customer table list
  renderList() {
    const tbody = document.getElementById('user-tbody');
    if (!tbody) return;

    let customers = window.AppStorage.get('customers') || [];
    const orders = window.AppStorage.get('orders') || [];

    // Apply Search Filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query) ||
        (c.phone && c.phone.includes(query))
      );
    }

    // Apply Status Filter
    if (this.filterStatus !== 'All') {
      customers = customers.filter(c => c.status === this.filterStatus);
    }

    // Apply Sorting
    customers.sort((a, b) => {
      let valA = a[this.sortBy];
      let valB = b[this.sortBy];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply Pagination
    const totalItems = customers.length;
    const totalPages = Math.ceil(totalItems / this.rowsPerPage);
    this.currentPage = Math.min(this.currentPage, totalPages || 1);
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    const paginatedCustomers = customers.slice(start, end);

    tbody.innerHTML = '';

    if (paginatedCustomers.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-secondary">No users found matching the criteria.</td></tr>`;
      this.renderPagination(0, 0, 0);
      return;
    }

    paginatedCustomers.forEach(c => {
      let statusClass = 'badge-inactive';
      if (c.status === 'Active') statusClass = 'badge-active';
      else if (c.status === 'Suspended') statusClass = 'badge-suspended';

      const stats = this.getCustomerStats(c.name, orders);

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-surface-container-low transition-colors hoverable';
      tr.innerHTML = `
        <td class="px-6 py-4 font-bold text-primary">${c.id}</td>
        <td class="px-6 py-4">
          <div>
            <p class="font-semibold text-sm">${c.name}</p>
            <p class="text-xs text-secondary">${c.address || 'N/A'}</p>
          </div>
        </td>
        <td class="px-6 py-4">
          <div>
            <p class="font-semibold text-sm">${c.email}</p>
            <p class="text-xs text-secondary">${c.phone || 'N/A'}</p>
          </div>
        </td>
        <td class="px-6 py-4 text-sm font-semibold">${stats.totalOrders} orders</td>
        <td class="px-6 py-4 text-sm font-bold text-primary">$${stats.totalSpent.toFixed(2)}</td>
        <td class="px-6 py-4">
          <span class="badge ${statusClass}">${c.status}</span>
        </td>
        <td class="px-6 py-4 text-right">
          <div class="flex justify-end gap-2" onclick="event.stopPropagation()">
            <button onclick="Users.viewDetails('${c.id}')" class="text-secondary hover:text-primary p-1" title="View Details">
              <span class="material-symbols-outlined text-sm">visibility</span>
            </button>
            <button onclick="Users.toggleStatus('${c.id}')" class="text-secondary hover:text-primary p-1" title="Toggle Status">
              <span class="material-symbols-outlined text-sm">${c.status === 'Active' ? 'block' : 'check_circle'}</span>
            </button>
          </div>
        </td>
      `;
      tr.onclick = () => this.viewDetails(c.id);
      tbody.appendChild(tr);
    });

    this.renderPagination(totalItems, totalPages, this.currentPage);
  },

  // Render pagination controls
  renderPagination(totalItems, totalPages, currentPage) {
    const container = document.getElementById('pagination-container');
    if (!container) return;

    if (totalItems === 0) {
      container.innerHTML = '';
      return;
    }

    const start = (currentPage - 1) * this.rowsPerPage + 1;
    const end = Math.min(currentPage * this.rowsPerPage, totalItems);

    let html = `
      <p class="text-xs text-secondary font-semibold">Showing <span>${start}</span> to <span>${end}</span> of <span>${totalItems}</span> users</p>
      <div class="pagination-buttons">
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="Users.changePage(${currentPage - 1})">Previous</button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      html += `
        <button class="pagination-btn ${currentPage === i ? 'active' : ''}" onclick="Users.changePage(${i})">${i}</button>
      `;
    }

    html += `
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="Users.changePage(${currentPage + 1})">Next</button>
      </div>
    `;

    container.innerHTML = html;
  },

  // Change table page
  changePage(page) {
    this.currentPage = page;
    this.renderList();
  },

  // Toggle customer status (Active / Suspended)
  toggleStatus(id) {
    const customers = window.AppStorage.get('customers') || [];
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    customer.status = customer.status === 'Active' ? 'Suspended' : 'Active';
    window.AppStorage.set('customers', customers);

    window.AppStorage.logAction('Toggle User Status', `Updated status of user ${customer.name} to ${customer.status}`);
    window.UI.showToast(`User ${customer.name} status updated to ${customer.status}`, 'success');

    this.renderList();
  },

  // View Customer detail details modal
  viewDetails(id) {
    const customers = window.AppStorage.get('customers') || [];
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    const orders = window.AppStorage.get('orders') || [];
    const customerOrders = orders.filter(o => o.customerName === customer.name);

    document.getElementById('detail-user-name').innerText = customer.name;
    document.getElementById('detail-user-id').innerText = customer.id;
    document.getElementById('detail-user-email').innerText = customer.email;
    document.getElementById('detail-user-phone').innerText = customer.phone || 'N/A';
    document.getElementById('detail-user-address').innerText = customer.address || 'N/A';
    document.getElementById('detail-user-status').innerText = customer.status;

    let statusBadgeClass = 'badge-inactive';
    if (customer.status === 'Active') statusBadgeClass = 'badge-active';
    else if (customer.status === 'Suspended') statusBadgeClass = 'badge-suspended';
    
    const statusSpan = document.getElementById('detail-user-status');
    statusSpan.className = `badge ${statusBadgeClass} text-xs`;

    // Render Order History
    const listContainer = document.getElementById('detail-user-orders-tbody');
    listContainer.innerHTML = '';

    if (customerOrders.length === 0) {
      listContainer.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-secondary text-xs">No orders placed yet.</td></tr>`;
    } else {
      customerOrders.forEach(o => {
        let badgeClass = 'badge-inactive';
        if (o.status === 'Delivered') badgeClass = 'badge-active';
        else if (o.status === 'Preparing' || o.status === 'Accepted' || o.status === 'Out for Delivery') badgeClass = 'badge-pending';
        else if (o.status === 'Cancelled') badgeClass = 'badge-suspended';

        // Build items bought string
        const itemsBought = o.items.map(item => `${item.name} (x${item.qty})`).join(', ');

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="px-4 py-2 font-bold text-primary">${o.id}</td>
          <td class="px-4 py-2 text-xs">${new Date(o.orderTime).toLocaleDateString()}</td>
          <td class="px-4 py-2 text-xs truncate max-w-[150px]" title="${itemsBought}">${itemsBought}</td>
          <td class="px-4 py-2 text-xs font-bold text-right">$${o.total.toFixed(2)}</td>
          <td class="px-4 py-2 text-right"><span class="badge ${badgeClass} text-[10px]">${o.status}</span></td>
        `;
        listContainer.appendChild(tr);
      });
    }

    window.UI.openModal('user-details-modal');
  },

  setupEventListeners() {
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.currentPage = 1;
        this.renderList();
      });
    }

    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.filterStatus = e.target.value;
        this.currentPage = 1;
        this.renderList();
      });
    }
  }
};

// Initialize Users on DOM content load
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.endsWith('user-management.html')) {
    Users.init();
  }
});

// Export to window
window.Users = Users;
