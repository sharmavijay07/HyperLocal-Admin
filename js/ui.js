/* UI Helpers Module */

const UI = {
    // Initialize UI features
    init() {
        this.initDarkMode();
        this.createToastContainer();
    },

    // Initialize and sync dark mode
    initDarkMode() {
        const isDark = localStorage.getItem('darkMode') === 'true';
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },

    // Toggle dark mode
    toggleDarkMode() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark ? 'true' : 'false');
        if (window.AppStorage) {
            window.AppStorage.logAction('Toggle Dark Mode', `Dark mode set to ${isDark}`);
        }
        return isDark;
    },

    // Create container for toast notifications
    createToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
    },

    // Show a toast notification
    showToast(message, type = 'success', duration = 3000) {
        this.createToastContainer();
        const container = document.getElementById('toast-container');

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-lg flex items-center gap-3 transition-all duration-300 transform translate-x-full`;

        let icon = 'check_circle';
        let iconColor = 'text-primary';
        if (type === 'error') {
            icon = 'error';
            iconColor = 'text-error';
        } else if (type === 'warning') {
            icon = 'warning';
            iconColor = 'text-amber-500';
        }

        toast.innerHTML = `
      <span class="material-symbols-outlined ${iconColor}">${icon}</span>
      <span class="text-body-sm font-semibold">${message}</span>
    `;

        container.appendChild(toast);

        // Trigger slide-in
        setTimeout(() => toast.classList.add('show'), 10);

        // Slide-out and remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // Open a modal by ID
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('open');
            modal.style.opacity = '1';
            modal.style.pointerEvents = 'auto';
        }
    },

    // Close a modal by ID
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('open');
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
        }
    }
};

// Initialize UI on load
document.addEventListener('DOMContentLoaded', () => {
    UI.init();
});

// Export to window
window.UI = UI;
