/* Rider Fleet Management Module */

const Rider = {
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

  // Render the rider table list
  renderList() {
    const tbody = document.getElementById('rider-tbody');
    if (!tbody) return;

    let riders = window.AppStorage.get('riders') || [];

    // Apply Search Filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      riders = riders.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query) ||
        r.vehicleType.toLowerCase().includes(query)
      );
    }

    // Apply Status Filter
    if (this.filterStatus !== 'All') {
      riders = riders.filter(r => r.status === this.filterStatus);
    }

    // Apply Sorting
    riders.sort((a, b) => {
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
    const totalItems = riders.length;
    const totalPages = Math.ceil(totalItems / this.rowsPerPage);
    this.currentPage = Math.min(this.currentPage, totalPages || 1);
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    const paginatedRiders = riders.slice(start, end);

    tbody.innerHTML = '';

    if (paginatedRiders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-secondary">No riders found matching the criteria.</td></tr>`;
      this.renderPagination(0, 0, 0);
      return;
    }

    paginatedRiders.forEach(r => {
      let statusClass = 'badge-inactive';
      if (r.status === 'Active') statusClass = 'badge-active';
      else if (r.status === 'Pending') statusClass = 'badge-pending';
      else if (r.status === 'Suspended') statusClass = 'badge-suspended';

      const tr = document.createElement('tr');
      tr.className = 'hover:bg-surface-container-low transition-colors hoverable';
      tr.innerHTML = `
        <td class="px-6 py-4 font-bold text-primary">${r.id}</td>
        <td class="px-6 py-4">
          <div>
            <p class="font-semibold text-sm">${r.name}</p>
            <p class="text-xs text-secondary">${r.email}</p>
          </div>
        </td>
        <td class="px-6 py-4 text-sm">${r.phone}</td>
        <td class="px-6 py-4">
          <div>
            <p class="font-semibold text-sm">${r.vehicleType}</p>
            <p class="text-xs text-secondary">${r.vehicleNumber}</p>
          </div>
        </td>
        <td class="px-6 py-4">
          <span class="badge ${statusClass}">${r.status}</span>
        </td>
        <td class="px-6 py-4">
          <div class="flex gap-2">
            <span class="material-symbols-outlined text-xs ${r.documents.license === 'Verified' ? 'text-primary' : 'text-error'}">badge</span>
            <span class="material-symbols-outlined text-xs ${r.documents.backgroundCheck === 'Verified' ? 'text-primary' : 'text-error'}">assignment_ind</span>
            <span class="material-symbols-outlined text-xs ${r.documents.insurance === 'Verified' ? 'text-primary' : 'text-error'}">policy</span>
          </div>
        </td>
        <td class="px-6 py-4 text-right">
          <div class="flex justify-end gap-2">
            <button onclick="Rider.openEditModal('${r.id}')" class="text-secondary hover:text-primary p-1">
              <span class="material-symbols-outlined text-sm">edit</span>
            </button>
            <button onclick="Rider.deleteRider('${r.id}')" class="text-secondary hover:text-error p-1">
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
      <p class="text-body-sm text-secondary text-xs">Showing <b>${start}-${end}</b> of <b>${totalItems}</b> riders</p>
      <div class="pagination-buttons">
        <button onclick="Rider.changePage(${this.currentPage - 1})" class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''}>
          Previous
        </button>
        <button onclick="Rider.changePage(${this.currentPage + 1})" class="pagination-btn" ${this.currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}>
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
    const searchInput = document.getElementById('rider-search');
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

  // Delete a rider
  deleteRider(id) {
    if (confirm(`Are you sure you want to delete rider ${id}?`)) {
      window.AppStorage.deleteFromList('riders', id);
      window.AppStorage.logAction('Delete Rider', `Deleted rider ${id}`);
      window.UI.showToast(`Rider ${id} deleted successfully.`, 'success');
      this.renderList();
    }
  },

  // Open modal to add a new rider
  openAddModal() {
    document.getElementById('modal-title').textContent = 'Add New Rider';
    document.getElementById('rider-form').reset();
    document.getElementById('rider-id').value = '';
    window.UI.openModal('rider-modal');
  },

  // Open modal to edit a rider
  openEditModal(id) {
    const riders = window.AppStorage.get('riders') || [];
    const r = riders.find(item => item.id === id);
    if (!r) return;

    document.getElementById('modal-title').textContent = 'Edit Rider';
    document.getElementById('rider-id').value = r.id;
    document.getElementById('rider-name').value = r.name;
    document.getElementById('rider-email').value = r.email;
    document.getElementById('rider-phone').value = r.phone;
    document.getElementById('rider-vehicle-type').value = r.vehicleType;
    document.getElementById('rider-vehicle-number').value = r.vehicleNumber;
    document.getElementById('rider-status').value = r.status;

    window.UI.openModal('rider-modal');
  },

  // Save rider (Add or Edit)
  saveRider(e) {
    e.preventDefault();
    const id = document.getElementById('rider-id').value;
    const name = document.getElementById('rider-name').value;
    const email = document.getElementById('rider-email').value;
    const phone = document.getElementById('rider-phone').value;
    const vehicleType = document.getElementById('rider-vehicle-type').value;
    const vehicleNumber = document.getElementById('rider-vehicle-number').value;
    const status = document.getElementById('rider-status').value;

    if (id) {
      // Edit mode
      window.AppStorage.updateInList('riders', id, {
        name, email, phone, vehicleType, vehicleNumber, status,
        verification: status === 'Active' ? 'Verified' : 'Pending'
      });
      window.AppStorage.logAction('Edit Rider', `Updated rider ${id} details`);
      window.UI.showToast(`Rider ${id} updated successfully.`, 'success');
    } else {
      // Add mode
      const newId = 'RD-' + String(Math.floor(Math.random() * 900) + 100);
      const newRider = {
        id: newId,
        name, email, phone, vehicleType, vehicleNumber, status,
        verification: status === 'Active' ? 'Verified' : 'Pending',
        rating: 0.0,
        ordersCompleted: 0,
        earnings: 0.0,
        lat: 37.7749,
        lng: -122.4194,
        joinedDate: new Date().toISOString().split('T')[0],
        documents: {
          license: 'Verified',
          backgroundCheck: 'Verified',
          insurance: 'Verified'
        }
      };
      window.AppStorage.addToList('riders', newRider);
      window.AppStorage.logAction('Add Rider', `Created new rider ${newId}`);
      window.UI.showToast(`Rider ${newId} created successfully.`, 'success');
    }

    window.UI.closeModal('rider-modal');
    this.renderList();
  },

  // Render verification queue page
  renderVerificationQueue() {
    const tbody = document.getElementById('verification-tbody');
    if (!tbody) return;

    const riders = window.AppStorage.get('riders') || [];
    const pendingRiders = riders.filter(r => r.verification === 'Pending');

    tbody.innerHTML = '';

    if (pendingRiders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-secondary">No pending rider verifications.</td></tr>`;
      return;
    }

    pendingRiders.forEach(r => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-surface-container-low transition-colors hoverable';
      tr.innerHTML = `
        <td class="px-6 py-4 font-bold text-primary">${r.id}</td>
        <td class="px-6 py-4 font-semibold">${r.name}</td>
        <td class="px-6 py-4">${r.vehicleType}</td>
        <td class="px-6 py-4">
          <div class="flex gap-2">
            <span class="badge ${r.documents.license === 'Verified' ? 'badge-active' : 'badge-pending'}">License</span>
            <span class="badge ${r.documents.backgroundCheck === 'Verified' ? 'badge-active' : 'badge-pending'}">BG Check</span>
          </div>
        </td>
        <td class="px-6 py-4">
          <span class="badge badge-pending">Pending</span>
        </td>
        <td class="px-6 py-4 text-right">
          <div class="flex justify-end gap-2">
            <button onclick="Rider.verifyRider('${r.id}', 'Verified')" class="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary-container transition-colors">
              Approve
            </button>
            <button onclick="Rider.verifyRider('${r.id}', 'Rejected')" class="bg-error text-on-error px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-colors">
              Reject
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  // Verify rider (Approve or Reject)
  verifyRider(id, status) {
    const finalStatus = status === 'Verified' ? 'Active' : 'Suspended';
    window.AppStorage.updateInList('riders', id, {
      verification: status,
      status: finalStatus,
      documents: {
        license: status === 'Verified' ? 'Verified' : 'Rejected',
        backgroundCheck: status === 'Verified' ? 'Verified' : 'Rejected',
        insurance: status === 'Verified' ? 'Verified' : 'Rejected'
      }
    });

    window.AppStorage.logAction('Verify Rider', `Rider ${id} verification set to ${status}`);
    window.UI.showToast(`Rider ${id} has been ${status.toLowerCase()}.`, 'success');

    this.renderVerificationQueue();
  }
};

// Initialize on DOM load if on rider pages
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('rider-tbody')) {
    Rider.init();
  }
  if (document.getElementById('verification-tbody')) {
    Rider.renderVerificationQueue();
  }
});

window.Rider = Rider;
