package utils;

import models.*;
import java.io.*;
import java.nio.file.*;
import java.util.*;

public class JsonUtils {

    // File IO helpers
    public static String readFile(String filePath) {
        try {
            File file = new File(filePath);
            if (!file.exists()) {
                return "";
            }
            return new String(Files.readAllBytes(Paths.get(filePath)));
        } catch (IOException e) {
            System.err.println("Error reading file " + filePath + ": " + e.getMessage());
            return "";
        }
    }

    public static void writeFile(String filePath, String content) {
        try {
            File file = new File(filePath);
            File parentDir = file.getParentFile();
            if (parentDir != null && !parentDir.exists()) {
                parentDir.mkdirs();
            }
            Files.write(Paths.get(filePath), content.getBytes());
        } catch (IOException e) {
            System.err.println("Error writing file " + filePath + ": " + e.getMessage());
        }
    }

    // Generic serializer using reflection
    public static String serialize(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof String) {
            return "\"" + escapeJson((String) obj) + "\"";
        }
        if (obj instanceof Number || obj instanceof Boolean) {
            return obj.toString();
        }
        if (obj instanceof List) {
            List<?> list = (List<?>) obj;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) {
                if (i > 0) sb.append(",");
                sb.append(serialize(list.get(i)));
            }
            sb.append("]");
            return sb.toString();
        }
        if (obj instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) obj;
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (!first) sb.append(",");
                first = false;
                sb.append("\"").append(entry.getKey()).append("\":").append(serialize(entry.getValue()));
            }
            sb.append("}");
            return sb.toString();
        }
        
        // Custom object reflection
        try {
            StringBuilder sb = new StringBuilder("{");
            java.lang.reflect.Field[] fields = obj.getClass().getDeclaredFields();
            boolean first = true;
            for (java.lang.reflect.Field field : fields) {
                field.setAccessible(true);
                Object value = field.get(obj);
                if (!first) sb.append(",");
                first = false;
                sb.append("\"").append(field.getName()).append("\":").append(serialize(value));
            }
            sb.append("}");
            return sb.toString();
        } catch (Exception e) {
            return "{}";
        }
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            switch (ch) {
                case '"': sb.append("\\\""); break;
                case '\\': sb.append("\\\\"); break;
                case '\b': sb.append("\\b"); break;
                case '\f': sb.append("\\f"); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (ch < 0x20) {
                        String ss = Integer.toHexString(ch);
                        sb.append("\\u");
                        for (int k = 0; k < 4 - ss.length(); k++) sb.append('0');
                        sb.append(ss.toUpperCase());
                    } else {
                        sb.append(ch);
                    }
            }
        }
        return sb.toString();
    }

    // Parser entry point
    public static Object parse(String json) {
        if (json == null || json.trim().isEmpty()) return null;
        return new Parser(json.trim()).parseValue();
    }

    // Converters to convert parsed Map/List structures into rich Model instances
    public static User toUser(Map<String, Object> map) {
        if (map == null) return null;
        User u = new User();
        u.setId((String) map.get("id"));
        u.setUsername((String) map.get("username"));
        u.setPassword((String) map.get("password"));
        u.setName((String) map.get("name"));
        u.setEmail((String) map.get("email"));
        u.setPhone((String) map.get("phone"));
        u.setStatus((String) map.get("status"));
        List<Object> addrs = (List<Object>) map.get("addresses");
        if (addrs != null) {
            for (Object addr : addrs) {
                u.getAddresses().add((String) addr);
            }
        }
        return u;
    }

    public static Pharmacy toPharmacy(Map<String, Object> map) {
        if (map == null) return null;
        Pharmacy p = new Pharmacy();
        p.setId((String) map.get("id"));
        p.setUsername((String) map.get("username"));
        p.setPassword((String) map.get("password"));
        p.setName((String) map.get("name"));
        p.setOwner((String) map.get("owner"));
        p.setEmail((String) map.get("email"));
        p.setPhone((String) map.get("phone"));
        p.setLicense((String) map.get("license"));
        p.setAddress((String) map.get("address"));
        p.setStatus((String) map.get("status"));
        p.setLat(toDouble(map.get("lat")));
        p.setLng(toDouble(map.get("lng")));
        
        List<Object> meds = (List<Object>) map.get("medicines");
        if (meds != null) {
            for (Object med : meds) {
                p.getMedicines().add(toMedicine((Map<String, Object>) med));
            }
        }
        return p;
    }

    public static Rider toRider(Map<String, Object> map) {
        if (map == null) return null;
        Rider r = new Rider();
        r.setId((String) map.get("id"));
        r.setUsername((String) map.get("username"));
        r.setPassword((String) map.get("password"));
        r.setName((String) map.get("name"));
        r.setEmail((String) map.get("email"));
        r.setPhone((String) map.get("phone"));
        r.setVehicleType((String) map.get("vehicleType"));
        r.setVehicleNumber((String) map.get("vehicleNumber"));
        r.setStatus((String) map.get("status"));
        r.setAadhaar((String) map.get("aadhaar"));
        r.setLicenseNo((String) map.get("licenseNo"));
        r.setBikePapers((String) map.get("bikePapers"));
        r.setLat(toDouble(map.get("lat")));
        r.setLng(toDouble(map.get("lng")));
        r.setAvailability(toBoolean(map.get("availability")));
        r.setEarnings(toDouble(map.get("earnings")));
        r.setCredits(toDouble(map.get("credits")));
        return r;
    }

    public static Medicine toMedicine(Map<String, Object> map) {
        if (map == null) return null;
        Medicine m = new Medicine();
        m.setId((String) map.get("id"));
        m.setName((String) map.get("name"));
        m.setDescription((String) map.get("description"));
        m.setPrice(toDouble(map.get("price")));
        m.setExpiryDate((String) map.get("expiryDate"));
        m.setQuantity(toInt(map.get("quantity")));
        m.setMfgDate((String) map.get("mfgDate"));
        m.setComposition((String) map.get("composition"));
        m.setCategory((String) map.get("category"));
        m.setImagePath((String) map.get("imagePath"));
        m.setPharmacyId((String) map.get("pharmacyId"));
        return m;
    }

    public static Order toOrder(Map<String, Object> map) {
        if (map == null) return null;
        Order o = new Order();
        o.setId((String) map.get("id"));
        o.setCustomerId((String) map.get("customerId"));
        o.setCustomerName((String) map.get("customerName"));
        o.setCustomerPhone((String) map.get("customerPhone"));
        o.setPharmacyId((String) map.get("pharmacyId"));
        o.setPharmacyName((String) map.get("pharmacyName"));
        o.setRiderId((String) map.get("riderId"));
        o.setRiderName((String) map.get("riderName"));
        o.setStatus((String) map.get("status"));
        o.setTotal(toDouble(map.get("total")));
        o.setOrderTime((String) map.get("orderTime"));
        o.setEta(toInt(map.get("eta")));
        o.setAddress((String) map.get("address"));
        o.setPaymentMethod((String) map.get("paymentMethod"));
        o.setRiskScore((String) map.get("riskScore"));
        o.setRiskReason((String) map.get("riskReason"));
        o.setCustomerNote((String) map.get("customerNote"));
        o.setOtp((String) map.get("otp"));
        o.setOtpValidated(toBoolean(map.get("otpValidated")));
        
        List<Object> items = (List<Object>) map.get("items");
        if (items != null) {
            for (Object item : items) {
                o.getItems().add(toOrderItem((Map<String, Object>) item));
            }
        }
        return o;
    }

    public static Order.OrderItem toOrderItem(Map<String, Object> map) {
        if (map == null) return null;
        Order.OrderItem oi = new Order.OrderItem();
        oi.setMedicineId((String) map.get("medicineId"));
        oi.setName((String) map.get("name"));
        oi.setQty(toInt(map.get("qty")));
        oi.setPrice(toDouble(map.get("price")));
        return oi;
    }

    public static Feedback toFeedback(Map<String, Object> map) {
        if (map == null) return null;
        Feedback f = new Feedback();
        f.setId((String) map.get("id"));
        f.setOrderId((String) map.get("orderId"));
        f.setCustomerId((String) map.get("customerId"));
        f.setCustomerName((String) map.get("customerName"));
        f.setPharmacyId((String) map.get("pharmacyId"));
        f.setPharmacyName((String) map.get("pharmacyName"));
        f.setRiderId((String) map.get("riderId"));
        f.setRiderName((String) map.get("riderName"));
        f.setPharmacyRating(toInt(map.get("pharmacyRating")));
        f.setRiderRating(toInt(map.get("riderRating")));
        f.setOverallRating(toInt(map.get("overallRating")));
        f.setComments((String) map.get("comments"));
        f.setDate((String) map.get("date"));
        return f;
    }

    public static SystemConfig toSystemConfig(Map<String, Object> map) {
        if (map == null) return null;
        SystemConfig sc = new SystemConfig();
        sc.setDeliveryRadius(toDouble(map.get("deliveryRadius")));
        sc.setBaseDeliveryCharge(toDouble(map.get("baseDeliveryCharge")));
        sc.setChargePerKm(toDouble(map.get("chargePerKm")));
        sc.setCommissionRate(toDouble(map.get("commissionRate")));
        sc.setAutoAssignRiders(toBoolean(map.get("autoAssignRiders")));
        sc.setMaxRiderDistance(toDouble(map.get("maxRiderDistance")));
        return sc;
    }

    // Helper conversion functions to prevent class cast exceptions
    private static double toDouble(Object o) {
        if (o == null) return 0.0;
        if (o instanceof Number) return ((Number) o).doubleValue();
        try { return Double.parseDouble(o.toString()); } catch (Exception e) { return 0.0; }
    }

    private static int toInt(Object o) {
        if (o == null) return 0;
        if (o instanceof Number) return ((Number) o).intValue();
        try { return Integer.parseInt(o.toString()); } catch (Exception e) { return 0; }
    }

    private static boolean toBoolean(Object o) {
        if (o == null) return false;
        if (o instanceof Boolean) return (Boolean) o;
        return Boolean.parseBoolean(o.toString());
    }

    // Token-based parser implementation
    private static class Parser {
        private final String json;
        private int pos = 0;

        public Parser(String json) {
            this.json = json;
        }

        private void skipWhitespace() {
            while (pos < json.length() && Character.isWhitespace(json.charAt(pos))) {
                pos++;
            }
        }

        public Object parseValue() {
            skipWhitespace();
            if (pos >= json.length()) return null;
            char c = json.charAt(pos);
            if (c == '{') return parseObject();
            if (c == '[') return parseArray();
            if (c == '"') return parseString();
            if (c == 't' || c == 'f') return parseBoolean();
            if (c == 'n') return parseNull();
            if (Character.isDigit(c) || c == '-') return parseNumber();
            throw new RuntimeException("Unexpected character: " + c + " at position " + pos);
        }

        private Map<String, Object> parseObject() {
            pos++; // skip '{'
            Map<String, Object> map = new LinkedHashMap<>();
            skipWhitespace();
            if (pos < json.length() && json.charAt(pos) == '}') {
                pos++; // skip '}'
                return map;
            }
            while (true) {
                skipWhitespace();
                if (pos >= json.length() || json.charAt(pos) != '"') {
                    throw new RuntimeException("Expected string key in object at " + pos);
                }
                String key = parseString();
                skipWhitespace();
                if (pos >= json.length() || json.charAt(pos) != ':') {
                    throw new RuntimeException("Expected ':' after key at " + pos);
                }
                pos++; // skip ':'
                Object val = parseValue();
                map.put(key, val);
                skipWhitespace();
                if (pos >= json.length()) {
                    throw new RuntimeException("Unterminated object");
                }
                char next = json.charAt(pos);
                if (next == '}') {
                    pos++; // skip '}'
                    break;
                } else if (next == ',') {
                    pos++; // skip ','
                } else {
                    throw new RuntimeException("Expected ',' or '}' in object at " + pos);
                }
            }
            return map;
        }

        private List<Object> parseArray() {
            pos++; // skip '['
            List<Object> list = new ArrayList<>();
            skipWhitespace();
            if (pos < json.length() && json.charAt(pos) == ']') {
                pos++; // skip ']'
                return list;
            }
            while (true) {
                Object val = parseValue();
                list.add(val);
                skipWhitespace();
                if (pos >= json.length()) {
                    throw new RuntimeException("Unterminated array");
                }
                char next = json.charAt(pos);
                if (next == ']') {
                    pos++; // skip ']'
                    break;
                } else if (next == ',') {
                    pos++; // skip ','
                } else {
                    throw new RuntimeException("Expected ',' or ']' in array at " + pos);
                }
            }
            return list;
        }

        private String parseString() {
            pos++; // skip '"'
            StringBuilder sb = new StringBuilder();
            while (pos < json.length()) {
                char c = json.charAt(pos);
                if (c == '"') {
                    pos++; // skip '"'
                    return sb.toString();
                }
                if (c == '\\') {
                    pos++;
                    if (pos >= json.length()) throw new RuntimeException("Unterminated escape sequence");
                    char escape = json.charAt(pos);
                    if (escape == '"') sb.append('"');
                    else if (escape == '\\') sb.append('\\');
                    else if (escape == '/') sb.append('/');
                    else if (escape == 'b') sb.append('\b');
                    else if (escape == 'f') sb.append('\f');
                    else if (escape == 'n') sb.append('\n');
                    else if (escape == 'r') sb.append('\r');
                    else if (escape == 't') sb.append('\t');
                    else sb.append(escape); // fallback
                } else {
                    sb.append(c);
                }
                pos++;
            }
            throw new RuntimeException("Unterminated string");
        }

        private Boolean parseBoolean() {
            if (json.startsWith("true", pos)) {
                pos += 4;
                return true;
            }
            if (json.startsWith("false", pos)) {
                pos += 5;
                return false;
            }
            throw new RuntimeException("Expected boolean at " + pos);
        }

        private Object parseNull() {
            if (json.startsWith("null", pos)) {
                pos += 4;
                return null;
            }
            throw new RuntimeException("Expected null at " + pos);
        }

        private Number parseNumber() {
            int start = pos;
            if (pos < json.length() && json.charAt(pos) == '-') pos++;
            boolean isDouble = false;
            while (pos < json.length()) {
                char c = json.charAt(pos);
                if (Character.isDigit(c)) {
                    pos++;
                } else if (c == '.' || c == 'e' || c == 'E' || c == '+' || c == '-') {
                    isDouble = true;
                    pos++;
                } else {
                    break;
                }
            }
            String numStr = json.substring(start, pos);
            if (isDouble) {
                return Double.parseDouble(numStr);
            } else {
                try {
                    return Integer.parseInt(numStr);
                } catch (NumberFormatException e) {
                    return Long.parseLong(numStr);
                }
            }
        }
    }
}
