/* Authentication Module */

const Auth = {
    // Check if user is logged in
    isAuthenticated() {
        return sessionStorage.getItem('admin_logged_in') === 'true';
    },

    // Get current user details
    getCurrentUser() {
        const user = sessionStorage.getItem('admin_user');
        return user ? JSON.parse(user) : null;
    },

    // Perform login
    login(username, password) {
        // Simple mock authentication
        if ((username === 'admin' || username === 'admin@medeasy.com') && password === 'admin123') {
            sessionStorage.setItem('admin_logged_in', 'true');
            sessionStorage.setItem('admin_user', JSON.stringify({
                username: 'admin',
                email: 'admin@medeasy.com',
                role: 'Super Admin',
                name: 'Sarah Jenkins'
            }));

            // Log the action
            if (window.AppStorage) {
                window.AppStorage.logAction('Admin Login', 'Admin user logged in successfully');
            }
            return { success: true };
        }
        return { success: false, message: 'Invalid Admin ID or password.' };
    },

    // Perform logout
    logout() {
        if (window.AppStorage) {
            window.AppStorage.logAction('Admin Logout', 'Admin user logged out');
        }
        sessionStorage.removeItem('admin_logged_in');
        sessionStorage.removeItem('admin_user');
        window.location.href = 'login.html';
    },

    // Protect page: redirect to login.html if not authenticated
    protectPage() {
        const isLoginPage = window.location.pathname.endsWith('login.html');
        const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === '';

        if (!this.isAuthenticated()) {
            if (!isLoginPage && !isIndexPage) {
                window.location.href = 'login.html';
            }
        } else {
            if (isLoginPage) {
                window.location.href = 'dashboard.html';
            }
        }
    }
};

// Run protection check immediately
Auth.protectPage();

// Export to window object
window.Auth = Auth;
