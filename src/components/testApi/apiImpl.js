// testApi/apiImpl.js - MOCK DATA IMPLEMENTATION

// Global mock data store
const mockVehiclesData = {};
let currentMockVehicleIndex = 0; // To simulate unique data per vehicle

// Helper to generate a random coordinate near a given center
const getRandomCoordinate = (centerLon, centerLat, range = 0.005) => {
    return [
        centerLon + (Math.random() - 0.5) * range,
        centerLat + (Math.random() - 0.5) * range
    ];
};

const mockApiImpl = {
    /**
     * Simulates fetching all POIs (for ShowMarker component, though not used in StartRunning)
     */
    getAllPois: async () => {
        console.log("Mock API: Fetching all POIs...");
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    code: 200,
                    data: [
                        { id: 'poi1', poi_name: 'Mock University', poi_type: 'Education', poi_lon: 104.066874, poi_lat: 30.574697 },
                        { id: 'poi2', poi_name: 'Mock Hospital', poi_type: 'Healthcare', poi_lon: 104.073401, poi_lat: 30.663189 },
                        { id: 'poi3', poi_name: 'Mock Factory A', poi_type: 'Industry', poi_lon: 104.065187, poi_lat: 30.657502 },
                        { id: 'poi4', poi_name: 'Mock Shopping Mall', poi_type: 'Retail', poi_lon: 104.079203, poi_lat: 30.669862 },
                    ]
                });
            }, 300);
        });
    },

    /**
     * Simulates dispatching a vehicle, returning initial origin and destination.
     * Stores the vehicle's initial state in `mockVehiclesData`.
     * @param {string} vehicleKey - Unique identifier for the vehicle.
     */
    createVehicle: async (vehicleKey) => {
        console.log(`Mock API: Dispatching vehicle ${vehicleKey}...`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (mockVehiclesData[vehicleKey]) {
                    reject(new Error("Vehicle already exists in mock data!"));
                    return;
                }

                const originLon = 104.066874 + currentMockVehicleIndex * 0.001;
                const originLat = 30.574697 + currentMockVehicleIndex * 0.001;
                const destLon = 104.079203 - currentMockVehicleIndex * 0.001;
                const destLat = 30.669862 - currentMockVehicleIndex * 0.001;

                mockVehiclesData[vehicleKey] = {
                    origin: { lon: originLon, lat: originLat },
                    destination: { lon: destLon, lat: destLat },
                    currentPosition: { lon: originLon, lat: originLat },
                    pathProgress: 0, // 0 to 1, for simulating movement
                    status: "moving",
                    mockId: currentMockVehicleIndex // Assign a mock ID for internal simulation
                };
                currentMockVehicleIndex++;

                resolve({
                    code: 200,
                    data: {
                        origin: mockVehiclesData[vehicleKey].origin,
                        destination: mockVehiclesData[vehicleKey].destination,
                        vehicle: { status: "moving" }
                    }
                });
            }, 500);
        });
    },

    /**
     * Simulates getting a vehicle's status and position update.
     * The position moves gradually towards the destination.
     * @param {string} vehicleKey - Unique identifier for the vehicle.
     */
    getVehicleStatus: async (vehicleKey) => {
        // console.log(`Mock API: Getting status for ${vehicleKey}...`); // Too verbose
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const vehicle = mockVehiclesData[vehicleKey];
                if (!vehicle) {
                    reject(new Error(`Vehicle ${vehicleKey} not found.`));
                    return;
                }

                if (vehicle.status === "exit") {
                    resolve({
                        code: 200,
                        data: {
                            position: [vehicle.destination.lon, vehicle.destination.lat],
                            destination: [vehicle.destination.lon, vehicle.destination.lat],
                            status: "exit"
                        }
                    });
                    return;
                }

                // Simulate movement
                const progressIncrement = 0.05; // Move 5% closer each time
                vehicle.pathProgress += progressIncrement;

                if (vehicle.pathProgress >= 1) {
                    vehicle.pathProgress = 1;
                    vehicle.status = "exit";
                    vehicle.currentPosition = vehicle.destination;
                } else {
                    const currentLon = vehicle.origin.lon + (vehicle.destination.lon - vehicle.origin.lon) * vehicle.pathProgress;
                    const currentLat = vehicle.origin.lat + (vehicle.destination.lat - vehicle.origin.lat) * vehicle.pathProgress;
                    vehicle.currentPosition = { lon: currentLon, lat: currentLat };
                }

                resolve({
                    code: 200,
                    data: {
                        position: [vehicle.currentPosition.lon, vehicle.currentPosition.lat],
                        destination: [vehicle.destination.lon, vehicle.destination.lat],
                        status: vehicle.status
                    }
                });
            }, 200); // Faster updates for smoother mock animation
        });
    },

    /**
     * Simulates starting the vehicle dispatching service.
     */
    startVehicle: async () => {
        console.log("Mock API: Starting vehicle dispatch service...");
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    code: 200,
                    data: { message: "Mock dispatch service started." }
                });
            }, 100);
        });
    },

    // Mock for addPois (used by AddPoi component)
    addPois: async (pois) => {
        console.log("Mock API: Adding POIs:", pois);
        return new Promise(resolve => {
            setTimeout(() => {
                // In a real scenario, you'd save these to a mock database.
                // For now, just confirm success.
                resolve({
                    code: 200,
                    message: `Successfully added ${pois.length} mock POIs.`
                });
            }, 200);
        });
    }
};

export default mockApiImpl;
