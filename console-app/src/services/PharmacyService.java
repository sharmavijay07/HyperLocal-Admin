package services;

import models.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

public class PharmacyService {

    public Pharmacy login(String username, String password) {
        for (Pharmacy p : Database.pharmacies) {
            if (p.getUsername().equalsIgnoreCase(username) && p.getPassword().equals(password)) {
                if ("Pending".equalsIgnoreCase(p.getStatus())) {
                    System.out.println("❌ Pharmacy is awaiting verification & onboarding from Administrator.");
                    return null;
                }
                if ("Suspended".equalsIgnoreCase(p.getStatus())) {
                    System.out.println("❌ Pharmacy is suspended by Administrator.");
                    return null;
                }
                return p;
            }
        }
        return null;
    }

    public Pharmacy register(String username, String password, String name, String owner, String email, String phone, String license, String address, double lat, double lng) {
        for (Pharmacy p : Database.pharmacies) {
            if (p.getUsername().equalsIgnoreCase(username)) {
                System.out.println("❌ Username already exists!");
                return null;
            }
        }
        Pharmacy newPhar = new Pharmacy(
            "PHAR-" + (Database.pharmacies.size() + 101),
            username, password, name, owner, email, phone, license, address, "Pending", lat, lng
        );
        Database.pharmacies.add(newPhar);
        Database.savePharmacies();
        return newPhar;
    }

    public void addMedicine(Pharmacy pharmacy, String name, String description, double price, String expiryDate, int qty, String mfgDate, String composition, String category, String imagePath) {
        Medicine med = new Medicine(
            "MED-" + (pharmacy.getMedicines().size() + 1001),
            name, description, price, expiryDate, qty, mfgDate, composition, category, imagePath, pharmacy.getId()
        );
        pharmacy.getMedicines().add(med);
        Database.savePharmacies();
    }

    public void updateMedicineStock(Pharmacy pharmacy, String medId, int newQty) {
        for (Medicine m : pharmacy.getMedicines()) {
            if (m.getId().equals(medId)) {
                m.setQuantity(newQty);
                break;
            }
        }
        Database.savePharmacies();
    }

    // Alerts for low-stock (< 10 units) and expiring (< 30 days) medicines
    public Map<String, List<String>> getExpiryAndLowStockAlerts(Pharmacy pharmacy) {
        Map<String, List<String>> alerts = new HashMap<>();
        List<String> lowStock = new ArrayList<>();
        List<String> expiring = new ArrayList<>();

        for (Medicine m : pharmacy.getMedicines()) {
            if (m.getQuantity() <= 10) {
                lowStock.add(m.getName() + " (ID: " + m.getId() + ") - Stock: " + m.getQuantity() + " units left.");
            }
            try {
                LocalDate exp = LocalDate.parse(m.getExpiryDate());
                long days = ChronoUnit.DAYS.between(LocalDate.now(), exp);
                if (days >= 0 && days <= 30) {
                    expiring.add(m.getName() + " (ID: " + m.getId() + ") - Expires in " + days + " days (" + m.getExpiryDate() + ").");
                }
            } catch (Exception e) {
                // Ignore parsing errors
            }
        }

        alerts.put("lowStock", lowStock);
        alerts.put("expiring", expiring);
        return alerts;
    }

    public List<Order> getPendingOrders(String pharmacyId) {
        List<Order> list = new ArrayList<>();
        for (Order o : Database.orders) {
            if (o.getPharmacyId().equals(pharmacyId) && "Pending".equalsIgnoreCase(o.getStatus())) {
                list.add(o);
            }
        }
        return list;
    }

    public boolean processOrder(Order order, boolean accept) {
        if (accept) {
            order.setStatus("Accepted");
            System.out.println("✅ Order accepted! Initializing medicine preparation.");
        } else {
            // Reassign to another nearby pharmacy if rejected
            order.setStatus("Cancelled"); // Marked cancelled from this pharmacy
            System.out.println("⚠️ Order rejected. Attempting reallocation to nearby pharmacies...");
            
            boolean reallocated = reallocateOrderToAnotherPharmacy(order);
            if (!reallocated) {
                System.out.println("❌ Reallocation failed. No other nearby pharmacies house this medicine.");
            } else {
                System.out.println("✅ Order reallocated successfully to another pharmacy!");
            }
        }
        Database.saveOrders();
        return true;
    }

    private boolean reallocateOrderToAnotherPharmacy(Order rejectedOrder) {
        // Find if another active pharmacy has the required medicines in stock
        // For simplicity, check if the first item in the order is in stock elsewhere
        if (rejectedOrder.getItems().isEmpty()) return false;
        String firstMedName = rejectedOrder.getItems().get(0).getName();
        int reqQty = rejectedOrder.getItems().get(0).getQty();

        for (Pharmacy p : Database.pharmacies) {
            if (p.getId().equals(rejectedOrder.getPharmacyId()) || !"Active".equalsIgnoreCase(p.getStatus())) {
                continue;
            }
            for (Medicine m : p.getMedicines()) {
                if (m.getName().equalsIgnoreCase(firstMedName) && m.getQuantity() >= reqQty) {
                    // Update order details to allocate to this new pharmacy
                    rejectedOrder.setPharmacyId(p.getId());
                    rejectedOrder.setPharmacyName(p.getName());
                    rejectedOrder.setStatus("Pending"); // reset to pending so new pharmacy can accept/reject
                    
                    // Deduct stock in new pharmacy
                    m.setQuantity(m.getQuantity() - reqQty);
                    Database.savePharmacies();
                    return true;
                }
            }
        }
        return false;
    }

    public Map<String, Object> getAnalytics(String pharmacyId) {
        Map<String, Object> stats = new HashMap<>();
        int totalOrders = 0;
        double totalSales = 0.0;
        
        for (Order o : Database.orders) {
            if (o.getPharmacyId().equals(pharmacyId) && "Delivered".equalsIgnoreCase(o.getStatus())) {
                totalOrders++;
                totalSales += o.getTotal();
            }
        }
        
        stats.put("totalOrders", totalOrders);
        stats.put("totalSales", totalSales);
        return stats;
    }
}
