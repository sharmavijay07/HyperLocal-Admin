package services;

import models.*;
import utils.JsonUtils;
import java.util.*;

public class Database {
    private static final String DATA_DIR = "console-app/data/";
    private static final String USERS_FILE = DATA_DIR + "users.json";
    private static final String PHARMACIES_FILE = DATA_DIR + "pharmacies.json";
    private static final String RIDERS_FILE = DATA_DIR + "riders.json";
    private static final String ORDERS_FILE = DATA_DIR + "orders.json";
    private static final String FEEDBACKS_FILE = DATA_DIR + "feedbacks.json";
    private static final String CONFIG_FILE = DATA_DIR + "config.json";

    public static List<User> users = new ArrayList<>();
    public static List<Pharmacy> pharmacies = new ArrayList<>();
    public static List<Rider> riders = new ArrayList<>();
    public static List<Order> orders = new ArrayList<>();
    public static List<Feedback> feedbacks = new ArrayList<>();
    public static SystemConfig config = new SystemConfig();

    public static void loadAll() {
        // Load Users
        String usersJson = JsonUtils.readFile(USERS_FILE);
        users.clear();
        if (!usersJson.isEmpty()) {
            Object parsed = JsonUtils.parse(usersJson);
            if (parsed instanceof List) {
                for (Object item : (List<?>) parsed) {
                    if (item instanceof Map) {
                        users.add(JsonUtils.toUser((Map<String, Object>) item));
                    }
                }
            }
        }

        // Load Pharmacies
        String pharmaciesJson = JsonUtils.readFile(PHARMACIES_FILE);
        pharmacies.clear();
        if (!pharmaciesJson.isEmpty()) {
            Object parsed = JsonUtils.parse(pharmaciesJson);
            if (parsed instanceof List) {
                for (Object item : (List<?>) parsed) {
                    if (item instanceof Map) {
                        pharmacies.add(JsonUtils.toPharmacy((Map<String, Object>) item));
                    }
                }
            }
        }

        // Load Riders
        String ridersJson = JsonUtils.readFile(RIDERS_FILE);
        riders.clear();
        if (!ridersJson.isEmpty()) {
            Object parsed = JsonUtils.parse(ridersJson);
            if (parsed instanceof List) {
                for (Object item : (List<?>) parsed) {
                    if (item instanceof Map) {
                        riders.add(JsonUtils.toRider((Map<String, Object>) item));
                    }
                }
            }
        }

        // Load Orders
        String ordersJson = JsonUtils.readFile(ORDERS_FILE);
        orders.clear();
        if (!ordersJson.isEmpty()) {
            Object parsed = JsonUtils.parse(ordersJson);
            if (parsed instanceof List) {
                for (Object item : (List<?>) parsed) {
                    if (item instanceof Map) {
                        orders.add(JsonUtils.toOrder((Map<String, Object>) item));
                    }
                }
            }
        }

        // Load Feedbacks
        String feedbacksJson = JsonUtils.readFile(FEEDBACKS_FILE);
        feedbacks.clear();
        if (!feedbacksJson.isEmpty()) {
            Object parsed = JsonUtils.parse(feedbacksJson);
            if (parsed instanceof List) {
                for (Object item : (List<?>) parsed) {
                    if (item instanceof Map) {
                        feedbacks.add(JsonUtils.toFeedback((Map<String, Object>) item));
                    }
                }
            }
        }

        // Load SystemConfig
        String configJson = JsonUtils.readFile(CONFIG_FILE);
        if (!configJson.isEmpty()) {
            Object parsed = JsonUtils.parse(configJson);
            if (parsed instanceof Map) {
                config = JsonUtils.toSystemConfig((Map<String, Object>) parsed);
            }
        } else {
            // Default Config values
            config = new SystemConfig(10.0, 5.0, 1.5, 10.0, true, 5.0);
            saveConfig();
        }
    }

    public static void saveUsers() {
        JsonUtils.writeFile(USERS_FILE, JsonUtils.serialize(users));
    }

    public static void savePharmacies() {
        JsonUtils.writeFile(PHARMACIES_FILE, JsonUtils.serialize(pharmacies));
    }

    public static void saveRiders() {
        JsonUtils.writeFile(RIDERS_FILE, JsonUtils.serialize(riders));
    }

    public static void saveOrders() {
        JsonUtils.writeFile(ORDERS_FILE, JsonUtils.serialize(orders));
    }

    public static void saveFeedbacks() {
        JsonUtils.writeFile(FEEDBACKS_FILE, JsonUtils.serialize(feedbacks));
    }

    public static void saveConfig() {
        JsonUtils.writeFile(CONFIG_FILE, JsonUtils.serialize(config));
    }

    public static void saveAll() {
        saveUsers();
        savePharmacies();
        saveRiders();
        saveOrders();
        saveFeedbacks();
        saveConfig();
    }
}
