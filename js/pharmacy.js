/* Pharmacy Management Module */

const Pharmacy = {
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

  // Render the pharmacy table list
  renderList() {
    const tbody = document.getElementById('pharmacy-tbody');
    if (!tbody) return;

    let pharmacies = window.AppStorage.get('pharmacies') || [];

    // Apply Search Filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      pharmacies = pharmacies.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.owner.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        p.license.toLowerCase().includes(query)
      );
    }

    // Apply Status Filter
    if (this.filterStatus !== 'All') {
      pharmacies = pharmacies.filter(p => p.status === this.filterStatus);
    }

    // Apply Sorting
    pharmacies.sort((a, b) => {
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
    const totalItems = pharmacies.length;
    const totalPages = Math.ceil(totalItems / this.rowsPerPage);
    this.currentPage = Math.min(this.currentPage, totalPages || 1);
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    const paginatedPharmacies = pharmacies.slice(start, end);

    tbody.innerHTML = '';

    if (paginatedPharmacies.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-secondary">No pharmacies found matching the criteria.</td></tr>`;
      this.renderPagination(0, 0, 0);
      return;
    }

    paginatedPharmacies.forEach(p => {
      let statusClass = 'badge-inactive';
      if (p.status === 'Active') statusClass = 'badge-active';
      else if (p.status === 'Pending') statusClass = 'badge-pending';
      else if (p.status === 'Suspended') statusClass = 'badge-suspended';

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-surface-container-low transition-colors hoverable';
      tr.innerHTML = `
        <td class="px-6 py-4 font-bold text-primary">${p.id}</td>
        <td class="px-6 py-4">
          <div>
            <p class="font-semibold text-sm">${p.name}</p>
            <p class="text-xs text-secondary">${p.address}</p>
          </div>
        </td>
        <td class="px-6 py-4">
          <div>
            <p class="font-semibold text-sm">${p.owner}</p>
            <p class="text-xs text-secondary">${p.email}</p>
          </div>
        </td>
        <td class="px-6 py-4 text-sm">${p.license}</td>
        <td class="px-6 py-4">
          <span class="badge ${statusClass}">${p.status}</span>
        </td>
        <td class="px-6 py-4 text-right">
          <div class="flex justify-end gap-2">
            <button onclick="Pharmacy.openEditModal('${p.id}')" class="text-secondary hover:text-primary p-1">
              <span class="material-symbols-outlined text-sm">edit</span>
            </button>
            <button onclick="Pharmacy.deletePharmacy('${p.id}')" class="text-secondary hover:text-error p-1">
              <span class="material-symbols-outlined text-sm">delete</span>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    this.renderPagination(totalItems, start + 1, Math.min(end, totalItems));
  },

  // Render pagination controls
  renderPagination(totalItems, start, end) {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;

    const totalPages = Math.ceil(totalItems / this.rowsPerPage);

    paginationContainer.innerHTML = `
      <p class="text-body-sm text-secondary text-xs">Showing <b>${start}-${end}</b> of <b>${totalItems}</b> pharmacies</p>
      <div class="pagination-buttons">
        <button onclick="Pharmacy.changePage(${this.currentPage - 1})" class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''}>
          Previous
        </button>
        <button onclick="Pharmacy.changePage(${this.currentPage + 1})" class="pagination-btn" ${this.currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}>
          Next
        </button>
      </div>
    `;
  },

  changePage(page) {
    this.currentPage = page;
    this.renderList();
  },

  // Handle search and filters
  setupEventListeners() {
    const searchInput = document.getElementById('pharmacy-search');
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
  },

  // Delete a pharmacy
  deletePharmacy(id) {
    if (confirm(`Are you sure you want to delete pharmacy ${id}?`)) {
      window.AppStorage.deleteFromList('pharmacies', id);
      window.AppStorage.logAction('Delete Pharmacy', `Deleted pharmacy ${id}`);
      window.UI.showToast(`Pharmacy ${id} deleted successfully.`, 'success');
      this.renderList();
    }
  },

  // Open modal to add a new pharmacy
  openAddModal() {
    document.getElementById('modal-title').textContent = 'Add New Pharmacy';
    document.getElementById('pharmacy-form').reset();
    document.getElementById('pharmacy-id').value = '';
    window.UI.openModal('pharmacy-modal');
  },

  // Open modal to edit a pharmacy
  openEditModal(id) {
    const pharmacies = window.AppStorage.get('pharmacies') || [];
    const p = pharmacies.find(item => item.id === id);
    if (!p) return;

    document.getElementById('modal-title').textContent = 'Edit Pharmacy';
    document.getElementById('pharmacy-id').value = p.id;
    document.getElementById('pharmacy-name').value = p.name;
    document.getElementById('pharmacy-owner').value = p.owner;
    document.getElementById('pharmacy-email').value = p.email;
    document.getElementById('pharmacy-phone').value = p.phone;
    document.getElementById('pharmacy-license').value = p.license;
    document.getElementById('pharmacy-address').value = p.address;
    document.getElementById('pharmacy-status').value = p.status;

    window.UI.openModal('pharmacy-modal');
  },

  // Save pharmacy (Add or Edit)
  savePharmacy(e) {
    e.preventDefault();
    const id = document.getElementById('pharmacy-id').value;
    const name = document.getElementById('pharmacy-name').value;
    const owner = document.getElementById('pharmacy-owner').value;
    const email = document.getElementById('pharmacy-email').value;
    const phone = document.getElementById('pharmacy-phone').value;
    const license = document.getElementById('pharmacy-license').value;
    const address = document.getElementById('pharmacy-address').value;
    const status = document.getElementById('pharmacy-status').value;

    if (id) {
      // Edit mode
      window.AppStorage.updateInList('pharmacies', id, {
        name, owner, email, phone, license, address, status,
        verification: status === 'Active' ? 'Verified' : 'Pending'
      });
      window.AppStorage.logAction('Edit Pharmacy', `Updated pharmacy ${id} details`);
      window.UI.showToast(`Pharmacy ${id} updated successfully.`, 'success');
    } else {
      // Add mode
      const newId = 'PH-' + String(Math.floor(Math.random() * 900) + 100);
      const newPharmacy = {
        id: newId,
        name, owner, email, phone, license, address, status,
        verification: status === 'Active' ? 'Verified' : 'Pending',
        rating: 0.0,
        ordersCompleted: 0,
        revenue: 0.0,
        lat: 37.7749,
        lng: -122.4194,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      window.AppStorage.addToList('pharmacies', newPharmacy);
      window.AppStorage.logAction('Add Pharmacy', `Created new pharmacy ${newId}`);
      window.UI.showToast(`Pharmacy ${newId} created successfully.`, 'success');
    }

    window.UI.closeModal('pharmacy-modal');
    this.renderList();
  },

  // Render verification queue page
  renderVerificationQueue() {
    const tbody = document.getElementById('verification-tbody');
    if (!tbody) return;

    const pharmacies = window.AppStorage.get('pharmacies') || [];
    const pendingPharmacies = pharmacies.filter(p => p.verification === 'Pending');

    tbody.innerHTML = '';

    if (pendingPharmacies.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-secondary">No pending pharmacy verifications.</td></tr>`;
      return;
    }

    pendingPharmacies.forEach(p => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-surface-container-low transition-colors hoverable';
      tr.innerHTML = `
        <td class="px-6 py-4 font-bold text-primary">${p.id}</td>
        <td class="px-6 py-4 font-semibold">${p.name}</td>
        <td class="px-6 py-4">${p.owner}</td>
        <td class="px-6 py-4 text-sm">${p.license}</td>
        <td class="px-6 py-4">
          <span class="badge badge-pending">Pending</span>
        </td>
        <td class="px-6 py-4 text-right">
          <div class="flex justify-end gap-2">
            <button onclick="Pharmacy.verifyPharmacy('${p.id}', 'Verified')" class="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-container transition-colors">
              Approve
            </button>
            <button onclick="Pharmacy.verifyPharmacy('${p.id}', 'Rejected')" class="bg-error text-on-error px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-colors">
              Reject
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  // Verify pharmacy (Approve or Reject)
  verifyPharmacy(id, status) {
    const finalStatus = status === 'Verified' ? 'Active' : 'Suspended';
    window.AppStorage.updateInList('pharmacies', id, {
      verification: status,
      status: finalStatus
    });

    window.AppStorage.logAction('Verify Pharmacy', `Pharmacy ${id} verification set to ${status}`);
    window.UI.showToast(`Pharmacy ${id} has been ${status.toLowerCase()}.`, 'success');

    this.renderVerificationQueue();
  }
};

// Initialize on DOM load if on pharmacy pages
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('pharmacy-tbody')) {
    Pharmacy.init();
  }
  if (document.getElementById('verification-tbody')) {
    Pharmacy.renderVerificationQueue();
  }
});

window.Pharmacy = Pharmacy;
