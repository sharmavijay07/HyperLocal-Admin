package models;

import java.util.ArrayList;
import java.util.List;

public class Pharmacy {
    private String id;
    private String username;
    private String password;
    private String name;
    private String owner;
    private String email;
    private String phone;
    private String license;
    private String address;
    private String status; // "Pending", "Active", "Suspended"
    private double lat;
    private double lng;
    private List<Medicine> medicines;

    public Pharmacy() {
        this.medicines = new ArrayList<>();
    }

    public Pharmacy(String id, String username, String password, String name, String owner, String email, String phone, String license, String address, String status, double lat, double lng) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.name = name;
        this.owner = owner;
        this.email = email;
        this.phone = phone;
        this.license = license;
        this.address = address;
        this.status = status;
        this.lat = lat;
        this.lng = lng;
        this.medicines = new ArrayList<>();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getLicense() { return license; }
    public void setLicense(String license) { this.license = license; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }

    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }

    public List<Medicine> getMedicines() { return medicines; }
    public void setMedicines(List<Medicine> medicines) { this.medicines = medicines; }
}
