package models;

public class Medicine {
    private String id;
    private String name;
    private String description;
    private double price;
    private String expiryDate; // "YYYY-MM-DD"
    private int quantity;
    private String mfgDate;    // "YYYY-MM-DD"
    private String composition;
    private String category;
    private String imagePath;
    private String pharmacyId;

    public Medicine() {}

    public Medicine(String id, String name, String description, double price, String expiryDate, int quantity, String mfgDate, String composition, String category, String imagePath, String pharmacyId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.expiryDate = expiryDate;
        this.quantity = quantity;
        this.mfgDate = mfgDate;
        this.composition = composition;
        this.category = category;
        this.imagePath = imagePath;
        this.pharmacyId = pharmacyId;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getMfgDate() { return mfgDate; }
    public void setMfgDate(String mfgDate) { this.mfgDate = mfgDate; }

    public String getComposition() { return composition; }
    public void setComposition(String composition) { this.composition = composition; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }

    public String getPharmacyId() { return pharmacyId; }
    public void setPharmacyId(String pharmacyId) { this.pharmacyId = pharmacyId; }
}
