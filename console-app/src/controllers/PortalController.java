package controllers;

import models.*;
import services.*;
import java.util.*;
import java.time.LocalDate;
import utils.LocationUtils;

public class PortalController {
    private final UserService userService = new UserService();
    private final PharmacyService pharmacyService = new PharmacyService();
    private final RiderService riderService = new RiderService();
    private final OrderService orderService = new OrderService();
    private final AdminService adminService = new AdminService();
    private final Scanner scanner = new Scanner(System.in);

    public void start() {
        Database.loadAll(); // Initialize data
        boolean running = true;
        
        while (running) {
            printHeader("HYPERLOCAL DELIVERY & ORDER ALLOCATION SYSTEM");
            System.out.println(" 1. CUSTOMER PORTAL");
            System.out.println(" 2. PHARMACY PORTAL");
            System.out.println(" 3. RIDER PORTAL");
            System.out.println(" 4. ADMIN PORTAL");
            System.out.println(" 5. EXIT");
            System.out.print("\nSelect Portal option (1-5): ");
            
            String choice = scanner.nextLine().trim();
            switch (choice) {
                case "1": customerPortal(); break;
                case "2": pharmacyPortal(); break;
                case "3": riderPortal(); break;
                case "4": adminPortal(); break;
                case "5":
                    System.out.println("\n👋 Thank you for using Hyperlocal Delivery System. Saving database...");
                    Database.saveAll();
                    running = false;
                    break;
                default:
                    System.out.println("❌ Invalid option. Please enter 1-5.");
            }
        }
    }

    // ==========================================
    // 1. CUSTOMER PORTAL
    // ==========================================
    private void customerPortal() {
        boolean back = false;
        while (!back) {
            printHeader("CUSTOMER PORTAL");
            System.out.println(" 1. Register Account");
            System.out.println(" 2. Login");
            System.out.println(" 3. Back to Main Menu");
            System.out.print("\nSelect option: ");
            String opt = scanner.nextLine().trim();
            switch (opt) {
                case "1": customerRegister(); break;
                case "2": customerLogin(); break;
                case "3": back = true; break;
                default: System.out.println("❌ Invalid choice.");
            }
        }
    }

    private void customerRegister() {
        printSubHeader("CUSTOMER REGISTRATION");
        System.out.print("Enter username: ");
        String user = scanner.nextLine().trim();
        System.out.print("Enter password: ");
        String pass = scanner.nextLine().trim();
        System.out.print("Enter full name: ");
        String name = scanner.nextLine().trim();
        System.out.print("Enter email: ");
        String email = scanner.nextLine().trim();
        System.out.print("Enter phone number: ");
        String phone = scanner.nextLine().trim();

        if (user.isEmpty() || pass.isEmpty() || name.isEmpty()) {
            System.out.println("❌ Registration failed. Mandatory fields cannot be empty.");
            return;
        }

        User u = userService.register(user, pass, name, email, phone);
        if (u != null) {
            System.out.println("🎉 Registration successful! Customer ID: " + u.getId());
        }
    }

    private void customerLogin() {
        printSubHeader("CUSTOMER LOGIN");
        System.out.print("Enter username: ");
        String user = scanner.nextLine().trim();
        System.out.print("Enter password: ");
        String pass = scanner.nextLine().trim();

        User customer = userService.login(user, pass);
        if (customer != null) {
            System.out.println("✅ Login Successful! Welcome back, " + customer.getName() + ".");
            customerMenu(customer);
        } else {
            System.out.println("❌ Invalid username or password.");
        }
    }

    private void customerMenu(User customer) {
        Map<Medicine, Integer> cart = new HashMap<>();
        boolean logout = false;
        while (!logout) {
            printHeader("CUSTOMER DASHBOARD: " + customer.getName());
            System.out.println(" 1. Browse & Search Medicines");
            System.out.println(" 2. AI Prescription Upload");
            System.out.println(" 3. View Shopping Cart & Checkout");
            System.out.println(" 4. Order Tracking (Live GPS simulation)");
            System.out.println(" 5. Profile & Address Management");
            System.out.println(" 6. Submit Order Feedback");
            System.out.println(" 7. Logout");
            System.out.print("\nSelect option: ");
            String opt = scanner.nextLine().trim();
            switch (opt) {
                case "1": browseMedicinesMenu(cart); break;
                case "2": aiPrescriptionMenu(cart); break;
                case "3": cartAndCheckoutMenu(customer, cart); break;
                case "4": trackOrdersMenu(customer); break;
                case "5": profileMenu(customer); break;
                case "6": feedbackMenu(customer); break;
                case "7": logout = true; break;
                default: System.out.println("❌ Invalid choice.");
            }
        }
    }

    private void browseMedicinesMenu(Map<Medicine, Integer> cart) {
        printSubHeader("BROWSE & SEARCH MEDICINES");
        System.out.print("Enter search query (Name/Generic/Composition): ");
        String query = scanner.nextLine().trim();

        List<Medicine> meds = userService.searchMedicines(query);
        if (meds.isEmpty()) {
            System.out.println("ℹ️ No medicines found matching query: " + query);
            return;
        }

        System.out.println("\n---------------------------------------------------------------------------------------------------------------------------------");
        System.out.printf("| %-10s | %-20s | %-25s | %-12s | %-6s | %-10s | %-15s |\n", "ID", "Name", "Composition", "Price", "Stock", "Expiry", "Warnings");
        System.out.println("---------------------------------------------------------------------------------------------------------------------------------");
        for (Medicine m : meds) {
            boolean nearingExp = userService.isNearingExpiry(m.getExpiryDate());
            String warning = nearingExp ? "⚠️ EXPIRES SOON" : "";
            System.out.printf("| %-10s | %-20s | %-25s | $%-11.2f | %-6d | %-10s | %-15s |\n",
                m.getId(), m.getName(), m.getComposition(), m.getPrice(), m.getQuantity(), m.getExpiryDate(), warning);
        }
        System.out.println("---------------------------------------------------------------------------------------------------------------------------------");

        System.out.print("\nEnter Medicine ID to add to cart (or press enter to skip): ");
        String medId = scanner.nextLine().trim();
        if (medId.isEmpty()) return;

        Medicine selected = null;
        for (Medicine m : meds) {
            if (m.getId().equalsIgnoreCase(medId)) {
                selected = m;
                break;
            }
        }

        if (selected == null) {
            System.out.println("❌ Medicine not found in list.");
            return;
        }

        System.out.print("Enter quantity to purchase (Stock: " + selected.getQuantity() + "): ");
        try {
            int qty = Integer.parseInt(scanner.nextLine().trim());
            if (qty <= 0 || qty > selected.getQuantity()) {
                System.out.println("❌ Invalid quantity selection.");
                return;
            }
            cart.put(selected, cart.getOrDefault(selected, 0) + qty);
            System.out.println("✅ Added " + qty + " units of " + selected.getName() + " to cart!");
        } catch (NumberFormatException e) {
            System.out.println("❌ Quantity must be a valid number.");
        }
    }

    private void aiPrescriptionMenu(Map<Medicine, Integer> cart) {
        printSubHeader("AI PRESCRIPTION SCANNER");
        System.out.print("Enter path to prescription image/PDF (e.g. /prescriptions/rx102.png): ");
        String filePath = scanner.nextLine().trim();
        if (filePath.isEmpty()) return;

        Map<String, Object> parseResponse = userService.uploadAndParsePrescription(filePath);
        List<Map<String, Object>> matched = (List<Map<String, Object>>) parseResponse.get("matched");
        List<String> unmatched = (List<String>) parseResponse.get("unmatched");

        System.out.println("\n--- AI AUTO-MATCHING RESULTS ---");
        if (matched.isEmpty()) {
            System.out.println("ℹ️ No matched medicines found in nearby pharmacy inventories.");
        } else {
            System.out.println("✅ Matched Items Auto-Filled to Cart:");
            for (Map<String, Object> match : matched) {
                Medicine m = (Medicine) match.get("medicine");
                String phar = (String) match.get("pharmacyName");
                int qty = (int) match.get("quantityToOrder");
                
                System.out.println(" - " + m.getName() + " (Qty: " + qty + ") from pharmacy: " + phar + " [Price: $" + m.getPrice() + "]");
                cart.put(m, cart.getOrDefault(m, 0) + qty);
            }
        }

        if (!unmatched.isEmpty()) {
            System.out.println("\n❌ Unmatched Items (Flagged for Pharmacist manual check):");
            for (String item : unmatched) {
                System.out.println(" - " + item + " [Not available in nearby active pharmacies]");
            }
        }
    }

    private void cartAndCheckoutMenu(User customer, Map<Medicine, Integer> cart) {
        printSubHeader("SHOPPING CART");
        if (cart.isEmpty()) {
            System.out.println("🛒 Your cart is currently empty.");
            return;
        }

        double subtotal = 0.0;
        System.out.println("---------------------------------------------------------------");
        System.out.printf("| %-20s | %-10s | %-8s | %-10s |\n", "Medicine", "Price", "Qty", "Total");
        System.out.println("---------------------------------------------------------------");
        for (Map.Entry<Medicine, Integer> entry : cart.entrySet()) {
            Medicine m = entry.getKey();
            int qty = entry.getValue();
            double lineTotal = m.getPrice() * qty;
            subtotal += lineTotal;
            System.out.printf("| %-20s | $%-9.2f | %-8d | $%-9.2f |\n", m.getName(), m.getPrice(), qty, lineTotal);
        }
        System.out.println("---------------------------------------------------------------");
        System.out.printf("Subtotal: $%.2f\n", subtotal);
        System.out.printf("Estimated Tax (18%% GST): $%.2f\n", (subtotal * 0.18));
        System.out.println("---------------------------------------------------------------");

        System.out.println(" 1. Proceed to Checkout");
        System.out.println(" 2. Modify Quantity");
        System.out.println(" 3. Empty Cart");
        System.out.println(" 4. Back");
        System.out.print("\nSelect option: ");
        String opt = scanner.nextLine().trim();
        switch (opt) {
            case "1": checkoutFlow(customer, cart); break;
            case "2":
                System.out.print("Enter medicine name to modify: ");
                String mName = scanner.nextLine().trim();
                Medicine target = null;
                for (Medicine m : cart.keySet()) {
                    if (m.getName().equalsIgnoreCase(mName)) {
                        target = m;
                        break;
                    }
                }
                if (target == null) {
                    System.out.println("❌ Medicine not in cart.");
                    return;
                }
                System.out.print("Enter new quantity (0 to remove): ");
                try {
                    int newQty = Integer.parseInt(scanner.nextLine().trim());
                    if (newQty <= 0) {
                        cart.remove(target);
                        System.out.println("Removed from cart.");
                    } else if (newQty > target.getQuantity()) {
                        System.out.println("❌ Stock exceeded. Available stock: " + target.getQuantity());
                    } else {
                        cart.put(target, newQty);
                        System.out.println("Cart updated.");
                    }
                } catch (Exception e) {
                    System.out.println("❌ Invalid input.");
                }
                break;
            case "3": cart.clear(); System.out.println("🛒 Cart emptied!"); break;
            default: break;
        }
    }

    private void checkoutFlow(User customer, Map<Medicine, Integer> cart) {
        if (customer.getAddresses().isEmpty()) {
            System.out.println("\n❌ No shipping addresses found! Please add an address in Profile first.");
            return;
        }

        printSubHeader("CHECKOUT PROMPT");
        System.out.println("Select shipping address:");
        for (int i = 0; i < customer.getAddresses().size(); i++) {
            System.out.println(" " + (i + 1) + ". " + customer.getAddresses().get(i));
        }
        System.out.print("Select option (1-" + customer.getAddresses().size() + "): ");
        String addrSel = scanner.nextLine().trim();
        int addrIdx;
        try {
            addrIdx = Integer.parseInt(addrSel) - 1;
            if (addrIdx < 0 || addrIdx >= customer.getAddresses().size()) {
                System.out.println("❌ Invalid selection.");
                return;
            }
        } catch (Exception e) {
            System.out.println("❌ Invalid selection.");
            return;
        }
        String address = customer.getAddresses().get(addrIdx);

        System.out.print("Enter special delivery notes (e.g. Leave at gate, Ring bell): ");
        String note = scanner.nextLine().trim();

        System.out.println("\nSelect payment method:");
        System.out.println(" 1. UPI");
        System.out.println(" 2. Card Payment (Debit/Credit)");
        System.out.println(" 3. Cash on Delivery (COD)");
        System.out.print("Option (1-3): ");
        String paySel = scanner.nextLine().trim();
        String payment = "COD";
        if ("1".equals(paySel)) payment = "UPI";
        else if ("2".equals(paySel)) payment = "Card";

        // Place order
        Order order = userService.checkout(customer, cart, address, payment, note);
        if (order != null) {
            System.out.println("\n🎉 Order Placed Successfully!");
            System.out.println("Order ID: " + order.getId());
            System.out.println("Total Amount (Incl. GST + Delivery Charge): " + String.format("$%.2f", order.getTotal()));
            System.out.println("Expected Delivery Time (ETA): " + order.getEta() + " minutes");
            System.out.println("Status: " + order.getStatus() + " (Allocated Rider: " + order.getRiderName() + ")");
            System.out.println("🔒 Time-bound OTP for delivery handoff: " + order.getOtp());
            cart.clear(); // empty cart on success
        } else {
            System.out.println("❌ Order placement failed.");
        }
    }

    private void trackOrdersMenu(User customer) {
        printSubHeader("LIVE ORDER TRACKING");
        List<Order> orders = orderService.getOrdersByCustomer(customer.getId());
        if (orders.isEmpty()) {
            System.out.println("ℹ️ You have no active or completed orders.");
            return;
        }

        System.out.println("Active Orders:");
        List<Order> activeList = new ArrayList<>();
        for (Order o : orders) {
            if (!"Delivered".equalsIgnoreCase(o.getStatus()) && !"Cancelled".equalsIgnoreCase(o.getStatus())) {
                activeList.add(o);
                System.out.println(" " + activeList.size() + ". ID: " + o.getId() + " - Pharmacy: " + o.getPharmacyName() + " - Status: " + o.getStatus());
            }
        }

        if (activeList.isEmpty()) {
            System.out.println("ℹ️ No active deliveries ongoing.");
            return;
        }

        System.out.print("Select Order to track (1-" + activeList.size() + "): ");
        try {
            int sel = Integer.parseInt(scanner.nextLine().trim()) - 1;
            if (sel >= 0 && sel < activeList.size()) {
                Order order = activeList.get(sel);
                String trackingStr = orderService.simulateTrackingGPS(order);
                System.out.println(trackingStr);
            } else {
                System.out.println("❌ Invalid order selection.");
            }
        } catch (Exception e) {
            System.out.println("❌ Invalid selection.");
        }
    }

    private void profileMenu(User customer) {
        boolean exit = false;
        while (!exit) {
            printSubHeader("PROFILE AND ADDRESSES");
            System.out.println("Name: " + customer.getName());
            System.out.println("Email: " + customer.getEmail());
            System.out.println("Phone: " + customer.getPhone());
            System.out.println("\nSaved Addresses:");
            if (customer.getAddresses().isEmpty()) {
                System.out.println("  No saved addresses.");
            } else {
                for (int i = 0; i < customer.getAddresses().size(); i++) {
                    System.out.println("  " + (i + 1) + ". " + customer.getAddresses().get(i));
                }
            }
            System.out.println("\n 1. Add Address");
            System.out.println(" 2. View Order History");
            System.out.println(" 3. Back");
            System.out.print("Option: ");
            String opt = scanner.nextLine().trim();
            if ("1".equals(opt)) {
                System.out.print("Enter new address details: ");
                String addr = scanner.nextLine().trim();
                if (!addr.isEmpty()) {
                    userService.addAddress(customer, addr);
                    System.out.println("✅ Address added!");
                }
            } else if ("2".equals(opt)) {
                viewOrderHistory(customer.getId());
            } else {
                exit = true;
            }
        }
    }

    private void viewOrderHistory(String customerId) {
        printSubHeader("ORDER HISTORY");
        List<Order> list = orderService.getOrdersByCustomer(customerId);
        if (list.isEmpty()) {
            System.out.println("ℹ️ No past order history.");
            return;
        }

        System.out.println("-----------------------------------------------------------------------------------");
        System.out.printf("| %-10s | %-12s | %-20s | %-12s | %-15s |\n", "Order ID", "Date", "Pharmacy", "Amount", "Status");
        System.out.println("-----------------------------------------------------------------------------------");
        for (Order o : list) {
            System.out.printf("| %-10s | %-12s | %-20s | $%-11.2f | %-15s |\n",
                o.getId(), o.getOrderTime().split(" ")[0], o.getPharmacyName(), o.getTotal(), o.getStatus());
        }
        System.out.println("-----------------------------------------------------------------------------------");
    }

    private void feedbackMenu(User customer) {
        printSubHeader("SUBMIT ORDER FEEDBACK");
        List<Order> orders = orderService.getOrdersByCustomer(customer.getId());
        List<Order> delivered = new ArrayList<>();
        for (Order o : orders) {
            if ("Delivered".equalsIgnoreCase(o.getStatus())) {
                delivered.add(o);
            }
        }

        if (delivered.isEmpty()) {
            System.out.println("ℹ️ You can only submit feedback for delivered orders. No delivered orders found.");
            return;
        }

        System.out.println("Delivered Orders:");
        for (int i = 0; i < delivered.size(); i++) {
            Order o = delivered.get(i);
            System.out.println(" " + (i + 1) + ". Order " + o.getId() + " from Pharmacy: " + o.getPharmacyName());
        }
        System.out.print("Select order to review (1-" + delivered.size() + "): ");
        try {
            int sel = Integer.parseInt(scanner.nextLine().trim()) - 1;
            if (sel < 0 || sel >= delivered.size()) {
                System.out.println("❌ Invalid selection.");
                return;
            }
            Order order = delivered.get(sel);
            
            // Check if already reviewed
            for (Feedback fb : Database.feedbacks) {
                if (fb.getOrderId().equals(order.getId())) {
                    System.out.println("❌ You have already submitted feedback for this order.");
                    return;
                }
            }

            System.out.print("Rate Pharmacy Service (1-5 stars): ");
            int pRating = Integer.parseInt(scanner.nextLine().trim());
            System.out.print("Rate Delivery Partner Rider (1-5 stars): ");
            int rRating = Integer.parseInt(scanner.nextLine().trim());
            System.out.print("Overall Order Experience Rating (1-5 stars): ");
            int oRating = Integer.parseInt(scanner.nextLine().trim());
            System.out.print("Enter review comments: ");
            String comments = scanner.nextLine().trim();

            Feedback feedback = new Feedback(
                "FB-" + (Database.feedbacks.size() + 101),
                order.getId(),
                customer.getId(),
                customer.getName(),
                order.getPharmacyId(),
                order.getPharmacyName(),
                order.getRiderId(),
                order.getRiderName(),
                pRating,
                rRating,
                oRating,
                comments,
                LocalDate.now().toString()
            );
            Database.feedbacks.add(feedback);
            Database.saveFeedbacks();
            System.out.println("⭐⭐⭐ Feedback submitted successfully! Thank you for your review!");
        } catch (Exception e) {
            System.out.println("❌ Rating input must be valid numeric stars.");
        }
    }


    // ==========================================
    // 2. PHARMACY PORTAL
    // ==========================================
    private void pharmacyPortal() {
        boolean back = false;
        while (!back) {
            printHeader("PHARMACY PORTAL");
            System.out.println(" 1. Register Pharmacy Profile");
            System.out.println(" 2. Login");
            System.out.println(" 3. Back to Main Menu");
            System.out.print("\nSelect option: ");
            String opt = scanner.nextLine().trim();
            switch (opt) {
                case "1": pharmacyRegister(); break;
                case "2": pharmacyLogin(); break;
                case "3": back = true; break;
                default: System.out.println("❌ Invalid choice.");
            }
        }
    }

    private void pharmacyRegister() {
        printSubHeader("PHARMACY ONBOARDING REGISTRATION");
        System.out.print("Enter username: ");
        String user = scanner.nextLine().trim();
        System.out.print("Enter password: ");
        String pass = scanner.nextLine().trim();
        System.out.print("Enter pharmacy store name: ");
        String name = scanner.nextLine().trim();
        System.out.print("Enter owner/manager full name: ");
        String owner = scanner.nextLine().trim();
        System.out.print("Enter pharmacy drug license number: ");
        String license = scanner.nextLine().trim();
        System.out.print("Enter store physical address: ");
        String address = scanner.nextLine().trim();
        System.out.print("Enter contact email: ");
        String email = scanner.nextLine().trim();
        System.out.print("Enter contact phone: ");
        String phone = scanner.nextLine().trim();

        // Coordinates default
        double lat = 12.9716 + (Math.random() - 0.5) * 0.05;
        double lng = 77.5946 + (Math.random() - 0.5) * 0.05;

        if (user.isEmpty() || pass.isEmpty() || license.isEmpty() || address.isEmpty()) {
            System.out.println("❌ Registration failed. Mandatory fields cannot be empty.");
            return;
        }

        Pharmacy p = pharmacyService.register(user, pass, name, owner, email, phone, license, address, lat, lng);
        if (p != null) {
            System.out.println("🎉 Onboarding registration submitted! Store ID: " + p.getId());
            System.out.println("⏳ Awaiting Admin verification and onboarding clearance.");
        }
    }

    private void pharmacyLogin() {
        printSubHeader("PHARMACY STORE LOGIN");
        System.out.print("Enter username: ");
        String user = scanner.nextLine().trim();
        System.out.print("Enter password: ");
        String pass = scanner.nextLine().trim();

        Pharmacy pharmacy = pharmacyService.login(user, pass);
        if (pharmacy != null) {
            System.out.println("✅ Login Successful! Welcome to dashboard, " + pharmacy.getName() + ".");
            pharmacyMenu(pharmacy);
        }
    }

    private void pharmacyMenu(Pharmacy pharmacy) {
        boolean logout = false;
        while (!logout) {
            printHeader("PHARMACY HUB: " + pharmacy.getName());
            
            // Check critical warnings
            Map<String, List<String>> alerts = pharmacyService.getExpiryAndLowStockAlerts(pharmacy);
            int lowStockCount = alerts.get("lowStock").size();
            int expiringCount = alerts.get("expiring").size();
            if (lowStockCount > 0 || expiringCount > 0) {
                System.out.println("⚠️ ALERTS PANEL: " + lowStockCount + " medicines low in stock, " + expiringCount + " medicines expiring within 30 days!");
            }

            System.out.println(" 1. View Inventory Listing");
            System.out.println(" 2. Add New Medicine to Stock");
            System.out.println(" 3. View Expiry & Stock Alerts Detail");
            System.out.println(" 4. Process Pending Customer Orders");
            System.out.println(" 5. View Store Analytics");
            System.out.println(" 6. Logout");
            System.out.print("\nSelect option: ");
            String opt = scanner.nextLine().trim();
            switch (opt) {
                case "1": viewInventory(pharmacy); break;
                case "2": addNewMedicine(pharmacy); break;
                case "3": viewAlertsDetail(alerts); break;
                case "4": processOrdersMenu(pharmacy); break;
                case "5": viewPharmacyAnalytics(pharmacy); break;
                case "6": logout = true; break;
                default: System.out.println("❌ Invalid choice.");
            }
        }
    }

    private void viewInventory(Pharmacy p) {
        printSubHeader("INVENTORY LISTING");
        if (p.getMedicines().isEmpty()) {
            System.out.println("ℹ️ No medicines added to store yet.");
            return;
        }

        System.out.println("-----------------------------------------------------------------------------------------------------");
        System.out.printf("| %-10s | %-20s | %-20s | %-12s | %-10s | %-10s |\n", "ID", "Name", "Composition", "Price", "Quantity", "Expiry");
        System.out.println("-----------------------------------------------------------------------------------------------------");
        for (Medicine m : p.getMedicines()) {
            System.out.printf("| %-10s | %-20s | %-20s | $%-11.2f | %-10d | %-10s |\n",
                m.getId(), m.getName(), m.getComposition(), m.getPrice(), m.getQuantity(), m.getExpiryDate());
        }
        System.out.println("-----------------------------------------------------------------------------------------------------");

        System.out.print("\nEnter Medicine ID to edit stock (or press enter to skip): ");
        String id = scanner.nextLine().trim();
        if (id.isEmpty()) return;

        Medicine target = null;
        for (Medicine m : p.getMedicines()) {
            if (m.getId().equalsIgnoreCase(id)) {
                target = m;
                break;
            }
        }

        if (target == null) {
            System.out.println("❌ Medicine not found.");
            return;
        }

        System.out.print("Enter new stock quantity: ");
        try {
            int stock = Integer.parseInt(scanner.nextLine().trim());
            pharmacyService.updateMedicineStock(p, target.getId(), stock);
            System.out.println("✅ Inventory stock updated successfully!");
        } catch (Exception e) {
            System.out.println("❌ Invalid input.");
        }
    }

    private void addNewMedicine(Pharmacy p) {
        printSubHeader("ADD INVENTORY MEDICINE");
        System.out.print("Enter medicine name: ");
        String name = scanner.nextLine().trim();
        System.out.print("Enter description: ");
        String desc = scanner.nextLine().trim();
        System.out.print("Enter unit price: ");
        double price = Double.parseDouble(scanner.nextLine().trim());
        System.out.print("Enter composition: ");
        String comp = scanner.nextLine().trim();
        System.out.print("Enter category: ");
        String cat = scanner.nextLine().trim();
        System.out.print("Enter quantity added: ");
        int qty = Integer.parseInt(scanner.nextLine().trim());
        System.out.print("Enter manufacturing date (YYYY-MM-DD): ");
        String mfg = scanner.nextLine().trim();
        System.out.print("Enter expiry date (YYYY-MM-DD): ");
        String exp = scanner.nextLine().trim();
        System.out.print("Enter mock image file path (e.g. /images/meds/crocin.jpg): ");
        String img = scanner.nextLine().trim();

        if (name.isEmpty() || exp.isEmpty() || qty <= 0) {
            System.out.println("❌ Validation failed. Name, Expiry, and quantity are mandatory.");
            return;
        }

        pharmacyService.addMedicine(p, name, desc, price, exp, qty, mfg, comp, cat, img);
        System.out.println("✅ Medicine added successfully to inventory listing!");
    }

    private void viewAlertsDetail(Map<String, List<String>> alerts) {
        printSubHeader("STOCK AND EXPIRY ALERTS PANEL");
        System.out.println("\n🔥 Expiring Medicines (<30 days limit):");
        if (alerts.get("expiring").isEmpty()) {
            System.out.println("  No medicines expiring soon. Excellent safety status!");
        } else {
            for (String str : alerts.get("expiring")) {
                System.out.println("  🔴 " + str);
            }
        }

        System.out.println("\n🧮 Low Stock Medicines (<10 units threshold):");
        if (alerts.get("lowStock").isEmpty()) {
            System.out.println("  All stock levels are optimal.");
        } else {
            for (String str : alerts.get("lowStock")) {
                System.out.println("  🟡 " + str);
            }
        }
        System.out.print("\nPress enter to go back...");
        scanner.nextLine();
    }

    private void processOrdersMenu(Pharmacy p) {
        printSubHeader("PENDING CUSTOMER ORDERS PROCESSING");
        List<Order> list = pharmacyService.getPendingOrders(p.getId());
        if (list.isEmpty()) {
            System.out.println("ℹ️ No pending orders found for your pharmacy store.");
            return;
        }

        for (int i = 0; i < list.size(); i++) {
            Order o = list.get(i);
            System.out.println(" " + (i + 1) + ". Order " + o.getId() + " - Total: " + String.format("$%.2f", o.getTotal()) + " - Address: " + o.getAddress());
        }

        System.out.print("\nSelect order number to review (or press enter to skip): ");
        String input = scanner.nextLine().trim();
        if (input.isEmpty()) return;

        try {
            int sel = Integer.parseInt(input) - 1;
            if (sel >= 0 && sel < list.size()) {
                Order order = list.get(sel);
                printSubHeader("ORDER DETAIL: " + order.getId());
                System.out.println("Customer Address: " + order.getAddress());
                System.out.println("Customer Phone: " + order.getCustomerPhone());
                System.out.println("Notes: " + (order.getCustomerNote().isEmpty() ? "None" : order.getCustomerNote()));
                System.out.println("Payment Mode: " + order.getPaymentMethod());
                System.out.println("\nItems ordered:");
                for (Order.OrderItem oi : order.getItems()) {
                    System.out.println(" - " + oi.getName() + " x" + oi.getQty() + " (Price: $" + oi.getPrice() + ")");
                }

                System.out.print("\nDo you accept this order? (Y/N): ");
                String decision = scanner.nextLine().trim();
                boolean accept = "Y".equalsIgnoreCase(decision);
                pharmacyService.processOrder(order, accept);
            } else {
                System.out.println("❌ Invalid number.");
            }
        } catch (Exception e) {
            System.out.println("❌ Invalid input selection.");
        }
    }

    private void viewPharmacyAnalytics(Pharmacy p) {
        printSubHeader("STORE PERFORMANCE ANALYTICS");
        Map<String, Object> map = pharmacyService.getAnalytics(p.getId());
        System.out.println("Total Completed Orders: " + map.get("totalOrders"));
        System.out.println("Total Sales Revenue: " + String.format("$%.2f", map.get("totalSales")));
        System.out.print("\nPress enter to go back...");
        scanner.nextLine();
    }


    // ==========================================
    // 3. RIDER PORTAL
    // ==========================================
    private void riderPortal() {
        boolean back = false;
        while (!back) {
            printHeader("RIDER PORTAL");
            System.out.println(" 1. Register Rider Account");
            System.out.println(" 2. Login");
            System.out.println(" 3. Back to Main Menu");
            System.out.print("\nSelect option: ");
            String opt = scanner.nextLine().trim();
            switch (opt) {
                case "1": riderRegister(); break;
                case "2": riderLogin(); break;
                case "3": back = true; break;
                default: System.out.println("❌ Invalid choice.");
            }
        }
    }

    private void riderRegister() {
        printSubHeader("RIDER ONBOARDING REGISTRATION");
        System.out.print("Enter username: ");
        String user = scanner.nextLine().trim();
        System.out.print("Enter password: ");
        String pass = scanner.nextLine().trim();
        System.out.print("Enter full name: ");
        String name = scanner.nextLine().trim();
        System.out.print("Enter contact phone: ");
        String phone = scanner.nextLine().trim();
        System.out.print("Enter contact email: ");
        String email = scanner.nextLine().trim();
        System.out.print("Enter vehicle type (e.g. Motorcycle, Bicycle): ");
        String vType = scanner.nextLine().trim();
        System.out.print("Enter vehicle plate number: ");
        String vNum = scanner.nextLine().trim();

        // KYC Documents
        System.out.print("Enter Aadhaar Card Number: ");
        String aadhaar = scanner.nextLine().trim();
        System.out.print("Enter Driving License Number: ");
        String dl = scanner.nextLine().trim();
        System.out.print("Enter RC Book Bike Papers registration file: ");
        String papers = scanner.nextLine().trim();

        // Coordinates default
        double lat = 12.9716 + (Math.random() - 0.5) * 0.05;
        double lng = 77.5946 + (Math.random() - 0.5) * 0.05;

        if (user.isEmpty() || pass.isEmpty() || aadhaar.isEmpty() || dl.isEmpty()) {
            System.out.println("❌ KYC validation error. Username, Password, Aadhaar, and DL are required.");
            return;
        }

        Rider r = riderService.register(user, pass, name, email, phone, vType, vNum, aadhaar, dl, papers, lat, lng);
        if (r != null) {
            System.out.println("🎉 Registration Successful! Rider ID: " + r.getId());
            System.out.println("⏳ Awaiting KYC documents verification and account onboarding approval by Administrator.");
        }
    }

    private void riderLogin() {
        printSubHeader("RIDER DEVICE LOGIN");
        System.out.print("Enter username: ");
        String user = scanner.nextLine().trim();
        System.out.print("Enter password: ");
        String pass = scanner.nextLine().trim();

        Rider rider = riderService.login(user, pass);
        if (rider != null) {
            System.out.println("✅ Login Successful! Rider active: " + rider.getName());
            riderMenu(rider);
        }
    }

    private void riderMenu(Rider rider) {
        boolean logout = false;
        while (!logout) {
            printHeader("RIDER DASHBOARD: " + rider.getName() + " (RIDER ID: " + rider.getId() + ")");
            System.out.println("Availability Status: " + (rider.isAvailability() ? "🟢 ONLINE / ACTIVE" : "🔴 OFFLINE / BUSY"));
            System.out.println("Earnings: " + String.format("$%.2f", rider.getEarnings()) + " | Credits System points: " + rider.getCredits());
            System.out.println("----------------------------------------------------------------");
            System.out.println(" 1. Toggle Online/Offline Availability");
            System.out.println(" 2. View Assigned Orders (Deliveries Queue)");
            System.out.println(" 3. View Earnings & Completed History");
            System.out.println(" 4. Logout");
            System.out.print("\nSelect option: ");
            String opt = scanner.nextLine().trim();
            switch (opt) {
                case "1": riderService.toggleAvailability(rider); break;
                case "2": riderDeliveriesQueue(rider); break;
                case "3": viewRiderHistory(rider); break;
                case "4": logout = true; break;
                default: System.out.println("❌ Invalid choice.");
            }
        }
    }

    private void riderDeliveriesQueue(Rider rider) {
        printSubHeader("ASSIGNED DELIVERIES QUEUE");
        List<Order> list = riderService.getAssignedOrders(rider.getId());
        if (list.isEmpty()) {
            System.out.println("ℹ️ No active deliveries assigned to your queue.");
            return;
        }

        for (int i = 0; i < list.size(); i++) {
            Order o = list.get(i);
            System.out.println(" " + (i + 1) + ". Order " + o.getId() + " - Store: " + o.getPharmacyName() + " - Delivery: " + o.getAddress() + " [Status: " + o.getStatus() + "]");
        }

        System.out.print("\nSelect order number to manage (or press enter to skip): ");
        String input = scanner.nextLine().trim();
        if (input.isEmpty()) return;

        try {
            int sel = Integer.parseInt(input) - 1;
            if (sel >= 0 && sel < list.size()) {
                Order order = list.get(sel);
                riderOrderActionMenu(order, rider);
            } else {
                System.out.println("❌ Invalid selection.");
            }
        } catch (Exception e) {
            System.out.println("❌ Invalid input selection.");
        }
    }

    private void riderOrderActionMenu(Order order, Rider rider) {
        boolean back = false;
        while (!back) {
            printSubHeader("MANAGE ORDER: " + order.getId());
            System.out.println("Current status: " + order.getStatus());
            System.out.println("Pharmacy Store: " + order.getPharmacyName());
            System.out.println("Customer Name: " + order.getCustomerName());
            System.out.println("Customer Address: " + order.getAddress());
            System.out.println("Special Note: " + (order.getCustomerNote().isEmpty() ? "None" : order.getCustomerNote()));
            System.out.println("----------------------------------------------");
            System.out.println(" 1. Accept/Reject Assignment (First assignment check)");
            System.out.println(" 2. Mark Out for Delivery (Pick up medicines)");
            System.out.println(" 3. View GPS Route Maps Guidance");
            System.out.println(" 4. Update delivery ETA (in minutes)");
            System.out.println(" 5. Complete Delivery (OTP verification)");
            System.out.println(" 6. Cancel Delivery (requires cancellation reason)");
            System.out.println(" 7. Back");
            System.out.print("Select action: ");
            String choice = scanner.nextLine().trim();
            switch (choice) {
                case "1":
                    if (!"Pending".equalsIgnoreCase(order.getStatus()) && !"Accepted".equalsIgnoreCase(order.getStatus())) {
                        System.out.println("❌ Order has already been accepted and processed.");
                        break;
                    }
                    System.out.print("Accept this delivery job? (Y/N): ");
                    boolean accept = "Y".equalsIgnoreCase(scanner.nextLine().trim());
                    riderService.acceptOrRejectOrder(order, accept);
                    if (!accept) back = true;
                    break;
                case "2":
                    if (!"Preparing".equalsIgnoreCase(order.getStatus()) && !"Accepted".equalsIgnoreCase(order.getStatus())) {
                        System.out.println("❌ Medicine is either not prepared or already picked up.");
                        break;
                    }
                    riderService.updateStatus(order, "Out for Delivery");
                    System.out.println("🏍️ Status updated! Out for delivery. Check routes map.");
                    break;
                case "3":
                    double plat = 12.9716;
                    double plng = 77.5946;
                    for (Pharmacy p : Database.pharmacies) {
                        if (p.getId().equals(order.getPharmacyId())) {
                            plat = p.getLat();
                            plng = p.getLng();
                            break;
                        }
                    }
                    System.out.println(LocationUtils.generateRouteMap(plat, plng, plat + 0.005, plng + 0.005));
                    break;
                case "4":
                    System.out.print("Enter updated ETA (in minutes): ");
                    try {
                        int eta = Integer.parseInt(scanner.nextLine().trim());
                        riderService.updateETA(order, eta);
                        System.out.println("✅ ETA updated!");
                    } catch (Exception e) {
                        System.out.println("❌ Invalid format.");
                    }
                    break;
                case "5":
                    if (!"Out for Delivery".equalsIgnoreCase(order.getStatus())) {
                        System.out.println("❌ You must mark the order 'Out for Delivery' first.");
                        break;
                    }
                    System.out.print("Enter OTP shared by customer: ");
                    String otp = scanner.nextLine().trim();
                    boolean success = riderService.confirmDeliveryWithOTP(order, otp, rider);
                    if (success) {
                        System.out.println("🎉 OTP validated successfully! Delivery marked complete.");
                        System.out.println("💰 Earning credit credited to your account profile.");
                        back = true;
                    } else {
                        System.out.println("❌ Incorrect OTP code verification failed.");
                    }
                    break;
                case "6":
                    System.out.print("Enter cancellation reason: ");
                    String reason = scanner.nextLine().trim();
                    if (!reason.isEmpty()) {
                        order.setStatus("Cancelled");
                        order.setRiskScore("Medium");
                        order.setRiskReason("Cancelled by Rider: " + reason);
                        Database.saveOrders();
                        System.out.println("❌ Order cancelled.");
                        back = true;
                    }
                    break;
                case "7": back = true; break;
                default: System.out.println("❌ Invalid choice.");
            }
        }
    }

    private void viewRiderHistory(Rider r) {
        printSubHeader("EARNINGS AND DELIVERY HISTORY");
        Map<String, Object> map = riderService.getAnalytics(r.getId());
        System.out.println("Total Completed Deliveries: " + map.get("completed"));
        System.out.println("Total Accumulated Earnings: " + String.format("$%.2f", map.get("earnings")));
        System.out.println("KYC Credit points score: " + map.get("credits"));
        
        System.out.println("\nPast Deliveries:");
        for (Order o : Database.orders) {
            if (o.getRiderId().equals(r.getId()) && "Delivered".equalsIgnoreCase(o.getStatus())) {
                System.out.println(" - Order ID: " + o.getId() + " - Pharmacy: " + o.getPharmacyName() + " - Completed on: " + o.getOrderTime().split(" ")[0]);
            }
        }
        System.out.print("\nPress enter to go back...");
        scanner.nextLine();
    }


    // ==========================================
    // 4. ADMIN PORTAL
    // ==========================================
    private void adminPortal() {
        printSubHeader("ADMIN LOGIN");
        System.out.print("Enter Admin Username: ");
        String user = scanner.nextLine().trim();
        System.out.print("Enter Admin Password: ");
        String pass = scanner.nextLine().trim();

        if (adminService.login(user, pass)) {
            System.out.println("✅ Administrator Access Granted.");
            adminMenu();
        } else {
            System.out.println("❌ Access Denied. Invalid credentials.");
        }
    }

    private void adminMenu() {
        boolean exit = false;
        while (!exit) {
            printHeader("ADMIN CONTROL CONSOLE");
            System.out.println(" 1. User Directory & Management");
            System.out.println(" 2. Pharmacy Verification Queue");
            System.out.println(" 3. Rider Verification & KYC Onboarding");
            System.out.println(" 4. Rule Configuration Engine");
            System.out.println(" 5. Platform-Wide Analytics Dashboard");
            System.out.println(" 6. Customer Feedbacks & Rating Reviews");
            System.out.println(" 7. Exit Admin Console");
            System.out.print("\nSelect option: ");
            String opt = scanner.nextLine().trim();
            switch (opt) {
                case "1": adminUserManagement(); break;
                case "2": adminPharmacyVerification(); break;
                case "3": adminRiderVerification(); break;
                case "4": adminRuleConfig(); break;
                case "5": adminAnalyticsDashboard(); break;
                case "6": adminReviewsConsole(); break;
                case "7": exit = true; break;
                default: System.out.println("❌ Invalid choice.");
            }
        }
    }

    private void adminUserManagement() {
        printSubHeader("USER DIRECTORY MANAGEMENT");
        System.out.println("Customers Registered:");
        for (User u : Database.users) {
            System.out.println(" - ID: " + u.getId() + " - Name: " + u.getName() + " - Status: [" + u.getStatus() + "]");
        }
        System.out.print("\nEnter User ID to toggle active/suspended status (or press enter to skip): ");
        String id = scanner.nextLine().trim();
        if (id.isEmpty()) return;

        User target = null;
        for (User u : Database.users) {
            if (u.getId().equalsIgnoreCase(id)) {
                target = u;
                break;
            }
        }

        if (target != null) {
            adminService.toggleUserSuspension(target.getId());
            System.out.println("✅ Suspension status toggled for " + target.getName() + ". Current: " + target.getStatus());
        } else {
            System.out.println("❌ User not found.");
        }
    }

    private void adminPharmacyVerification() {
        printSubHeader("PHARMACY ONBOARDING QUEUE");
        List<Pharmacy> pending = adminService.getPendingPharmacies();
        if (pending.isEmpty()) {
            System.out.println("ℹ️ No pending pharmacy verification requests.");
            return;
        }

        for (int i = 0; i < pending.size(); i++) {
            Pharmacy p = pending.get(i);
            System.out.println(" " + (i + 1) + ". ID: " + p.getId() + " - Name: " + p.getName() + " - License: " + p.getLicense() + " - Address: " + p.getAddress());
        }

        System.out.print("\nSelect number to verify (or press enter to skip): ");
        String input = scanner.nextLine().trim();
        if (input.isEmpty()) return;

        try {
            int sel = Integer.parseInt(input) - 1;
            if (sel >= 0 && sel < pending.size()) {
                Pharmacy p = pending.get(sel);
                System.out.print("Approve " + p.getName() + "? (Y/N): ");
                boolean approve = "Y".equalsIgnoreCase(scanner.nextLine().trim());
                adminService.approvePharmacy(p.getId(), approve);
                System.out.println(approve ? "✅ Pharmacy Approved and Active!" : "❌ Pharmacy Onboarding Rejected.");
            }
        } catch (Exception e) {
            System.out.println("❌ Invalid input.");
        }
    }

    private void adminRiderVerification() {
        printSubHeader("RIDER ONBOARDING KYC QUEUE");
        List<Rider> pending = adminService.getPendingRiders();
        if (pending.isEmpty()) {
            System.out.println("ℹ️ No pending rider onboarding requests.");
            return;
        }

        for (int i = 0; i < pending.size(); i++) {
            Rider r = pending.get(i);
            System.out.println(" " + (i + 1) + ". ID: " + r.getId() + " - Name: " + r.getName() + " - Aadhaar: " + r.getAadhaar() + " - DL: " + r.getLicenseNo());
        }

        System.out.print("\nSelect number to verify KYC documents (or press enter to skip): ");
        String input = scanner.nextLine().trim();
        if (input.isEmpty()) return;

        try {
            int sel = Integer.parseInt(input) - 1;
            if (sel >= 0 && sel < pending.size()) {
                Rider r = pending.get(sel);
                System.out.println("\nReviewing papers for: " + r.getName());
                System.out.println("Vehicle Number: " + r.getVehicleNumber());
                System.out.println("Bike papers details: " + r.getBikePapers());
                
                System.out.print("\nApprove KYC verification documents? (Y/N): ");
                boolean approve = "Y".equalsIgnoreCase(scanner.nextLine().trim());
                adminService.approveRider(r.getId(), approve);
                System.out.println(approve ? "✅ Rider Approved and Onboarded!" : "❌ Rider KYC Rejected.");
            }
        } catch (Exception e) {
            System.out.println("❌ Invalid input.");
        }
    }

    private void adminRuleConfig() {
        printSubHeader("DYNAMIC SYSTEM RULE ENGINE");
        System.out.println("Current Rule Configurations:");
        System.out.println(" - Max Delivery Radius: " + Database.config.getDeliveryRadius() + " km");
        System.out.println(" - Base Delivery Charge: $" + Database.config.getBaseDeliveryCharge());
        System.out.println(" - Delivery Fee Per Kilometer: $" + Database.config.getChargePerKm());
        System.out.println(" - Platform Commission Rate: " + Database.config.getCommissionRate() + "%");
        System.out.println(" - Auto Allocate Riders: " + (Database.config.isAutoAssignRiders() ? "Active" : "Disabled"));
        System.out.println(" - Max Rider Proximity Search: " + Database.config.getMaxRiderDistance() + " km");
        System.out.println("-----------------------------------------------------------------");
        
        System.out.print("Enter new Max Delivery Radius (km): ");
        double radius = Double.parseDouble(scanner.nextLine().trim());
        System.out.print("Enter new Base Delivery Charge ($): ");
        double baseCharge = Double.parseDouble(scanner.nextLine().trim());
        System.out.print("Enter new Delivery Fee per km ($): ");
        double perKm = Double.parseDouble(scanner.nextLine().trim());
        System.out.print("Enter new Platform Commission Rate (%): ");
        double comm = Double.parseDouble(scanner.nextLine().trim());
        System.out.print("Enable Auto-Assignment allocation? (true/false): ");
        boolean auto = Boolean.parseBoolean(scanner.nextLine().trim());
        System.out.print("Enter new Max Rider Assignment proximity (km): ");
        double maxRider = Double.parseDouble(scanner.nextLine().trim());

        adminService.updateSystemConfig(radius, baseCharge, perKm, comm, auto, maxRider);
    }

    private void adminAnalyticsDashboard() {
        printSubHeader("PLATFORM-WIDE BUSINESS INTELLIGENCE");
        Map<String, Object> map = adminService.getSystemAnalytics();
        
        System.out.println("Platform Metrics Summary:");
        System.out.println(" - Total Registered Customers: " + map.get("totalCustomers"));
        System.out.println(" - Total Onboarded Pharmacies: " + map.get("totalPharmacies"));
        System.out.println(" - Total Onboarded Riders: " + map.get("totalRiders"));
        System.out.println(" - Total Orders Executed: " + map.get("totalOrders"));
        System.out.println(" - Completed Orders: " + map.get("completed"));
        System.out.println(" - Cancelled Orders: " + map.get("cancelled"));
        System.out.println(" - System-Wide Total Sales: " + String.format("$%.2f", map.get("totalRevenue")));
        System.out.println(" - Platform Commissions Net Profits: " + String.format("$%.2f", map.get("platformCommissions")));
        System.out.print("\nPress enter to go back...");
        scanner.nextLine();
    }

    private void adminReviewsConsole() {
        printSubHeader("CUSTOMER RATINGS & REVIEWS HUB");
        if (Database.feedbacks.isEmpty()) {
            System.out.println("ℹ️ No feedbacks submitted by customers yet.");
            return;
        }

        System.out.println("Feedbacks timeline:");
        for (Feedback f : Database.feedbacks) {
            System.out.println("---------------------------------------------------------------------------------");
            System.out.println("Order ID: " + f.getOrderId() + " | Customer: " + f.getCustomerName() + " | Date: " + f.getDate());
            System.out.println("Pharmacy: " + f.getPharmacyName() + " (Rating: " + f.getPharmacyRating() + "/5 stars)");
            System.out.println("Rider: " + f.getRiderName() + " (Rating: " + f.getRiderRating() + "/5 stars)");
            System.out.println("Overall rating: " + f.getOverallRating() + "/5 stars");
            System.out.println("Review Comment: \"" + f.getComments() + "\"");
            
            // Urgently flag low ratings for admins
            if (f.getOverallRating() <= 2) {
                System.out.println("🔴 URGENT ATTENTION: Low review rating flagged for quality check.");
            }
        }
        System.out.println("---------------------------------------------------------------------------------");
        System.out.print("\nPress enter to go back...");
        scanner.nextLine();
    }

    // ==========================================
    // UI STYLING & FORMATTING HELPERS
    // ==========================================
    private void printHeader(String title) {
        System.out.println("\n========================================================");
        System.out.println("  " + title);
        System.out.println("========================================================");
    }

    private void printSubHeader(String title) {
        System.out.println("\n>>> " + title + " <<<");
    }
}
