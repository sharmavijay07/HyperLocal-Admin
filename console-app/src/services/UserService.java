package services;

import models.*;
import utils.LocationUtils;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

public class UserService {

    public User login(String username, String password) {
        for (User u : Database.users) {
            if (u.getUsername().equalsIgnoreCase(username) && u.getPassword().equals(password)) {
                if ("Suspended".equalsIgnoreCase(u.getStatus())) {
                    System.out.println("❌ Account is suspended by Administrator.");
                    return null;
                }
                return u;
            }
        }
        return null;
    }

    public User register(String username, String password, String name, String email, String phone) {
        for (User u : Database.users) {
            if (u.getUsername().equalsIgnoreCase(username)) {
                System.out.println("❌ Username already exists!");
                return null;
            }
        }
        User newUser = new User("CUST-" + (Database.users.size() + 101), username, password, name, email, phone, "Active");
        Database.users.add(newUser);
        Database.saveUsers();
        return newUser;
    }

    public void addAddress(User user, String address) {
        user.getAddresses().add(address);
        Database.saveUsers();
    }

    // Displays available medicines matching query. Highlight warning for <30 days expiry
    public List<Medicine> searchMedicines(String query) {
        List<Medicine> results = new ArrayList<>();
        for (Pharmacy p : Database.pharmacies) {
            if (!"Active".equalsIgnoreCase(p.getStatus())) continue;
            for (Medicine m : p.getMedicines()) {
                if (m.getQuantity() > 0 &&
                    (m.getName().toLowerCase().contains(query.toLowerCase()) ||
                     m.getComposition().toLowerCase().contains(query.toLowerCase()) ||
                     m.getCategory().toLowerCase().contains(query.toLowerCase()))) {
                    results.add(m);
                }
            }
        }
        return results;
    }

    public boolean isNearingExpiry(String expiryDate) {
        try {
            LocalDate exp = LocalDate.parse(expiryDate);
            long days = ChronoUnit.DAYS.between(LocalDate.now(), exp);
            return days >= 0 && days <= 30;
        } catch (Exception e) {
            return false;
        }
    }

    // AI prescription matching simulator
    public Map<String, Object> uploadAndParsePrescription(String mockFilePath) {
        Map<String, Object> response = new LinkedHashMap<>();
        List<Map<String, Object>> matchedItems = new ArrayList<>();
        List<String> unmatchedItems = new ArrayList<>();

        System.out.println("\n[AI Vision Engine] Parsing prescription document: " + mockFilePath + " ...");
        System.out.println("[AI OCR Engine] Extracting text and matching medicines with nearby active inventories...");

        // Simulate extraction from prescription image/pdf
        // Let's mock a fixed prescription format based on available medicines to make the demonstration work flawlessly
        List<String[]> prescribed = new ArrayList<>();
        prescribed.add(new String[]{"Paracetamol", "2"});
        prescribed.add(new String[]{"Amoxicillin", "1"});
        prescribed.add(new String[]{"Cough Syrup", "1"});
        prescribed.add(new String[]{"Unobtainium Medicine", "3"}); // will be unmatched

        for (String[] item : prescribed) {
            String name = item[0];
            int qty = Integer.parseInt(item[1]);
            
            // Search in active pharmacy inventories
            boolean matched = false;
            for (Pharmacy p : Database.pharmacies) {
                if (!"Active".equalsIgnoreCase(p.getStatus())) continue;
                for (Medicine m : p.getMedicines()) {
                    if (m.getName().equalsIgnoreCase(name) && m.getQuantity() >= qty) {
                        Map<String, Object> match = new HashMap<>();
                        match.put("medicine", m);
                        match.put("pharmacyName", p.getName());
                        match.put("quantityToOrder", qty);
                        matchedItems.add(match);
                        matched = true;
                        break;
                    }
                }
                if (matched) break;
            }
            if (!matched) {
                unmatchedItems.add(name);
            }
        }

        response.put("matched", matchedItems);
        response.put("unmatched", unmatchedItems);
        return response;
    }

    // Place Order logic with routing allocation, pricing rules, and tax calculations
    public Order checkout(User user, Map<Medicine, Integer> cart, String address, String paymentMethod, String note) {
        if (cart.isEmpty()) return null;

        // Group cart by Pharmacy ID
        // For simplicity of hyperlocal operations, we assume checkout is done per pharmacy
        Pharmacy pharmacy = null;
        for (Medicine m : cart.keySet()) {
            for (Pharmacy p : Database.pharmacies) {
                if (p.getId().equals(m.getPharmacyId())) {
                    pharmacy = p;
                    break;
                }
            }
            if (pharmacy != null) break;
        }

        if (pharmacy == null) return null;

        double itemsSubtotal = 0.0;
        List<Order.OrderItem> orderItems = new ArrayList<>();
        for (Map.Entry<Medicine, Integer> entry : cart.entrySet()) {
            Medicine m = entry.getKey();
            int qty = entry.getValue();
            itemsSubtotal += m.getPrice() * qty;
            orderItems.add(new Order.OrderItem(m.getId(), m.getName(), qty, m.getPrice()));
            
            // Deduct inventory stock
            m.setQuantity(m.getQuantity() - qty);
        }
        Database.savePharmacies();

        // Calculate delivery charges (Haversine distance from Pharmacy to user address)
        // Since we don't have user coordinates directly, we generate a mock user coordinate nearby
        double ulat = pharmacy.getLat() + (Math.random() - 0.5) * 0.05;
        double ulng = pharmacy.getLng() + (Math.random() - 0.5) * 0.05;
        double distance = LocationUtils.calculateDistance(pharmacy.getLat(), pharmacy.getLng(), ulat, ulng);

        double baseCharge = Database.config.getBaseDeliveryCharge();
        double perKmCharge = Database.config.getChargePerKm();
        double deliveryFee = baseCharge + (distance * perKmCharge);
        double tax = itemsSubtotal * 0.18; // 18% GST on medicines
        double total = itemsSubtotal + deliveryFee + tax;

        // Fraud & Risk assessment check (e.g. high amounts or cod anomalies)
        String riskScore = "Low";
        String riskReason = "Normal order behavior";
        if (total > 200.0 && "COD".equalsIgnoreCase(paymentMethod)) {
            riskScore = "Medium";
            riskReason = "High value Cash-on-Delivery order";
        } else if (itemsSubtotal > 500.0) {
            riskScore = "High";
            riskReason = "Bulk pharmacy order requires verification";
        }

        // Generate OTP
        String otp = String.format("%04d", new Random().nextInt(10000));

        Order order = new Order(
            "ORD-" + (Database.orders.size() + 1001),
            user.getId(),
            user.getName(),
            user.getPhone(),
            pharmacy.getId(),
            pharmacy.getName(),
            "PENDING",
            "Not Assigned",
            "Pending",
            total,
            LocalDate.now().toString() + " " + java.time.LocalTime.now().toString().substring(0, 5),
            LocationUtils.calculateETA(distance),
            address,
            paymentMethod,
            riskScore,
            riskReason,
            note,
            otp,
            false
        );
        order.setItems(orderItems);

        // Auto allocate rider if auto assign is active
        if (Database.config.isAutoAssignRiders()) {
            Rider bestRider = findClosestAvailableRider(pharmacy.getLat(), pharmacy.getLng());
            if (bestRider != null) {
                order.setRiderId(bestRider.getId());
                order.setRiderName(bestRider.getName());
                order.setStatus("Accepted"); // Automatically accepted to start prep
            }
        }

        Database.orders.add(order);
        Database.saveOrders();
        return order;
    }

    private Rider findClosestAvailableRider(double plat, double plng) {
        Rider closest = null;
        double minDistance = Double.MAX_VALUE;
        double maxDist = Database.config.getMaxRiderDistance();

        for (Rider r : Database.riders) {
            if ("Active".equalsIgnoreCase(r.getStatus()) && r.isAvailability()) {
                double distance = LocationUtils.calculateDistance(plat, plng, r.getLat(), r.getLng());
                if (distance <= maxDist && distance < minDistance) {
                    minDistance = distance;
                    closest = r;
                }
            }
        }
        return closest;
    }
}
