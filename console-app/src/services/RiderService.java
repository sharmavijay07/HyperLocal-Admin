package services;

import models.*;
import java.util.*;

public class RiderService {

    public Rider login(String username, String password) {
        for (Rider r : Database.riders) {
            if (r.getUsername().equalsIgnoreCase(username) && r.getPassword().equals(password)) {
                if ("Pending".equalsIgnoreCase(r.getStatus())) {
                    System.out.println("❌ Rider profile is pending KYC verification by Admin.");
                    return null;
                }
                if ("Suspended".equalsIgnoreCase(r.getStatus())) {
                    System.out.println("❌ Rider profile is suspended by Administrator.");
                    return null;
                }
                return r;
            }
        }
        return null;
    }

    public Rider register(String username, String password, String name, String email, String phone, String vehicleType, String vehicleNumber, String aadhaar, String licenseNo, String bikePapers, double lat, double lng) {
        for (Rider r : Database.riders) {
            if (r.getUsername().equalsIgnoreCase(username)) {
                System.out.println("❌ Username already exists!");
                return null;
            }
        }
        Rider newRider = new Rider(
            "RIDE-" + (Database.riders.size() + 101),
            username, password, name, email, phone, vehicleType, vehicleNumber, "Pending",
            aadhaar, licenseNo, bikePapers, lat, lng, false, 0.0, 0.0
        );
        Database.riders.add(newRider);
        Database.saveRiders();
        return newRider;
    }

    public void toggleAvailability(Rider rider) {
        rider.setAvailability(!rider.isAvailability());
        Database.saveRiders();
    }

    public List<Order> getAssignedOrders(String riderId) {
        List<Order> list = new ArrayList<>();
        for (Order o : Database.orders) {
            if (o.getRiderId().equals(riderId) &&
                ("Accepted".equalsIgnoreCase(o.getStatus()) ||
                 "Preparing".equalsIgnoreCase(o.getStatus()) ||
                 "Out for Delivery".equalsIgnoreCase(o.getStatus()))) {
                list.add(o);
            }
        }
        return list;
    }

    public boolean acceptOrRejectOrder(Order order, boolean accept) {
        if (accept) {
            order.setStatus("Preparing"); // Pharmacy starts preparation knowing rider is active
            System.out.println("✅ Order accepted! Proceeding to pickup location.");
        } else {
            // Reject: Clear rider assignment and status so it reallocates
            System.out.println("⚠️ Order rejected. Reallocating to another rider...");
            order.setRiderId("PENDING");
            order.setRiderName("Not Assigned");
            order.setStatus("Pending"); // reset to pending so auto-assign can re-run or admin can reallocate
        }
        Database.saveOrders();
        return true;
    }

    public void updateETA(Order order, int newEta) {
        order.setEta(newEta);
        Database.saveOrders();
    }

    public void updateStatus(Order order, String newStatus) {
        order.setStatus(newStatus);
        Database.saveOrders();
    }

    public boolean confirmDeliveryWithOTP(Order order, String inputOtp, Rider rider) {
        if (order.getOtp().equals(inputOtp)) {
            order.setStatus("Delivered");
            order.setOtpValidated(true);
            
            // Add earnings and credits to rider
            double earningsEarned = 10.0; // $10 per delivery
            double creditsEarned = 5.0;   // 5 points credit per delivery
            
            rider.setEarnings(rider.getEarnings() + earningsEarned);
            rider.setCredits(rider.getCredits() + creditsEarned);
            
            Database.saveRiders();
            Database.saveOrders();
            return true;
        }
        return false;
    }

    public Map<String, Object> getAnalytics(String riderId) {
        Map<String, Object> stats = new HashMap<>();
        int completed = 0;
        
        for (Order o : Database.orders) {
            if (o.getRiderId().equals(riderId) && "Delivered".equalsIgnoreCase(o.getStatus())) {
                completed++;
            }
        }
        
        // Find rider profile
        Rider rider = null;
        for (Rider r : Database.riders) {
            if (r.getId().equals(riderId)) {
                rider = r;
                break;
            }
        }

        stats.put("completed", completed);
        stats.put("earnings", rider != null ? rider.getEarnings() : 0.0);
        stats.put("credits", rider != null ? rider.getCredits() : 0.0);
        return stats;
    }
}
