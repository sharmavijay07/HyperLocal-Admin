package utils;

public class LocationUtils {

    // Haversine formula to compute distance in kilometers between two coords
    public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the Earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Dynamic ETA calculation considering distance and rider availability
    // preparation time is standard 10 mins, speed is average 30 km/h
    public static int calculateETA(double distance) {
        int prepTime = 10; // 10 minutes prep time at pharmacy
        double speed = 30.0; // 30 km/h average speed in city
        double travelTimeHours = distance / speed;
        int travelTimeMins = (int) Math.round(travelTimeHours * 60);
        return prepTime + travelTimeMins;
    }

    // ASCII routing map illustration
    public static String generateRouteMap(double plat, double plng, double ulat, double ulng) {
        StringBuilder sb = new StringBuilder();
        sb.append("\n================ LIVE ROUTE GUIDANCE MAP =================\n");
        
        // Define a simple 5x10 grid layout
        char[][] grid = new char[5][15];
        for (int r = 0; r < 5; r++) {
            for (int c = 0; c < 15; c++) {
                grid[r][c] = '.';
            }
        }

        // Place Pharmacy 'P' at index (1, 2)
        grid[1][2] = 'P';
        // Place User 'U' at index (3, 12)
        grid[3][12] = 'U';

        // Draw a path '+' from P to U
        // horizontally from 2 to 12
        for (int c = 3; c <= 12; c++) {
            if (grid[1][c] == '.') grid[1][c] = '-';
        }
        // vertically from 1 to 3 at col 12
        for (int r = 2; r <= 2; r++) {
            if (grid[r][12] == '.') grid[r][12] = '|';
        }
        grid[2][12] = '|';

        // Print Grid
        for (int r = 0; r < 5; r++) {
            sb.append("   ");
            for (int c = 0; c < 15; c++) {
                sb.append(grid[r][c]).append(" ");
            }
            sb.append("\n");
        }
        
        sb.append("   Legend: P = Pharmacy, U = Customer, -/| = Route Path\n");
        sb.append("   Route Distance: ").append(String.format("%.2f km", calculateDistance(plat, plng, ulat, ulng))).append("\n");
        sb.append("==========================================================\n");
        return sb.toString();
    }
}
