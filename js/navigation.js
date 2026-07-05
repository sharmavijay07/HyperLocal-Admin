/* Navigation Module */

const Navigation = {
    // Sidebar items definition
    menuItems: [
        { name: 'Dashboard', url: 'dashboard.html', icon: 'dashboard' },
        { name: 'Pharmacies', url: 'pharmacy-management.html', icon: 'local_pharmacy' },
        { name: 'Riders', url: 'rider-management.html', icon: 'delivery_dining' },
        { name: 'Users', url: 'user-management.html', icon: 'group' },
        { name: 'Live Monitoring', url: 'order-monitoring.html', icon: 'monitoring' },
        { name: 'Analytics', url: 'reports.html', icon: 'analytics' },
        { name: 'Fraud Detection', url: 'fraud-detection.html', icon: 'security' },
        { name: 'Complaints', url: 'complaints.html', icon: 'emergency' },
        { name: 'Rules', url: 'configuration.html', icon: 'rule' },
        { name: 'Settings', url: 'profile.html', icon: 'settings' }
    ],

    // Initialize navigation components
    init() {
        this.renderNavbar();
        this.renderSidebar();
        this.setupMobileToggle();
    },

    // Render top navbar
    renderNavbar() {
        const navbarContainer = document.getElementById('navbar-container');
        if (!navbarContainer) return;

        const currentUser = window.Auth ? window.Auth.getCurrentUser() : null;
        const userName = currentUser ? currentUser.name : 'Admin User';
        const userRole = currentUser ? currentUser.role : 'Super Admin';

        navbarContainer.className = "flex items-center justify-between px-margin-desktop h-16 w-full sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant";
        navbarContainer.innerHTML = `
      <div class="flex items-center gap-8">
        <button id="mobile-menu-toggle" class="md:hidden text-secondary p-1 hover:bg-surface-container rounded-lg">
          <span class="material-symbols-outlined">menu</span>
        </button>
        <div class="flex items-center gap-3 cursor-pointer" onclick="window.location.href='dashboard.html'">
          <img src="logo.png" alt="Logo" class="h-8 w-8 object-contain rounded-lg border border-outline-variant/30" onerror="this.style.display='none'" />
          <h1 class="font-headline-md text-headline-md font-bold text-primary">MedEasy</h1>
        </div>
        <div class="hidden md:flex items-center bg-surface-container rounded-full px-4 py-2 w-80 border border-outline-variant/30">
          <span class="material-symbols-outlined text-outline mr-2">search</span>
          <input id="global-search" class="bg-transparent border-none focus:ring-0 text-body-sm w-full p-0" placeholder="Search pharmacy, rider, order..." type="text" />
        </div>
      </div>
      <div class="flex items-center gap-4">
        <button onclick="window.location.href='notifications.html'" class="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md hover:bg-primary-container transition-colors shadow-sm text-sm">
          Send Broadcast
        </button>
        <div class="flex items-center gap-3">
          <div class="relative cursor-pointer" onclick="window.location.href='notifications.html'">
            <span class="material-symbols-outlined text-secondary text-[24px]">notifications</span>
            <span class="absolute -top-1 -right-1 bg-error text-on-error text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
          </div>
          <div class="flex items-center gap-2 cursor-pointer" onclick="window.location.href='profile.html'">
            <div class="w-8 h-8 rounded-full bg-primary-fixed overflow-hidden border border-outline-variant">
              <img class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEgmMPzU5vrYxx5drTQ2rZXFXbIlveWJvAtHPnfM7cIpralFvvkFRZ9Jha02v0yRUfsnmVxjybccnON82EZVT5dzV-eZ3VjSs5Hhb1tPWGPHLZb2l1JfmPx6NKjKKqHGtDB1Pzo1J86aEgVV_Ps5Rj-efyMkrHZfso_LYxgYqMzAaWSGg_ZzwVZpApqrJ58tSj257k4wg2Dw_PPNSWS6EXp6d7cFApkshlfrhNPWAglNPz26XvBM_x_Ktf8mnsVIkjzho0reYHZRs" alt="Profile" />
            </div>
            <div class="hidden lg:block text-left">
              <p class="text-xs font-bold leading-none">${userName}</p>
              <p class="text-[10px] text-secondary leading-none mt-0.5">${userRole}</p>
            </div>
          </div>
        </div>
      </div>
    `;

        // Global search handler
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && searchInput.value.trim()) {
                    alert(`Global search for: "${searchInput.value}"`);
                }
            });
        }
    },

    // Render sidebar
    renderSidebar() {
        const sidebarContainer = document.getElementById('sidebar-container');
        if (!sidebarContainer) return;

        const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';

        sidebarContainer.className = "flex flex-col fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-primary text-on-primary border-r border-primary/20 transition-transform duration-300 z-40 md:translate-x-0 -translate-x-full";

        let navHtml = `<nav class="p-4 space-y-1 flex-grow">`;

        this.menuItems.forEach(item => {
            const isActive = currentPath === item.url ||
                (item.url === 'dashboard.html' && currentPath === '') ||
                (item.url === 'pharmacy-management.html' && currentPath === 'pharmacy-verification.html') ||
                (item.url === 'rider-management.html' && currentPath === 'rider-verification.html');

            const activeClass = isActive
                ? 'flex items-center gap-3 px-4 py-3 text-primary bg-surface-container-lowest font-bold border-l-4 border-primary-fixed transition-all active rounded-lg'
                : 'flex items-center gap-3 px-4 py-3 text-primary-fixed/80 hover:bg-primary-container/30 hover:text-white transition-colors rounded-lg';

            navHtml += `
        <a class="${activeClass}" href="${item.url}">
          <span class="material-symbols-outlined">${item.icon}</span>
          <span class="font-body-md text-body-md">${item.name}</span>
        </a>
      `;
        });

        navHtml += `</nav>`;

        // System Health Card at the bottom of sidebar
        navHtml += `
      <div class="p-4 border-t border-primary-container/30 mt-auto">
        <div class="bg-primary-container/20 rounded-2xl p-4">
          <p class="font-label-sm text-white mb-1 font-bold">System Health</p>
          <div class="h-1.5 w-full bg-primary/30 rounded-full overflow-hidden">
            <div class="h-full bg-primary-fixed w-11/12"></div>
          </div>
          <p class="font-label-sm text-primary-fixed/80 mt-2 text-xs">All services active</p>
        </div>
      </div>
    `;

        sidebarContainer.innerHTML = navHtml;
    },

    // Setup mobile sidebar toggle
    setupMobileToggle() {
        const toggleBtn = document.getElementById('mobile-menu-toggle');
        const sidebar = document.getElementById('sidebar-container');

        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                sidebar.classList.toggle('open');
            });

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (window.innerWidth < 768 && !sidebar.contains(e.target) && e.target !== toggleBtn) {
                    sidebar.classList.remove('open');
                }
            });
        }
    }
};

// Initialize navigation on DOM load
document.addEventListener('DOMContentLoaded', () => {
    Navigation.init();
});

// Export to window
window.Navigation = Navigation;
