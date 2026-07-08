package services;

import models.*;
import java.util.*;

public class AdminService {

    public boolean login(String username, String password) {
        return "admin".equalsIgnoreCase(username) && "admin123".equals(password);
    }

    // List of Pharmacies waiting for verification
    public List<Pharmacy> getPendingPharmacies() {
        List<Pharmacy> list = new ArrayList<>();
        for (Pharmacy p : Database.pharmacies) {
            if ("Pending".equalsIgnoreCase(p.getStatus())) {
                list.add(p);
            }
        }
        return list;
    }

    // List of Riders waiting for onboarding (aadhaar, license verification)
    public List<Rider> getPendingRiders() {
        List<Rider> list = new ArrayList<>();
        for (Rider r : Database.riders) {
            if ("Pending".equalsIgnoreCase(r.getStatus())) {
                list.add(r);
            }
        }
        return list;
    }

    public boolean approvePharmacy(String id, boolean approve) {
        for (Pharmacy p : Database.pharmacies) {
            if (p.getId().equals(id)) {
                p.setStatus(approve ? "Active" : "Rejected");
                Database.savePharmacies();
                return true;
            }
        }
        return false;
    }

    public boolean approveRider(String id, boolean approve) {
        for (Rider r : Database.riders) {
            if (r.getId().equals(id)) {
                r.setStatus(approve ? "Active" : "Rejected");
                Database.saveRiders();
                return true;
            }
        }
        return false;
    }

    public void toggleUserSuspension(String userId) {
        for (User u : Database.users) {
            if (u.getId().equals(userId)) {
                u.setStatus("Active".equalsIgnoreCase(u.getStatus()) ? "Suspended" : "Active");
                Database.saveUsers();
                break;
            }
        }
    }

    public void togglePharmacySuspension(String pharmacyId) {
        for (Pharmacy p : Database.pharmacies) {
            if (p.getId().equals(pharmacyId)) {
                p.setStatus("Active".equalsIgnoreCase(p.getStatus()) ? "Suspended" : "Active");
                Database.savePharmacies();
                break;
            }
        }
    }

    public void toggleRiderSuspension(String riderId) {
        for (Rider r : Database.riders) {
            if (r.getId().equals(riderId)) {
                r.setStatus("Active".equalsIgnoreCase(r.getStatus()) ? "Suspended" : "Active");
                Database.saveRiders();
                break;
            }
        }
    }

    public void updateSystemConfig(double radius, double baseCharge, double chargePerKm, double commission, boolean autoAssign, double maxRiderDist) {
        Database.config.setDeliveryRadius(radius);
        Database.config.setBaseDeliveryCharge(baseCharge);
        Database.config.setChargePerKm(chargePerKm);
        Database.config.setCommissionRate(commission);
        Database.config.setAutoAssignRiders(autoAssign);
        Database.config.setMaxRiderDistance(maxRiderDist);
        Database.saveConfig();
        System.out.println("✅ Configuration Engine Rules updated successfully! Changes reflect in real-time.");
    }

    // System-wide analytics dashboard
    public Map<String, Object> getSystemAnalytics() {
        Map<String, Object> stats = new HashMap<>();
        int totalOrders = Database.orders.size();
        double totalRevenue = 0.0;
        int completed = 0;
        int cancelled = 0;

        for (Order o : Database.orders) {
            if ("Delivered".equalsIgnoreCase(o.getStatus())) {
                totalRevenue += o.getTotal();
                completed++;
            } else if ("Cancelled".equalsIgnoreCase(o.getStatus())) {
                cancelled++;
            }
        }

        // Calculate commissions earned
        double platformCommissions = totalRevenue * (Database.config.getCommissionRate() / 100.0);

        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        stats.put("platformCommissions", platformCommissions);
        stats.put("completed", completed);
        stats.put("cancelled", cancelled);
        stats.put("totalCustomers", Database.users.size());
        stats.put("totalPharmacies", Database.pharmacies.size());
        stats.put("totalRiders", Database.riders.size());
        
        return stats;
    }
}
