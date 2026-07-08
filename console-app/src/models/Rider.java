package models;

public class Rider {
    private String id;
    private String username;
    private String password;
    private String name;
    private String email;
    private String phone;
    private String vehicleType;
    private String vehicleNumber;
    private String status; // "Pending", "Active", "Suspended"
    private String aadhaar;
    private String licenseNo;
    private String bikePapers;
    private double lat;
    private double lng;
    private boolean availability;
    private double earnings;
    private double credits; // Rider credit points system

    public Rider() {}

    public Rider(String id, String username, String password, String name, String email, String phone, String vehicleType, String vehicleNumber, String status, String aadhaar, String licenseNo, String bikePapers, double lat, double lng, boolean availability, double earnings, double credits) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.vehicleType = vehicleType;
        this.vehicleNumber = vehicleNumber;
        this.status = status;
        this.aadhaar = aadhaar;
        this.licenseNo = licenseNo;
        this.bikePapers = bikePapers;
        this.lat = lat;
        this.lng = lng;
        this.availability = availability;
        this.earnings = earnings;
        this.credits = credits;
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

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAadhaar() { return aadhaar; }
    public void setAadhaar(String aadhaar) { this.aadhaar = aadhaar; }

    public String getLicenseNo() { return licenseNo; }
    public void setLicenseNo(String licenseNo) { this.licenseNo = licenseNo; }

    public String getBikePapers() { return bikePapers; }
    public void setBikePapers(String bikePapers) { this.bikePapers = bikePapers; }

    public double getLat() { return lat; }
    public void setLat(double lat) { this.lat = lat; }

    public double getLng() { return lng; }
    public void setLng(double lng) { this.lng = lng; }

    public boolean isAvailability() { return availability; }
    public void setAvailability(boolean availability) { this.availability = availability; }

    public double getEarnings() { return earnings; }
    public void setEarnings(double earnings) { this.earnings = earnings; }

    public double getCredits() { return credits; }
    public void setCredits(double credits) { this.credits = credits; }
}
