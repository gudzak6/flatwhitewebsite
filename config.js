// Configuration file for Flat White Finder
// Replace these values with your actual API keys

const CONFIG = {
    // Mapbox Configuration
    MAPBOX: {
        // Get your access token from: https://account.mapbox.com/access-tokens/
        ACCESS_TOKEN: 'pk.eyJ1IjoiZ3VkemFrNjYiLCJhIjoiY21kYzFhb2s0MHppMDJrcGt1N3F3OHZncCJ9.ZV1XvPw7LZlAnYWsQKYlOQ',
        
        // Map style (options: mapbox://styles/mapbox/streets-v11, mapbox://styles/mapbox/outdoors-v11, etc.)
        STYLE: 'mapbox://styles/mapbox/streets-v11',
        
        // Default map center (NYC coordinates)
        DEFAULT_CENTER: [-74.006, 40.7128],
        DEFAULT_ZOOM: 12
    },
    
    // App Configuration
    APP: {
        NAME: 'Flat White Finder',
        VERSION: '1.0.0',
        DESCRIPTION: 'Discover the best flat whites in your city'
    },
    
    // API Endpoints
    API: {
        MAPBOX_GEOCODING: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
        MAPBOX_DIRECTIONS: 'https://api.mapbox.com/directions/v5/mapbox/driving'
    },
    
    // Feature Flags
    FEATURES: {
        ENABLE_REAL_SEARCH: true,
        ENABLE_GEOCODING: true,
        ENABLE_DIRECTIONS: false,
        ENABLE_ANALYTICS: false
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
} 