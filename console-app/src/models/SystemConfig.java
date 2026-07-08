package models;

public class SystemConfig {
    private double deliveryRadius; // max delivery radius in km
    private double baseDeliveryCharge; // base charge in $
    private double chargePerKm; // charge per km in $
    private double commissionRate; // platform commission rate in %
    private boolean autoAssignRiders; // auto assign toggle
    private double maxRiderDistance; // max distance to look for rider in km

    public SystemConfig() {}

    public SystemConfig(double deliveryRadius, double baseDeliveryCharge, double chargePerKm, double commissionRate, boolean autoAssignRiders, double maxRiderDistance) {
        this.deliveryRadius = deliveryRadius;
        this.baseDeliveryCharge = baseDeliveryCharge;
        this.chargePerKm = chargePerKm;
        this.commissionRate = commissionRate;
        this.autoAssignRiders = autoAssignRiders;
        this.maxRiderDistance = maxRiderDistance;
    }

    // Getters and Setters
    public double getDeliveryRadius() { return deliveryRadius; }
    public void setDeliveryRadius(double deliveryRadius) { this.deliveryRadius = deliveryRadius; }

    public double getBaseDeliveryCharge() { return baseDeliveryCharge; }
    public void setBaseDeliveryCharge(double baseDeliveryCharge) { this.baseDeliveryCharge = baseDeliveryCharge; }

    public double getChargePerKm() { return chargePerKm; }
    public void setChargePerKm(double chargePerKm) { this.chargePerKm = chargePerKm; }

    public double getCommissionRate() { return commissionRate; }
    public void setCommissionRate(double commissionRate) { this.commissionRate = commissionRate; }

    public boolean isAutoAssignRiders() { return autoAssignRiders; }
    public void setAutoAssignRiders(boolean autoAssignRiders) { this.autoAssignRiders = autoAssignRiders; }

    public double getMaxRiderDistance() { return maxRiderDistance; }
    public void setMaxRiderDistance(double maxRiderDistance) { this.maxRiderDistance = maxRiderDistance; }
}
