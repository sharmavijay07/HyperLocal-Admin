package models;

public class Feedback {
    private String id;
    private String orderId;
    private String customerId;
    private String customerName;
    private String pharmacyId;
    private String pharmacyName;
    private String riderId;
    private String riderName;
    private int pharmacyRating; // 1-5
    private int riderRating;    // 1-5
    private int overallRating;  // 1-5
    private String comments;
    private String date;

    public Feedback() {}

    public Feedback(String id, String orderId, String customerId, String customerName, String pharmacyId, String pharmacyName, String riderId, String riderName, int pharmacyRating, int riderRating, int overallRating, String comments, String date) {
        this.id = id;
        this.orderId = orderId;
        this.customerId = customerId;
        this.customerName = customerName;
        this.pharmacyId = pharmacyId;
        this.pharmacyName = pharmacyName;
        this.riderId = riderId;
        this.riderName = riderName;
        this.pharmacyRating = pharmacyRating;
        this.riderRating = riderRating;
        this.overallRating = overallRating;
        this.comments = comments;
        this.date = date;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getPharmacyId() { return pharmacyId; }
    public void setPharmacyId(String pharmacyId) { this.pharmacyId = pharmacyId; }

    public String getPharmacyName() { return pharmacyName; }
    public void setPharmacyName(String pharmacyName) { this.pharmacyName = pharmacyName; }

    public String getRiderId() { return riderId; }
    public void setRiderId(String riderId) { this.riderId = riderId; }

    public String getRiderName() { return riderName; }
    public void setRiderName(String riderName) { this.riderName = riderName; }

    public int getPharmacyRating() { return pharmacyRating; }
    public void setPharmacyRating(int pharmacyRating) { this.pharmacyRating = pharmacyRating; }

    public int getRiderRating() { return riderRating; }
    public void setRiderRating(int riderRating) { this.riderRating = riderRating; }

    public int getOverallRating() { return overallRating; }
    public void setOverallRating(int overallRating) { this.overallRating = overallRating; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}
