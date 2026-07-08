package services;

import models.*;
import utils.LocationUtils;
import java.util.*;

public class OrderService {

    public Order getOrderDetails(String orderId) {
        for (Order o : Database.orders) {
            if (o.getId().equalsIgnoreCase(orderId)) {
                return o;
            }
        }
        return null;
    }

    public List<Order> getOrdersByCustomer(String customerId) {
        List<Order> list = new ArrayList<>();
        for (Order o : Database.orders) {
            if (o.getCustomerId().equalsIgnoreCase(customerId)) {
                list.add(o);
            }
        }
        return list;
    }

    public List<Order> getAllOrders() {
        return Database.orders;
    }

    // Manual rider allocation override (useful for Pharmacy or Admin portals)
    public boolean manuallyAssignRider(Order order, Rider rider) {
        if (!"Active".equalsIgnoreCase(rider.getStatus())) {
            System.out.println("❌ Rider is not active/verified.");
            return false;
        }
        order.setRiderId(rider.getId());
        order.setRiderName(rider.getName());
        order.setStatus("Accepted"); // Set status to accepted so rider starts
        Database.saveOrders();
        return true;
    }

    // Dynamic Live Order Tracking simulation
    public String simulateTrackingGPS(Order order) {
        if ("Delivered".equalsIgnoreCase(order.getStatus())) {
            return "🏁 Order Delivered successfully! Verification completed.";
        }
        if ("Cancelled".equalsIgnoreCase(order.getStatus())) {
            return "❌ Order has been cancelled.";
        }
        if ("Pending".equalsIgnoreCase(order.getStatus())) {
            return "⏳ Awaiting Pharmacy acceptance...";
        }

        // Mock coordinates for Pharmacy and Customer
        double plat = 12.9716;
        double plng = 77.5946;
        double ulat = 12.9816;
        double ulng = 77.6046;

        // Find pharmacy coordinates
        for (Pharmacy p : Database.pharmacies) {
            if (p.getId().equals(order.getPharmacyId())) {
                plat = p.getLat();
                plng = p.getLng();
                break;
            }
        }

        // Create random moving coordinates for rider based on status
        double rlat, rlng;
        if ("Preparing".equalsIgnoreCase(order.getStatus())) {
            rlat = plat + 0.002; // Rider waiting at Pharmacy
            rlng = plng - 0.002;
            return "🧑‍🍳 Pharmacy is preparing your medicines. Rider is waiting at store.\n" +
                   "📍 Store Location: " + String.format("%.4f, %.4f", plat, plng) + "\n" +
                   "⏱️ ETA: " + order.getEta() + " mins";
        } else if ("Out for Delivery".equalsIgnoreCase(order.getStatus())) {
            // Rider is halfway
            rlat = (plat + ulat) / 2 + (Math.random() - 0.5) * 0.001;
            rlng = (plng + ulng) / 2 + (Math.random() - 0.5) * 0.001;
            
            String mapAscii = LocationUtils.generateRouteMap(plat, plng, ulat, ulng);
            return "🏍️ Rider is out for delivery with your medicines!\n" +
                   "📍 Rider Live Coordinates: " + String.format("%.4f, %.4f", rlat, rlng) + "\n" +
                   "⏱️ ETA: " + order.getEta() + " mins\n" +
                   mapAscii;
        }

        return "⏳ Processing order status: " + order.getStatus();
    }
}
