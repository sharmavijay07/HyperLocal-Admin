package models;

import java.util.ArrayList;
import java.util.List;

public class Order {
    private String id;
    private String customerName;
    private String customerPhone;
    private String customerId;
    private String pharmacyId;
    private String pharmacyName;
    private String riderId;
    private String riderName;
    private String status; // "Pending", "Accepted", "Preparing", "Out for Delivery", "Delivered", "Cancelled"
    private double total;
    private List<OrderItem> items;
    private String orderTime;
    private int eta; // in minutes
    private String address;
    private String paymentMethod; // "UPI", "Card", "COD"
    private String riskScore; // "Low", "Medium", "High"
    private String riskReason;
    private String customerNote;
    private String otp;
    private boolean otpValidated;

    public Order() {
        this.items = new ArrayList<>();
    }

    public Order(String id, String customerId, String customerName, String customerPhone, String pharmacyId, String pharmacyName, String riderId, String riderName, String status, double total, String orderTime, int eta, String address, String paymentMethod, String riskScore, String riskReason, String customerNote, String otp, boolean otpValidated) {
        this.id = id;
        this.customerId = customerId;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.pharmacyId = pharmacyId;
        this.pharmacyName = pharmacyName;
        this.riderId = riderId;
        this.riderName = riderName;
        this.status = status;
        this.total = total;
        this.items = new ArrayList<>();
        this.orderTime = orderTime;
        this.eta = eta;
        this.address = address;
        this.paymentMethod = paymentMethod;
        this.riskScore = riskScore;
        this.riskReason = riskReason;
        this.customerNote = customerNote;
        this.otp = otp;
        this.otpValidated = otpValidated;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getPharmacyId() { return pharmacyId; }
    public void setPharmacyId(String pharmacyId) { this.pharmacyId = pharmacyId; }

    public String getPharmacyName() { return pharmacyName; }
    public void setPharmacyName(String pharmacyName) { this.pharmacyName = pharmacyName; }

    public String getRiderId() { return riderId; }
    public void setRiderId(String riderId) { this.riderId = riderId; }

    public String getRiderName() { return riderName; }
    public void setRiderName(String riderName) { this.riderName = riderName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public String getOrderTime() { return orderTime; }
    public void setOrderTime(String orderTime) { this.orderTime = orderTime; }

    public int getEta() { return eta; }
    public void setEta(int eta) { this.eta = eta; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getRiskScore() { return riskScore; }
    public void setRiskScore(String riskScore) { this.riskScore = riskScore; }

    public String getRiskReason() { return riskReason; }
    public void setRiskReason(String riskReason) { this.riskReason = riskReason; }

    public String getCustomerNote() { return customerNote; }
    public void setCustomerNote(String customerNote) { this.customerNote = customerNote; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public boolean isOtpValidated() { return otpValidated; }
    public void setOtpValidated(boolean otpValidated) { this.otpValidated = otpValidated; }

    // Nested OrderItem Class
    public static class OrderItem {
        private String medicineId;
        private String name;
        private int qty;
        private double price;

        public OrderItem() {}

        public OrderItem(String medicineId, String name, int qty, double price) {
            this.medicineId = medicineId;
            this.name = name;
            this.qty = qty;
            this.price = price;
        }

        public String getMedicineId() { return medicineId; }
        public void setMedicineId(String medicineId) { this.medicineId = medicineId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public int getQty() { return qty; }
        public void setQty(int qty) { this.qty = qty; }

        public double getPrice() { return price; }
        public void setPrice(double price) { this.price = price; }
    }
}
