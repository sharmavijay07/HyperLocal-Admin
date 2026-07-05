/* Storage Management Module */

const AppStorage = {
    // Embedded fallback data for file:// protocol or fetch failures
    fallbackData: {
        pharmacies: [
            {
                id: "PH-001",
                name: "Care Pharmacy",
                owner: "Dr. Sarah Jenkins",
                email: "sarah.j@carepharmacy.com",
                phone: "+1 (555) 019-2834",
                license: "LIC-2023-88912",
                address: "742 Evergreen Terrace, Springfield",
                city: "Springfield",
                status: "Active",
                verification: "Verified",
                rating: 4.8,
                ordersCompleted: 1240,
                revenue: 18600.50,
                lat: 37.7749,
                lng: -122.4194,
                joinedDate: "2023-05-12"
            },
            {
                id: "PH-002",
                name: "Apex Meds",
                owner: "Robert Chen",
                email: "contact@apexmeds.com",
                phone: "+1 (555) 014-9982",
                license: "LIC-2024-11029",
                address: "555 Market St, San Francisco",
                city: "San Francisco",
                status: "Active",
                verification: "Verified",
                rating: 4.6,
                ordersCompleted: 850,
                revenue: 12750.00,
                lat: 37.7894,
                lng: -122.4014,
                joinedDate: "2024-01-15"
            },
            {
                id: "PH-003",
                name: "Wellness Drugstore",
                owner: "Emily Rodriguez",
                email: "emily@wellnessdrug.com",
                phone: "+1 (555) 017-3341",
                license: "LIC-2023-44512",
                address: "1202 Valencia St, San Francisco",
                city: "San Francisco",
                status: "Pending",
                verification: "Pending",
                rating: 0.0,
                ordersCompleted: 0,
                revenue: 0.00,
                lat: 37.7522,
                lng: -122.4215,
                joinedDate: "2026-07-01"
            },
            {
                id: "PH-004",
                name: "Metro Pharmacy",
                owner: "Marcus Vance",
                email: "marcus@metropharm.com",
                phone: "+1 (555) 012-7761",
                license: "LIC-2022-99012",
                address: "890 Broadway, New York",
                city: "New York",
                status: "Suspended",
                verification: "Verified",
                rating: 4.2,
                ordersCompleted: 2100,
                revenue: 31500.00,
                lat: 40.7306,
                lng: -73.9352,
                joinedDate: "2022-09-10"
            },
            {
                id: "PH-005",
                name: "Green Cross Pharmacy",
                owner: "Lisa Sterling",
                email: "lisa@greencross.com",
                phone: "+1 (555) 015-4432",
                license: "LIC-2026-00123",
                address: "456 Oak Ave, Springfield",
                city: "Springfield",
                status: "Pending",
                verification: "Pending",
                rating: 0.0,
                ordersCompleted: 0,
                revenue: 0.00,
                lat: 37.7750,
                lng: -122.4180,
                joinedDate: "2026-07-03"
            }
        ],
        riders: [
            {
                id: "RD-001",
                name: "Alex Rivera",
                email: "alex.r@medeasy-rider.com",
                phone: "+1 (555) 019-5543",
                "vehicleType": "Motorcycle",
                "vehicleNumber": "MC-2023-NY",
                status: "Active",
                verification: "Verified",
                rating: 4.9,
                ordersCompleted: 342,
                earnings: 1710.00,
                lat: 37.7749,
                lng: -122.4194,
                joinedDate: "2024-02-10",
                documents: {
                    license: "Verified",
                    backgroundCheck: "Verified",
                    insurance: "Verified"
                }
            },
            {
                id: "RD-002",
                name: "Jordan Smith",
                email: "jordan.s@medeasy-rider.com",
                phone: "+1 (555) 011-2233",
                "vehicleType": "E-Bike",
                "vehicleNumber": "EB-9982-SF",
                status: "Active",
                verification: "Verified",
                rating: 4.7,
                ordersCompleted: 188,
                earnings: 940.00,
                lat: 37.7894,
                lng: -122.4014,
                joinedDate: "2024-04-18",
                documents: {
                    license: "Verified",
                    backgroundCheck: "Verified",
                    insurance: "Verified"
                }
            },
            {
                id: "RD-003",
                name: "Taylor Brooks",
                email: "taylor.b@medeasy-rider.com",
                phone: "+1 (555) 018-4455",
                "vehicleType": "Bicycle",
                "vehicleNumber": "N/A",
                status: "Pending",
                verification: "Pending",
                rating: 0.0,
                ordersCompleted: 0,
                earnings: 0.00,
                lat: 37.7522,
                lng: -122.4215,
                joinedDate: "2026-07-02",
                documents: {
                    license: "Pending",
                    backgroundCheck: "Pending",
                    insurance: "N/A"
                }
            },
            {
                id: "RD-004",
                name: "Morgan Lee",
                email: "morgan.l@medeasy-rider.com",
                phone: "+1 (555) 012-8899",
                "vehicleType": "Motorcycle",
                "vehicleNumber": "MC-8812-NY",
                status: "Suspended",
                verification: "Verified",
                rating: 4.1,
                ordersCompleted: 520,
                earnings: 2600.00,
                lat: 40.7306,
                lng: -73.9352,
                joinedDate: "2023-08-15",
                documents: {
                    license: "Verified",
                    backgroundCheck: "Verified",
                    insurance: "Expired"
                }
            },
            {
                id: "RD-005",
                name: "Casey Hunt",
                email: "casey.h@medeasy-rider.com",
                phone: "+1 (555) 015-6677",
                "vehicleType": "E-Bike",
                "vehicleNumber": "EB-1234-SF",
                status: "Pending",
                verification: "Pending",
                rating: 0.0,
                ordersCompleted: 0,
                earnings: 0.00,
                lat: 37.7750,
                lng: -122.4180,
                joinedDate: "2026-07-03",
                documents: {
                    license: "Verified",
                    backgroundCheck: "Pending",
                    insurance: "Verified"
                }
            }
        ],
        orders: [
            {
                id: "ORD-1001",
                "customerName": "Alice Johnson",
                "customerPhone": "+1 (555) 019-1122",
                "pharmacyId": "PH-001",
                "pharmacyName": "Care Pharmacy",
                "riderId": "RD-001",
                "riderName": "Alex Rivera",
                "status": "Out for Delivery",
                "total": 45.50,
                "items": [
                    {
                        "name": "Amoxicillin 500mg",
                        "qty": 1,
                        "price": 15.50
                    },
                    {
                        "name": "Paracetamol 500mg",
                        "qty": 2,
                        "price": 15.00
                    }
                ],
                "orderTime": "2026-07-04T22:15:00Z",
                "eta": "22:45",
                "address": "123 Maple St, Springfield",
                "paymentMethod": "Card",
                "riskScore": "Low",
                "riskReason": "Normal order pattern"
            },
            {
                id: "ORD-1002",
                "customerName": "Bob Miller",
                "customerPhone": "+1 (555) 012-3344",
                "pharmacyId": "PH-002",
                "pharmacyName": "Apex Meds",
                "riderId": "RD-002",
                "riderName": "Jordan Smith",
                "status": "Preparing",
                "total": 120.00,
                "items": [
                    {
                        "name": "Insulin Glargine 100 U/mL",
                        "qty": 2,
                        "price": 60.00
                    }
                ],
                "orderTime": "2026-07-04T22:30:00Z",
                "eta": "23:05",
                "address": "789 Pine Ave, San Francisco",
                "paymentMethod": "Wallet",
                "riskScore": "Low",
                "riskReason": "Normal order pattern"
            },
            {
                id: "ORD-1003",
                "customerName": "Charlie Davis",
                "customerPhone": "+1 (555) 015-5566",
                "pharmacyId": "PH-001",
                "pharmacyName": "Care Pharmacy",
                "riderId": null,
                "riderName": null,
                "status": "Pending",
                "total": 35.00,
                "items": [
                    {
                        "name": "Ibuprofen 400mg",
                        "qty": 3,
                        "price": 11.66
                    }
                ],
                "orderTime": "2026-07-04T22:40:00Z",
                "eta": "23:20",
                "address": "456 Elm St, Springfield",
                "paymentMethod": "Cash",
                "riskScore": "Medium",
                "riskReason": "New customer paying cash"
            },
            {
                id: "ORD-1004",
                "customerName": "Diana Prince",
                "customerPhone": "+1 (555) 017-7788",
                "pharmacyId": "PH-004",
                "pharmacyName": "Metro Pharmacy",
                "riderId": "RD-004",
                "riderName": "Morgan Lee",
                "status": "Delivered",
                "total": 250.00,
                "items": [
                    {
                        "name": "Oxycodone 10mg",
                        "qty": 5,
                        "price": 50.00
                    }
                ],
                "orderTime": "2026-07-04T20:00:00Z",
                "eta": "20:35",
                "address": "1001 Broadway, New York",
                "paymentMethod": "Card",
                "riskScore": "High",
                "riskReason": "High quantity of controlled substance"
            },
            {
                id: "ORD-1005",
                "customerName": "Ethan Hunt",
                "customerPhone": "+1 (555) 018-8899",
                "pharmacyId": "PH-002",
                "pharmacyName": "Apex Meds",
                "riderId": null,
                "riderName": null,
                "status": "Accepted",
                "total": 85.00,
                "items": [
                    {
                        "name": "Lipitor 20mg",
                        "qty": 1,
                        "price": 85.00
                    }
                ],
                "orderTime": "2026-07-04T22:38:00Z",
                "eta": "23:10",
                "address": "222 Mission St, San Francisco",
                "paymentMethod": "Card",
                "riskScore": "Low",
                "riskReason": "Normal order pattern"
            }
        ],
        customers: [
            {
                id: "CUST-001",
                name: "Alice Johnson",
                email: "alice.j@example.com",
                "phone": "+1 (555) 019-1122",
                "address": "123 Maple St, Springfield",
                "status": "Active"
            },
            {
                id: "CUST-002",
                name: "Bob Miller",
                email: "bob.m@example.com",
                "phone": "+1 (555) 012-3344",
                "address": "789 Pine Ave, San Francisco",
                "status": "Active"
            },
            {
                id: "CUST-003",
                name: "Charlie Davis",
                email: "charlie.d@example.com",
                "phone": "+1 (555) 015-5566",
                "address": "456 Elm St, Springfield",
                "status": "Active"
            },
            {
                id: "CUST-004",
                name: "Diana Prince",
                email: "diana.p@example.com",
                "phone": "+1 (555) 017-7788",
                "address": "1001 Broadway, New York",
                "status": "Active"
            },
            {
                id: "CUST-005",
                name: "Ethan Hunt",
                email: "ethan.h@example.com",
                "phone": "+1 (555) 018-8899",
                "address": "222 Mission St, San Francisco",
                "status": "Active"
            }
        ],
        analytics: {
            kpis: {
                totalOrders: 4520,
                activeRiders: 48,
                activePharmacies: 32,
                totalRevenue: 67800.50,
                avgDeliveryTime: 24.5,
                completionRate: 98.2
            },
            revenueTrend: [
                { date: "2026-06-28", revenue: 8200 },
                { date: "2026-06-29", revenue: 9100 },
                { date: "2026-06-30", revenue: 8800 },
                { date: "2026-07-01", revenue: 9500 },
                { date: "2026-07-02", revenue: 10200 },
                { date: "2026-07-03", revenue: 11000 },
                { date: "2026-07-04", revenue: 12000 }
            ],
            orderTrend: [
                { date: "2026-06-28", orders: 520 },
                { date: "2026-06-29", orders: 580 },
                { date: "2026-06-30", orders: 550 },
                { date: "2026-07-01", orders: 610 },
                { date: "2026-07-02", orders: 640 },
                { date: "2026-07-03", orders: 690 },
                { date: "2026-07-04", orders: 750 }
            ],
            topPharmacies: [
                { name: "Care Pharmacy", orders: 1240, revenue: 18600.50 },
                { name: "Apex Meds", orders: 850, revenue: 12750.00 },
                { name: "Metro Pharmacy", orders: 2100, revenue: 31500.00 }
            ],
            riderStatus: {
                online: 35,
                busy: 10,
                offline: 3
            }
        },
        notifications: [
            {
                id: "NT-001",
                "title": "Scheduled System Maintenance",
                "message": "The MedEasy Admin Portal will undergo scheduled maintenance on July 10, 2026, from 02:00 to 04:00 UTC. Some services may be temporarily unavailable.",
                "target": "All",
                type: "System",
                dateSent: "2026-07-04T12:00:00Z",
                "sentBy": "System Admin"
            },
            {
                id: "NT-002",
                "title": "New Rider Bonus Program",
                "message": "Earn an extra $2 per delivery during peak hours (18:00 - 21:00) this weekend! Check the rider app for details.",
                target: "Riders",
                type: "Promotion",
                dateSent: "2026-07-03T15:30:00Z",
                "sentBy": "Marketing Admin"
            },
            {
                id: "NT-003",
                "title": "Updated Narcotics Dispensing Guidelines",
                "message": "Please review the updated compliance guidelines for dispensing controlled substances. Verification of prescription is mandatory before handoff.",
                "target": "Pharmacies",
                type: "Warning",
                dateSent: "2026-07-02T09:15:00Z",
                "sentBy": "Compliance Officer"
            }
        ]
    },

    // Initialize storage
    async init() {
        const keys = ['pharmacies', 'riders', 'orders', 'customers', 'analytics', 'notifications'];
        const fileNames = {
            pharmacies: 'pharmacies',
            riders: 'riders',
            orders: 'orders',
            customers: 'users', // Fetch from users.json on disk
            analytics: 'analytics',
            notifications: 'notifications'
        };

        // Check if running under file:// protocol
        const isFileProtocol = window.location.protocol === 'file:';

        for (const key of keys) {
            if (!localStorage.getItem(key)) {
                if (isFileProtocol) {
                    // Fallback directly to embedded data
                    localStorage.setItem(key, JSON.stringify(this.fallbackData[key]));
                } else {
                    try {
                        const response = await fetch(`./data/${fileNames[key]}.json`);
                        if (response.ok) {
                            const data = await response.json();
                            localStorage.setItem(key, JSON.stringify(data));
                        } else {
                            localStorage.setItem(key, JSON.stringify(this.fallbackData[key]));
                        }
                    } catch (e) {
                        console.error(`Error loading ${key} data, using fallback:`, e);
                        localStorage.setItem(key, JSON.stringify(this.fallbackData[key]));
                    }
                }
            }
        }

        // Initialize configuration settings if not present
        if (!localStorage.getItem('settings')) {
            const defaultSettings = {
                deliveryRadius: 5.0, // km
                baseDeliveryCharge: 2.50, // $
                chargePerKm: 0.50, // $
                commissionRate: 10.0, // %
                autoAssignRiders: true,
                maxRiderDistance: 3.0 // km
            };
            localStorage.setItem('settings', JSON.stringify(defaultSettings));
        }

        // Initialize audit logs if not present
        if (!localStorage.getItem('audit_logs')) {
            localStorage.setItem('audit_logs', JSON.stringify([]));
        }
    },

    // Get data from localStorage
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    // Save data to localStorage
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    // Add an item to a list in localStorage
    addToList(key, item) {
        const list = this.get(key) || [];
        list.unshift(item); // Add to the beginning of the list
        this.set(key, list);
        return list;
    },

    // Update an item in a list in localStorage by ID
    updateInList(key, id, updatedFields) {
        const list = this.get(key) || [];
        const index = list.findIndex(item => item.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...updatedFields };
            this.set(key, list);
            return true;
        }
        return false;
    },

    // Delete an item from a list in localStorage by ID
    deleteFromList(key, id) {
        let list = this.get(key) || [];
        list = list.filter(item => item.id !== id);
        this.set(key, list);
        return list;
    },

    // Log a system action to audit logs
    logAction(action, details, user = 'Admin') {
        const logs = this.get('audit_logs') || [];
        const newLog = {
            id: 'LOG-' + Date.now(),
            timestamp: new Date().toISOString(),
            action,
            details,
            user
        };
        logs.unshift(newLog);
        this.set('audit_logs', logs.slice(0, 100)); // Keep last 100 logs
    }
};

// Export to window object for global access
window.AppStorage = AppStorage;
