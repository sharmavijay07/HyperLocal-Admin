/* Settings and Configuration Module */

const Settings = {
    init() {
        this.loadSettings();
    },

    // Load settings from localStorage and populate form
    loadSettings() {
        const settings = window.AppStorage.get('settings');
        if (!settings) return;

        const radiusInput = document.getElementById('setting-radius');
        if (radiusInput) radiusInput.value = settings.deliveryRadius;

        const baseChargeInput = document.getElementById('setting-base-charge');
        if (baseChargeInput) baseChargeInput.value = settings.baseDeliveryCharge;

        const kmChargeInput = document.getElementById('setting-km-charge');
        if (kmChargeInput) kmChargeInput.value = settings.chargePerKm;

        const commissionInput = document.getElementById('setting-commission');
        if (commissionInput) commissionInput.value = settings.commissionRate;

        const autoAssignInput = document.getElementById('setting-auto-assign');
        if (autoAssignInput) autoAssignInput.checked = settings.autoAssignRiders;

        const maxDistanceInput = document.getElementById('setting-max-distance');
        if (maxDistanceInput) maxDistanceInput.value = settings.maxRiderDistance;
    },

    // Save settings from form to localStorage
    saveSettings(e) {
        e.preventDefault();

        const settings = {
            deliveryRadius: parseFloat(document.getElementById('setting-radius').value),
            baseDeliveryCharge: parseFloat(document.getElementById('setting-base-charge').value),
            chargePerKm: parseFloat(document.getElementById('setting-km-charge').value),
            commissionRate: parseFloat(document.getElementById('setting-commission').value),
            autoAssignRiders: document.getElementById('setting-auto-assign').checked,
            maxRiderDistance: parseFloat(document.getElementById('setting-max-distance').value)
        };

        window.AppStorage.set('settings', settings);
        window.AppStorage.logAction('Update Settings', 'Updated logistics and pricing configuration rules');
        window.UI.showToast('Configuration rules saved successfully.', 'success');
    }
};

// Initialize on load if on configuration page
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('settings-form')) {
        Settings.init();
    }
});

window.Settings = Settings;
