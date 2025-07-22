// Global variables
let map;
let currentLocation = null;
let cafes = [];
let selectedCafe = null;
let currentRating = 0;
let placesService = null;
let searchTimeout = null;
let trendingCafeId = 1; // Trending cafe ID - change this weekly

// Sample cafe data (in a real app, this would come from a database)
const sampleCafes = [
    {
        id: 1,
        name: "Blue Bottle Coffee",
        address: "450 W 15th St, New York, NY 10011",
        coordinates: [-74.0060, 40.7407],
        rating: 4.6,
        reviewCount: 342,
        hours: "7:00 AM - 7:00 PM",
        phone: "(212) 555-0123",
        website: "https://bluebottlecoffee.com",
        description: "Artisanal coffee with a focus on single-origin beans and pour-over brewing methods.",
        features: ["Pour-over", "Single-origin", "Pastries", "Outdoor seating"],
        priceRange: "$$",
        trending: true // This cafe is trending this week
    },
    {
        id: 2,
        name: "East Village - Bakery",
        address: "152 2nd Ave, 10003 New York, United States",
        phone: "(555) 234-5678",
        hours: "Monday - Friday: 7AM - 8PM, Saturday - Sunday: 8AM - 8PM",
        coordinates: [-73.9881, 40.7308], // East Village coordinates
        rating: 4.5,
        reviewCount: 18,
        reviews: [
            {
                id: 3,
                title: "Solid flat white",
                text: "Good quality coffee, friendly staff. The flat white is consistently good.",
                rating: 4,
                date: "2024-01-12",
                author: "EspressoEnthusiast"
            }
        ]
    },
    {
        id: 3,
        name: "Bushwick - Roastery",
        address: "1329 Willoughby Ave Unit #161, Brooklyn, New York 11237, United States",
        phone: "(555) 345-6789",
        hours: "Monday - Friday: 8AM - 6PM, Saturday - Sunday: 8AM - 6PM",
        coordinates: [-73.9072, 40.7089], // Bushwick coordinates
        rating: 4.9,
        reviewCount: 31,
        reviews: [
            {
                id: 4,
                title: "Artisanal perfection",
                text: "This place takes coffee seriously. Their flat white is a work of art.",
                rating: 5,
                date: "2024-01-08",
                author: "BaristaBob"
            },
            {
                id: 5,
                title: "Worth the trip",
                text: "Came all the way from Manhattan and it was totally worth it. Amazing flat white!",
                rating: 5,
                date: "2024-01-05",
                author: "CoffeeTourist"
            }
        ]
    },
    {
        id: 4,
        name: "Cooper Square",
        address: "35 Cooper Sq, New York, NY 10003",
        phone: "(555) 456-7890",
        hours: "Monday - Friday: 7:30 AM - 4:30 PM, Saturday & Sunday: 8:00 AM - 5:00 PM",
        coordinates: [-73.9907, 40.7289], // Cooper Square coordinates
        rating: 4.7,
        reviewCount: 15,
        reviews: [
            {
                id: 6,
                title: "Hidden gem",
                text: "Great spot near Cooper Union. The flat white is perfectly balanced and the atmosphere is relaxed.",
                rating: 5,
                date: "2024-01-20",
                author: "CooperStudent"
            },
            {
                id: 7,
                title: "Consistent quality",
                text: "Been coming here for months and the coffee is always excellent. Perfect for studying.",
                rating: 4,
                date: "2024-01-18",
                author: "StudyBuddy"
            }
        ]
    },
    {
        id: 5,
        name: "Watch House",
        address: "660 5th Ave, New York, NY 10103, United States",
        phone: "(555) 567-8901",
        hours: "Monday - Friday: 7:00 AM - 6:00 PM, Saturday - Sunday: 9:00 AM - 6:30 PM",
        coordinates: [-73.976582, 40.760182], // Watch House coordinates (Midtown East)
        rating: 0,
        reviewCount: 0,
        reviews: []
    },
    {
        id: 6,
        name: "Café Kitsune",
        address: "550 Hudson Street, NY 10014, New York City",
        phone: "+1 (646) 755-8158",
        hours: "Monday - Wednesday: 8:00 AM - 8:00 PM, Thursday: 8:00 AM - 9:00 PM, Friday - Saturday: 8:00 AM - 10:00 PM, Sunday: 8:00 AM - 8:00 PM",
        coordinates: [-74.005858, 40.735054], // Café Kitsune coordinates (West Village)
        rating: 0,
        reviewCount: 0,
        reviews: []
    },
    {
        id: 7,
        name: "Laughing Man Coffee",
        address: "184 Duane St, New York, NY 10013",
        phone: "(212) 680-1111",
        hours: "Monday - Sunday: 6:00 AM - 6:00 PM",
        coordinates: [-74.010153, 40.717227], // Laughing Man Coffee coordinates (TriBeCa)
        rating: 0,
        reviewCount: 0,
        reviews: []
    },
    {
        id: 8,
        name: "Le Cafe - Columbus Circle",
        address: "250 West 57th Street, New York, NY 10107",
        phone: "(555) 888-0001",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-73.982477, 40.766317], // Columbus Circle coordinates (Midtown East)
        rating: 0,
        reviewCount: 0,
        reviews: []
    },
    {
        id: 9,
        name: "Le Cafe - Fashion District",
        address: "501 Seventh Avenue, New York, NY 10018",
        phone: "(555) 888-0002",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-73.98856, 40.75286], // Fashion District coordinates (Garment District)
        rating: 0,
        reviewCount: 0,
        reviews: []
    },
    {
        id: 10,
        name: "Le Cafe - Rockefeller",
        address: "1251 6th Avenue, New York, NY 10020",
        phone: "(555) 888-0003",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-73.981771, 40.76001], // Rockefeller coordinates (Theater District)
        rating: 0,
        reviewCount: 0,
        reviews: []
    },
    {
        id: 11,
        name: "Le Cafe - Nomad",
        address: "407 Park Avenue South, New York, NY 10016",
        phone: "(555) 888-0004",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-73.983689, 40.743347], // Nomad coordinates (Rose Hill)
        rating: 0,
        reviewCount: 0,
        reviews: []
    },
    {
        id: 12,
        name: "Le Cafe - West Side",
        address: "629 West 57th Street, New York, NY 10019",
        phone: "(555) 888-0005",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-73.99254, 40.77098], // West Side coordinates (Hell's Kitchen)
        rating: 0,
        reviewCount: 0,
        reviews: []
    },
    {
        id: 13,
        name: "Le Cafe - Turtle Bay",
        address: "909 3rd Avenue, New York, NY 10022",
        phone: "(555) 888-0006",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-73.968076, 40.758429], // Turtle Bay coordinates (Midtown East)
        rating: 0,
        reviewCount: 0,
        reviews: []
    },
    {
        id: 14,
        name: "Le Cafe - Bryant Park",
        address: "1440 Broadway, New York, NY 11221",
        phone: "(555) 888-0007",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-73.919671, 40.687991], // Bryant Park coordinates (Stuyvesant Heights, Brooklyn)
        rating: 0,
        reviewCount: 0,
        reviews: []
    },
    {
        id: 15,
        name: "Le Cafe - Midtown East",
        address: "661 Lexington Avenue, New York, NY 10022",
        phone: "(555) 888-0008",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-73.969776, 40.759685], // Midtown East coordinates (Midtown East)
        rating: 0,
        reviewCount: 0,
        reviews: []
    },
    {
        id: 16,
        name: "Le Cafe - Jersey City",
        address: "444 Warren Street, Jersey City, NJ 07302",
        phone: "(555) 888-0009",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-74.03734, 40.72407], // Jersey City coordinates (Exchange Place)
        rating: 0,
        reviewCount: 0,
        reviews: []
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing Flat White Finder...');
    initializeMap();
    await loadCafes(); // Wait for cafes to load
    setupEventListeners();
    updateStats();
    initializePlacesService();
    
    // Add some debugging
    console.log('Setup complete. Available functions:');
    console.log('- getCurrentLocation() - Get user location');
    console.log('- searchCafes(query) - Search for cafes');
    console.log('- testMapboxToken() - Test Mapbox connection');
    console.log('- populateDatabase() - Add sample cafes to database');
    console.log('- updateDatabaseWithAllCafes() - Clear and repopulate with all 16 cafes');
    console.log('Current cafes loaded:', cafes.length);
    console.log('Cafe names:', cafes.map(c => c.name));
});

// Initialize Mapbox map
function initializeMap() {
    // Use token from config file
    mapboxgl.accessToken = CONFIG.MAPBOX.ACCESS_TOKEN;
    
    // Debug: Log token status (first few characters only for security)
    console.log('Mapbox Token Status:', {
        isSet: mapboxgl.accessToken !== 'YOUR_MAPBOX_ACCESS_TOKEN_HERE',
        tokenPrefix: mapboxgl.accessToken.substring(0, 10) + '...',
        tokenLength: mapboxgl.accessToken.length
    });
    
    // Check if token is set
    if (mapboxgl.accessToken === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
        console.error('Please set your Mapbox access token in config.js');
        showToast('Mapbox token not configured. Please add your access token to config.js', 'error');
        return;
    }
    
    map = new mapboxgl.Map({
        container: 'map',
        style: CONFIG.MAPBOX.STYLE,
        center: CONFIG.MAPBOX.DEFAULT_CENTER,
        zoom: CONFIG.MAPBOX.DEFAULT_ZOOM
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl());

    // Add geolocation control
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
    }));

    // Wait for map to load before adding markers
    map.on('load', function() {
        addCafeMarkers();
        // Hide loading overlay
        const mapLoading = document.getElementById('mapLoading');
        if (mapLoading) {
            mapLoading.style.display = 'none';
        }
        // Update map stats
        updateMapStats();
        updateTrendingSpot(); // Call this after map loads
    });
}

// Update trending spot display
function updateTrendingSpot() {
    const trendingCafe = cafes.find(cafe => cafe.id === trendingCafeId);
    if (!trendingCafe) return;

    const trendingSection = document.querySelector('.trending-hero');
    if (trendingSection) {
        const title = trendingSection.querySelector('h3');
        const description = trendingSection.querySelector('p');
        const rating = trendingSection.querySelector('.text-coffee-700');
        const viewButton = trendingSection.querySelector('button');

        if (title) title.textContent = trendingCafe.name;
        if (description) description.textContent = `This week's trending spot for the perfect flat white`;
        if (rating) rating.textContent = `${trendingCafe.rating} (${trendingCafe.reviewCount} reviews)`;
        if (viewButton) viewButton.onclick = () => openCafeDetails(trendingCafe.id);
    }
}

// Load cafes from Firebase database
async function loadCafes() {
    try {
        // Check if Firebase functions are available
        if (typeof window.getCafesFromDatabase !== 'function') {
            console.log('Firebase not ready, using sample data');
            cafes = [...sampleCafes];
            addCafeMarkers();
            updateStats();
            return;
        }
        
        showToast('Loading cafes from database...', 'info');
        const databaseCafes = await window.getCafesFromDatabase();
        
        console.log('Database cafes loaded:', databaseCafes.length);
        console.log('Database cafe IDs:', databaseCafes.map(c => ({ id: c.id, name: c.name, type: typeof c.id })));
        
        if (databaseCafes.length > 0) {
            // TEMPORARY: Force use sample data to see all 16 cafes
            console.log('Database has cafes, but forcing use of sample data for testing');
            cafes = [...sampleCafes];
            showToast(`Loaded ${cafes.length} cafes from sample data (overriding database)`, 'success');
        } else {
            // If no cafes in database, use sample data and save to database
            cafes = [...sampleCafes];
            showToast('No cafes found in database, using sample data', 'info');
            
            console.log('Saving sample cafes to database...');
            // Save sample cafes to database
            for (const cafe of sampleCafes) {
                try {
                    const newId = await window.addCafeToDatabase(cafe);
                    console.log(`Saved cafe "${cafe.name}" with new ID: ${newId}`);
                } catch (error) {
                    console.error('Error saving sample cafe:', error);
                }
            }
        }
        
        // Update the map with cafes
        addCafeMarkers();
        updateStats();
        updateTrendingSpot();
    } catch (error) {
        console.error('Error loading cafes:', error);
        showToast('Error loading cafes, using sample data', 'error');
        cafes = [...sampleCafes];
        addCafeMarkers();
        updateStats();
    }
}

// Add cafe markers to the map
function addCafeMarkers(cafesToShow = cafes) {
    cafesToShow.forEach(cafe => {
        // Create custom marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'custom-marker';
        markerEl.innerHTML = '<i class="fas fa-coffee"></i>';
        
        // Add trending class if the cafe is trending
        if (cafe.id === trendingCafeId) {
            markerEl.classList.add('trending-marker');
            markerEl.innerHTML = '<i class="fas fa-fire"></i>';
        }

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div style="text-align: center;">
                <h4 style="margin: 0 0 8px 0; color: #333;">${cafe.name}</h4>
                <div style="display: flex; align-items: center; justify-content: center; gap: 4px; margin-bottom: 8px;">
                    ${generateStars(cafe.rating)}
                    <span style="font-weight: 600; color: #333;">${cafe.rating}</span>
                    <span style="color: #666; font-size: 0.8rem;">(${cafe.reviewCount})</span>
                </div>
                <p style="margin: 0 0 8px 0; color: #666; font-size: 0.9rem;">${cafe.address}</p>
                <button onclick="openCafeDetails('${cafe.id}')" style="
                    background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                ">View Details</button>
            </div>
        `);

        // Add marker to map
        new mapboxgl.Marker(markerEl)
            .setLngLat(cafe.coordinates)
            .setPopup(popup)
            .addTo(map);
    });
}

// Generate star rating HTML
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star" style="color: #FFD700;"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt" style="color: #FFD700;"></i>';
        } else {
            stars += '<i class="far fa-star" style="color: #ddd;"></i>';
        }
    }
    return stars;
}

// Open cafe details modal
function openCafeDetails(cafeId) {
    console.log('openCafeDetails called with cafeId:', cafeId);
    console.log('Available cafes:', cafes.map(c => ({ id: c.id, name: c.name, type: typeof c.id })));
    
    // Try to find cafe with flexible ID matching (string vs number)
    selectedCafe = cafes.find(cafe => 
        cafe.id === cafeId || 
        cafe.id === parseInt(cafeId) || 
        cafe.id === cafeId.toString()
    );
    console.log('Found selectedCafe:', selectedCafe);
    
    if (!selectedCafe) {
        console.error('Cafe not found with ID:', cafeId);
        console.log('Available cafe IDs:', cafes.map(c => ({ id: c.id, type: typeof c.id })));
        
        // Try to find by index as a last resort (for backward compatibility)
        const index = parseInt(cafeId) - 1;
        if (index >= 0 && index < cafes.length) {
            selectedCafe = cafes[index];
            console.log('Found cafe by index fallback:', selectedCafe);
        } else {
            showToast('Cafe not found. Please try refreshing the page.', 'error');
            return;
        }
    }

            // Update modal content
        document.getElementById('cafeName').textContent = selectedCafe.name;
        document.getElementById('cafeScore').textContent = selectedCafe.rating;
        document.getElementById('cafeAddress').textContent = selectedCafe.address;
        document.getElementById('cafeHours').textContent = selectedCafe.hours;
        document.getElementById('cafePhone').textContent = selectedCafe.phone;
        document.getElementById('reviewCount').textContent = `(${selectedCafe.reviewCount} reviews)`;

    // Update stars in the modal
    updateCafeModalStars(selectedCafe.rating);

    // Load reviews
    loadReviews();

            // Show modal using DaisyUI
        const modal = document.getElementById('cafeModal');
        modal.showModal();
}

// Update cafe modal stars
function updateCafeModalStars(rating) {
    const ratingContainer = document.querySelector('#cafeModal .rating');
    const inputs = ratingContainer.querySelectorAll('input');
    
    inputs.forEach((input, index) => {
        if (index < rating) {
            input.checked = true;
        } else {
            input.checked = false;
        }
    });
}

// Load reviews for selected cafe from Firebase
async function loadReviews() {
    console.log('loadReviews called for cafe:', selectedCafe);
    console.log('getReviewsFromDatabase function exists:', typeof getReviewsFromDatabase);
    console.log('window.getReviewsFromDatabase exists:', typeof window.getReviewsFromDatabase);
    
    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = '<div class="text-center"><div class="loading"></div><p class="text-sm text-coffee-600 mt-2">Loading reviews...</p></div>';

    try {
        console.log('About to call getReviewsFromDatabase with cafe ID:', selectedCafe.id);
        // Load reviews from Firebase
        const reviews = await window.getReviewsFromDatabase(selectedCafe.id);
        console.log('Reviews loaded from database:', reviews);
        
        // Update local cafe object with reviews from database
        selectedCafe.reviews = reviews.map(review => ({
            ...review,
            id: review.id,
            date: review.createdAt ? new Date(review.createdAt.toDate()).toISOString().split('T')[0] : review.date
        }));
        
        console.log('Updated selectedCafe.reviews:', selectedCafe.reviews);
        
        // Update the display with the loaded reviews
        updateReviewsDisplay();
    } catch (error) {
        console.error('Error loading reviews:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        reviewsList.innerHTML = '<p class="text-center text-red-600">Error loading reviews. Please try again.</p>';
    }
}

// Generate DaisyUI star rating HTML
function generateDaisyUIStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<input type="radio" name="rating-display" class="mask mask-star-2 bg-orange-400" checked disabled />';
        } else {
            stars += '<input type="radio" name="rating-display" class="mask mask-star-2 bg-orange-400" disabled />';
        }
    }
    return stars;
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Update reviews display from local data
function updateReviewsDisplay() {
    const reviewsList = document.getElementById('reviewsList');
    
    if (!selectedCafe || !selectedCafe.reviews) {
        reviewsList.innerHTML = '<p class="text-center text-gray-600">No reviews yet. Be the first to review!</p>';
        return;
    }
    
    reviewsList.innerHTML = '';

    if (selectedCafe.reviews.length === 0) {
        reviewsList.innerHTML = '<p class="text-center text-gray-600">No reviews yet. Be the first to review!</p>';
        return;
    }

    selectedCafe.reviews.forEach((review, index) => {
        const reviewElement = document.createElement('div');
        // Add highlight class for the newest review (last in the array)
        const isNewest = index === selectedCafe.reviews.length - 1;
        reviewElement.className = `card bg-base-100 shadow-sm border ${isNewest ? 'border-coffee-400 bg-coffee-50' : 'border-base-300'} transition-all duration-300`;
        
        if (isNewest) {
            reviewElement.style.animation = 'fadeInUp 0.5s ease-out';
        }
        
        reviewElement.innerHTML = `
            <div class="card-body">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h5 class="card-title text-coffee-800 text-lg">${review.title}</h5>
                        <div class="flex items-center gap-2 mt-1">
                            <div class="rating rating-sm">
                                ${generateDaisyUIStars(review.rating)}
                            </div>
                            <span class="text-sm font-medium text-coffee-600">${review.rating}/5</span>
                        </div>
                    </div>
                    ${isNewest ? '<span class="badge badge-success badge-sm">New</span>' : ''}
                </div>
                <p class="text-gray-700 leading-relaxed">${review.text}</p>
                <div class="flex justify-between items-center mt-3 pt-3 border-t border-base-200">
                    <span class="text-sm text-gray-500">By ${review.author}</span>
                    <span class="text-sm text-gray-500">${formatDate(review.date)}</span>
                </div>
            </div>
        `;
        reviewsList.appendChild(reviewElement);
    });
}

// Close cafe modal
function closeCafeModal() {
    const modal = document.getElementById('cafeModal');
    modal.close();
    selectedCafe = null;
}

// Open review form
function openReviewForm() {
    console.log('openReviewForm called');
    console.log('selectedCafe:', selectedCafe);
    
    if (!selectedCafe) {
        console.error('No cafe selected! Please click on a cafe first.');
        showToast('Please select a cafe first', 'error');
        return;
    }
    
    // Reset form completely
    document.getElementById('reviewForm').reset();
    currentRating = 0;
    
    // Ensure all stars start empty
    const ratingInput = document.getElementById('ratingInput');
    const starInputs = ratingInput.querySelectorAll('input');
    starInputs.forEach(input => {
        input.checked = false;
    });
    
    updateRatingDisplay();
    
    // Clear any previous error states
    const inputs = document.querySelectorAll('#reviewForm input, #reviewForm textarea');
    inputs.forEach(input => {
        input.classList.remove('input-error');
    });
    
    const modal = document.getElementById('reviewModal');
    modal.showModal();
    console.log('Review modal opened for:', selectedCafe.name);
}

// Close review modal
function closeReviewModal() {
    const modal = document.getElementById('reviewModal');
    modal.close();
}

// Handle rating selection
function handleRatingClick(rating) {
    currentRating = rating;
    updateRatingDisplay();
}

// Update rating display
function updateRatingDisplay() {
    const ratingInput = document.getElementById('ratingInput');
    const inputs = ratingInput.querySelectorAll('input');
    
    inputs.forEach((input, index) => {
        if (index < currentRating) {
            input.checked = true;
        } else {
            input.checked = false;
        }
    });
}

// Submit review
async function submitReview(event) {
    event.preventDefault();
    
    // Get rating from DaisyUI rating component
    const ratingInput = document.getElementById('ratingInput');
    const checkedInput = ratingInput.querySelector('input:checked');
    const rating = checkedInput ? parseInt(checkedInput.value) : 0;
    
    if (rating === 0) {
        showToast('Please select a rating', 'error');
        return;
    }

    const title = document.getElementById('reviewTitle').value.trim();
    const text = document.getElementById('reviewText').value.trim();

    if (!title || !text) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading loading-spinner loading-sm"></div> Submitting...';
    submitBtn.disabled = true;
    
    try {
        // Check if Firebase functions are available
        if (typeof window.addReviewToDatabase !== 'function') {
            throw new Error('Firebase functions not available');
        }
        
        // Check if cafe has a valid Firebase ID
        if (!selectedCafe.id || typeof selectedCafe.id !== 'string') {
            console.log('Cafe not in database, saving it first...');
            // Save the cafe to Firebase first
            const cafeData = {
                name: selectedCafe.name,
                address: selectedCafe.address,
                phone: selectedCafe.phone,
                hours: selectedCafe.hours,
                coordinates: selectedCafe.coordinates,
                rating: selectedCafe.rating,
                reviewCount: selectedCafe.reviewCount
            };
            const newCafeId = await window.addCafeToDatabase(cafeData);
            selectedCafe.id = newCafeId;
            console.log('Cafe saved with new ID:', newCafeId);
        }
        
        // Create new review
        const newReview = {
            title: title,
            text: text,
            rating: rating,
            date: new Date().toISOString().split('T')[0],
            author: 'Anonymous' // In a real app, this would be the logged-in user
        };

        console.log('Submitting review for cafe:', selectedCafe.name);
        console.log('Cafe ID:', selectedCafe.id);
        console.log('Review data:', newReview);

        // Add review to Firebase database
        await window.addReviewToDatabase(selectedCafe.id, newReview);
        
        // Add review to local cafe object
        const reviewWithId = { ...newReview, id: Date.now() };
        selectedCafe.reviews.push(reviewWithId);
        
        // Update cafe rating in database
        const newRating = calculateAverageRating(selectedCafe.reviews);
        const newReviewCount = selectedCafe.reviews.length;
        
        await window.updateCafeRating(selectedCafe.id, newRating, newReviewCount);
        
        // Update local cafe object
        selectedCafe.rating = newRating;
        selectedCafe.reviewCount = newReviewCount;
        
        // Close review modal but keep cafe modal open
        closeReviewModal();
        
        // Update cafe modal with new data
        document.getElementById('cafeScore').textContent = selectedCafe.rating;
        document.getElementById('reviewCount').textContent = `(${selectedCafe.reviewCount} reviews)`;
        updateCafeModalStars(selectedCafe.rating);
        
        // Update reviews display directly with the new review
        updateReviewsDisplay();
        
        showToast('Review submitted successfully to database!', 'success');
    } catch (error) {
        console.error('Error submitting review:', error);
        showToast('Error submitting review to database. Please try again.', 'error');
    } finally {
        // Reset button state
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

// Calculate average rating from reviews
function calculateAverageRating(reviews) {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((totalRating / reviews.length) * 10) / 10;
}

// Note: updateCafeRating function is now provided by firebase-config.js

// Save cafes to localStorage
async function saveCafes() {
    try {
        // This function is now handled by individual database operations
        // Cafes are saved individually when added
        console.log('Cafes saved to database');
    } catch (error) {
        console.error('Error saving cafes:', error);
        showToast('Error saving to database', 'error');
    }
}

// Open add cafe modal
function openAddCafeModal() {
    document.getElementById('addCafeForm').reset();
    const modal = document.getElementById('addCafeModal');
    modal.showModal();
}

// Close add cafe modal
function closeAddCafeModal() {
    const modal = document.getElementById('addCafeModal');
    modal.close();
}



// Get current location
function getCurrentLocation() {
    console.log('getCurrentLocation called');
    
    // Check if geolocation is supported
    if (!checkGeolocationSupport()) {
        showToast('Geolocation is not supported by this browser', 'error');
        return;
    }
    
    showToast('Requesting location permission...', 'info');
    
    // Try to get location directly first
    requestLocation();
}

function requestLocation() {
    console.log('requestLocation called');
    
    const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
    };
    
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const { latitude, longitude } = position.coords;
            currentLocation = [longitude, latitude];
            
            console.log('Location obtained successfully:', { latitude, longitude });
            
            // Remove existing user location marker
            const existingMarker = document.querySelector('.user-location-marker');
            if (existingMarker) {
                existingMarker.remove();
            }
            
            // Add user location marker
            const markerEl = document.createElement('div');
            markerEl.className = 'user-location-marker';
            markerEl.innerHTML = '<i class="fas fa-location-arrow" style="color: #3B82F6; font-size: 20px;"></i>';
            markerEl.style.cssText = `
                background: white;
                border: 3px solid #3B82F6;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            `;
            
            new mapboxgl.Marker(markerEl)
                .setLngLat(currentLocation)
                .addTo(map);
            
            // Fly to user location
            map.flyTo({
                center: currentLocation,
                zoom: 14
            });
            
            showToast('Location updated! Found your position.', 'success');
            
            // Update map stats
            updateMapStats();
        },
        function(error) {
            console.error('Geolocation error:', error);
            let errorMessage = 'Unable to get your location';
            let detailedMessage = '';
            
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location access denied';
                    detailedMessage = 'Please allow location access when prompted by your browser.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information unavailable';
                    detailedMessage = 'Your device cannot determine your location.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out';
                    detailedMessage = 'Please try again.';
                    break;
            }
            
            showToast(`${errorMessage}. ${detailedMessage}`, 'error');
            
            // Show detailed instructions for enabling location
            if (error.code === error.PERMISSION_DENIED) {
                setTimeout(() => {
                    showToast('💡 Tip: Look for a location icon in your browser address bar', 'info');
                }, 2000);
                
                setTimeout(() => {
                    showToast('🔧 Or check your browser settings > Privacy & Security > Site Settings > Location', 'info');
                }, 4000);
                
                // Offer to use a default location for testing
                setTimeout(() => {
                    if (confirm('Would you like to use New York City as a default location for testing?')) {
                        useDefaultLocation();
                    }
                }, 6000);
            }
        },
        options
    );
}

// Search cafes
function searchCafes(query) {
    console.log('Searching for:', query);
    console.log('Available cafes:', cafes.length);
    console.log('Cafe names:', cafes.map(c => c.name));
    
    const filteredCafes = cafes.filter(cafe => 
        cafe.name.toLowerCase().includes(query.toLowerCase()) ||
        cafe.address.toLowerCase().includes(query.toLowerCase())
    );
    
    console.log('Filtered cafes:', filteredCafes.length);
    
    // Clear all markers first
    if (map.getSource('cafes')) {
        map.removeLayer('cafe-markers');
        map.removeSource('cafes');
    }
    
    if (filteredCafes.length > 0) {
        // Add filtered cafes to map
        addCafeMarkers(filteredCafes);
        
        // Fly to the first result
        if (filteredCafes[0].coordinates) {
            map.flyTo({
                center: filteredCafes[0].coordinates,
                zoom: 14
            });
        }
        
        showToast(`Found ${filteredCafes.length} cafes`, 'success');
    } else {
        // Show all cafes if no results
        addCafeMarkers();
        showToast('No cafes found', 'error');
    }
}

// Update stats
function updateStats() {
    const totalCafes = cafes.length;
    const totalReviews = cafes.reduce((sum, cafe) => sum + cafe.reviewCount, 0);
    const avgRating = cafes.length > 0 
        ? Math.round((cafes.reduce((sum, cafe) => sum + cafe.rating, 0) / cafes.length) * 10) / 10
        : 0;

    // Update hero stats with real data
    const heroCafeCount = document.getElementById('heroCafeCount');
    const heroReviewCount = document.getElementById('heroReviewCount');
    const heroAvgRating = document.getElementById('heroAvgRating');
    
    if (heroCafeCount) heroCafeCount.textContent = totalCafes;
    if (heroReviewCount) {
        // Format review count (e.g., 1000 -> 1k, 1500 -> 1.5k)
        if (totalReviews >= 1000) {
            heroReviewCount.textContent = (totalReviews / 1000).toFixed(1) + 'k';
        } else {
            heroReviewCount.textContent = totalReviews;
        }
    }
    if (heroAvgRating) heroAvgRating.textContent = avgRating;
    
    // Update map stats
    updateMapStats();
}

// Update map section stats
function updateMapStats() {
    const totalCafes = cafes.length;
    const avgRating = cafes.length > 0 
        ? Math.round((cafes.reduce((sum, cafe) => sum + cafe.rating, 0) / cafes.length) * 10) / 10
        : 0;
    
    // Calculate cafes near user (within 5km radius - simplified)
    const nearCount = currentLocation ? cafes.length : 0; // In a real app, calculate distance
    
    // Update map stats elements
    const mapCafeCount = document.getElementById('mapCafeCount');
    const mapAvgRating = document.getElementById('mapAvgRating');
    const mapNearCount = document.getElementById('mapNearCount');
    
    if (mapCafeCount) mapCafeCount.textContent = totalCafes;
    if (mapAvgRating) mapAvgRating.textContent = avgRating;
    if (mapNearCount) mapNearCount.textContent = nearCount;
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Rating stars for review form
    const ratingInput = document.getElementById('ratingInput');
    if (ratingInput) {
        ratingInput.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                currentRating = parseInt(e.target.value);
            }
        });
    }

    // Forms
    document.getElementById('reviewForm').addEventListener('submit', submitReview);
    document.getElementById('addCafeForm').addEventListener('submit', submitCafe);

    // Search functionality for the map search input (Temporarily Disabled)
    /*
    const searchInput = document.getElementById('searchInput');
    console.log('Search input found:', searchInput);
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            console.log('Search input event triggered');
            const query = e.target.value.trim();
            if (query.length > 2) {
                searchCafes(query);
            }
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                console.log('Search Enter key pressed');
                e.preventDefault();
                const query = e.target.value.trim();
                if (query.length > 0) {
                    searchCafes(query);
                }
            }
        });
    }

    // Search button functionality
    const searchBtn = document.getElementById('searchBtn');
    console.log('Search button found:', searchBtn);
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            console.log('Search button clicked');
            const query = searchInput.value.trim();
            if (query.length > 0) {
                searchCafes(query);
            }
        });
    }
    */

    // Cafe search functionality (for add cafe modal)
    const cafeSearchInput = document.getElementById('cafeSearchInput');
    const searchCafeBtn = document.getElementById('searchCafeBtn');
    
    if (cafeSearchInput) {
        cafeSearchInput.addEventListener('input', handleCafeSearchInput);
        cafeSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchForCafes();
            }
        });
    }
    
    if (searchCafeBtn) {
        searchCafeBtn.addEventListener('click', searchForCafes);
    }

    // Close modals with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('dialog[open]');
            modals.forEach(modal => modal.close());
        }
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add some interactivity to the hero section
document.addEventListener('DOMContentLoaded', function() {
    // Animate stats on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });

    document.querySelectorAll('.stat').forEach(stat => {
        stat.style.opacity = '0';
        stat.style.transform = 'translateY(20px)';
        stat.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(stat);
    });
});

// Initialize Google Places service
function initializePlacesService() {
    // For demo purposes, we'll use a mock service
    // In production, you would initialize Google Places API here
    console.log('Places service initialized');
}

// Test Mapbox token functionality
async function testMapboxToken() {
    console.log('Testing Mapbox token...');
    
    try {
        // Test geocoding API
        const testAddress = 'New York, NY';
        const baseUrl = CONFIG.API.MAPBOX_GEOCODING;
        const encodedAddress = encodeURIComponent(testAddress);
        const url = `${baseUrl}/${encodedAddress}.json?access_token=${mapboxgl.accessToken}&limit=1`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok && data.features && data.features.length > 0) {
            console.log('✅ Mapbox token is working correctly!');
            console.log('Test geocoding result:', data.features[0]);
            showToast('Mapbox token is working correctly!', 'success');
        } else {
            console.error('❌ Mapbox token test failed:', data);
            showToast('Mapbox token test failed. Check console for details.', 'error');
        }
    } catch (error) {
        console.error('❌ Mapbox token test error:', error);
        showToast('Mapbox token test failed. Check console for details.', 'error');
    }
}

// Handle cafe search input with debouncing
function handleCafeSearchInput(e) {
    const query = e.target.value.trim();
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Hide results if query is empty
    if (query.length === 0) {
        hideSearchResults();
        return;
    }
    
    // Debounce search to avoid too many API calls
    searchTimeout = setTimeout(() => {
        if (query.length >= 3) {
            searchForCafes();
        }
    }, 500);
}

// Search for cafes using Mapbox Geocoding API
async function searchForCafes() {
    const query = document.getElementById('cafeSearchInput').value.trim();
    
    if (query.length < 3) {
        showToast('Please enter at least 3 characters', 'error');
        return;
    }
    
    showSearchLoading();
    
    try {
        // Search for cafes using Mapbox Geocoding API
        const results = await searchCafesWithMapbox(query);
        displaySearchResults(results);
    } catch (error) {
        console.error('Search error:', error);
        // Fallback to mock data
        const mockResults = generateMockCafeResults(query);
        displaySearchResults(mockResults);
    }
}

// Use default location for testing
function useDefaultLocation() {
    console.log('useDefaultLocation called');
    currentLocation = [-74.006, 40.7128]; // New York City coordinates
    
    // Remove existing user location marker
    const existingMarker = document.querySelector('.user-location-marker');
    if (existingMarker) {
        existingMarker.remove();
    }
    
    // Add user location marker
    const markerEl = document.createElement('div');
    markerEl.className = 'user-location-marker';
    markerEl.innerHTML = '<i class="fas fa-location-arrow" style="color: #3B82F6; font-size: 20px;"></i>';
    markerEl.style.cssText = `
        background: white;
        border: 3px solid #3B82F6;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
    
    new mapboxgl.Marker(markerEl)
        .setLngLat(currentLocation)
        .addTo(map);
    
    // Fly to default location
    map.flyTo({
        center: currentLocation,
        zoom: 12
    });
    
    showToast('Using New York City as default location', 'info');
    
    // Update map stats
    updateMapStats();
}

// Check if geolocation is supported and available
function checkGeolocationSupport() {
    if (!navigator.geolocation) {
        console.log('Geolocation not supported');
        return false;
    }
    
    // Check if we're on HTTPS (required for geolocation in most browsers)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        console.log('Geolocation requires HTTPS (except localhost)');
        showToast('Geolocation requires HTTPS. Please use a secure connection.', 'warning');
        return false;
    }
    
    return true;
}

// Search cafes using Mapbox Geocoding API
async function searchCafesWithMapbox(query) {
    const baseUrl = CONFIG.API.MAPBOX_GEOCODING;
    // Improve search query to find more cafes
    const searchTerms = ['cafe', 'coffee', 'coffee shop', 'espresso'];
    let allResults = [];
    
    for (const term of searchTerms) {
        const searchQuery = `${query} ${term}`;
        const encodedQuery = encodeURIComponent(searchQuery);
        const url = `${baseUrl}/${encodedQuery}.json?access_token=${mapboxgl.accessToken}&limit=10&types=poi`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
                // Filter for cafe-related places
                const cafeFeatures = data.features.filter(feature => {
                    const category = feature.properties?.category?.toLowerCase() || '';
                    const text = feature.text?.toLowerCase() || '';
                    const placeName = feature.place_name?.toLowerCase() || '';
                    
                    return category.includes('cafe') || 
                           category.includes('coffee') || 
                           category.includes('food') ||
                           text.includes('cafe') || 
                           text.includes('coffee') ||
                           placeName.includes('cafe') || 
                           placeName.includes('coffee');
                });
                
                allResults = allResults.concat(cafeFeatures);
            }
        } catch (error) {
            console.error(`Mapbox search failed for term "${term}":`, error);
        }
    }
    
    // Remove duplicates and limit results
    const uniqueResults = allResults.filter((result, index, self) => 
        index === self.findIndex(r => r.id === result.id)
    ).slice(0, 10);
    
    if (uniqueResults.length > 0) {
        return uniqueResults.map((feature, index) => ({
            name: feature.text || feature.place_name.split(',')[0],
            address: feature.place_name,
            phone: '', // Mapbox doesn't provide phone numbers
            rating: 0, // Mapbox doesn't provide ratings
            placeId: feature.id,
            types: feature.properties?.category?.split(',') || ['cafe'],
            coordinates: feature.center
        }));
    } else {
        return [];
    }
}

// Generate mock cafe search results
function generateMockCafeResults(query) {
    const mockCafes = [
        {
            name: `${query} Coffee Shop`,
            address: '123 Main Street, New York, NY',
            phone: '(555) 123-4567',
            rating: 4.5,
            placeId: 'mock_1',
            types: ['cafe', 'food', 'establishment']
        },
        {
            name: `${query} Cafe & Bakery`,
            address: '456 Oak Avenue, New York, NY',
            phone: '(555) 234-5678',
            rating: 4.2,
            placeId: 'mock_2',
            types: ['cafe', 'bakery', 'food', 'establishment']
        },
        {
            name: `${query} Artisan Coffee`,
            address: '789 Pine Street, New York, NY',
            phone: '(555) 345-6789',
            rating: 4.8,
            placeId: 'mock_3',
            types: ['cafe', 'food', 'establishment']
        }
    ];
    
    return mockCafes.filter(cafe => 
        cafe.name.toLowerCase().includes(query.toLowerCase()) ||
        cafe.address.toLowerCase().includes(query.toLowerCase())
    );
}

// Display search results
function displaySearchResults(results) {
    const resultsContainer = document.getElementById('searchResults');
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                <span>No cafes found. Try a different search term.</span>
            </div>
        `;
        resultsContainer.classList.remove('hidden');
        return;
    }
    
    const resultsHTML = results.map(cafe => `
        <div class="card bg-base-100 shadow-sm border border-base-300 cursor-pointer hover:shadow-md transition-shadow" 
             onclick="selectCafeFromSearch('${cafe.placeId}')">
            <div class="card-body p-4">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h3 class="font-semibold text-coffee-800">${cafe.name}</h3>
                        <p class="text-sm text-gray-600 mt-1">
                            <i class="fas fa-map-marker-alt text-coffee-600 mr-1"></i>
                            ${cafe.address}
                        </p>
                        ${cafe.phone ? `
                            <p class="text-sm text-gray-600 mt-1">
                                <i class="fas fa-phone text-coffee-600 mr-1"></i>
                                ${cafe.phone}
                            </p>
                        ` : ''}
                    </div>
                    <div class="flex items-center gap-1 ml-2">
                        <div class="rating rating-sm">
                            ${generateDaisyUIStars(cafe.rating)}
                        </div>
                        <span class="text-sm font-semibold text-coffee-800">${cafe.rating}</span>
                    </div>
                </div>
                <div class="flex gap-1 mt-2">
                    ${cafe.types.slice(0, 3).map(type => 
                        `<span class="badge badge-outline badge-sm">${type}</span>`
                    ).join('')}
                </div>
            </div>
        </div>
    `).join('');
    
    resultsContainer.innerHTML = resultsHTML;
    resultsContainer.classList.remove('hidden');
}

// Show loading state for search
function showSearchLoading() {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = `
        <div class="flex items-center justify-center p-4">
            <div class="loading"></div>
            <span class="ml-2 text-gray-600">Searching for cafes...</span>
        </div>
    `;
    resultsContainer.classList.remove('hidden');
}

// Hide search results
function hideSearchResults() {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.classList.add('hidden');
}

// Select cafe from search results
function selectCafeFromSearch(placeId) {
    // In a real app, you would fetch detailed place information here
    // For demo purposes, we'll use the mock data
    const query = document.getElementById('cafeSearchInput').value.trim();
    const mockResults = generateMockCafeResults(query);
    const selectedCafe = mockResults.find(cafe => cafe.placeId === placeId);
    
    if (selectedCafe) {
        // Fill the form with selected cafe data
        document.getElementById('cafeNameInput').value = selectedCafe.name;
        document.getElementById('cafeAddressInput').value = selectedCafe.address;
        document.getElementById('cafePhoneInput').value = selectedCafe.phone || '';
        
        // Hide search results
        hideSearchResults();
        
        // Clear search input
        document.getElementById('cafeSearchInput').value = '';
        
        // Show success message
        showToast(`Selected: ${selectedCafe.name}`, 'success');
        
        // Focus on hours input for user to complete
        document.getElementById('cafeHoursInput').focus();
    }
}

// Enhanced submit cafe function with Firebase
async function submitCafe(event) {
    event.preventDefault();
    
    const name = document.getElementById('cafeNameInput').value.trim();
    const address = document.getElementById('cafeAddressInput').value.trim();
    const phone = document.getElementById('cafePhoneInput').value.trim();
    const hours = document.getElementById('cafeHoursInput').value.trim();

    if (!name || !address) {
        showToast('Please fill in required fields', 'error');
        return;
    }

    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Adding Cafe...';
    submitBtn.disabled = true;

    try {
        // Geocode the address to get coordinates
        const coordinates = await geocodeAddress(address);
        
        const newCafe = {
            name: name,
            address: address,
            phone: phone,
            hours: hours,
            coordinates: coordinates,
            rating: 0,
            reviewCount: 0,
            reviews: []
        };

        // Add to Firebase database
        const cafeId = await window.addCafeToDatabase(newCafe);
        
        // Add to local array with the database ID
        const cafeWithId = { ...newCafe, id: cafeId };
        cafes.push(cafeWithId);
        
        // Refresh map markers
        addCafeMarkers();
        
        closeAddCafeModal();
        showToast('Cafe added successfully to database!', 'success');
        
        // Update stats
        updateStats();
    } catch (error) {
        console.error('Error adding cafe:', error);
        showToast('Error adding cafe to database. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Geocode address using Mapbox Geocoding API
async function geocodeAddress(address) {
    const baseUrl = CONFIG.API.MAPBOX_GEOCODING;
    const encodedAddress = encodeURIComponent(address);
    const url = `${baseUrl}/${encodedAddress}.json?access_token=${mapboxgl.accessToken}&limit=1`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
            const [longitude, latitude] = data.features[0].center;
            return [longitude, latitude];
        } else {
            throw new Error('No coordinates found for this address');
        }
    } catch (error) {
        console.error('Geocoding failed:', error);
        // Fallback to random coordinates near NYC
        return [
            -74.006 + (Math.random() - 0.5) * 0.1,
            40.7128 + (Math.random() - 0.5) * 0.1
        ];
    }
}

// Function to clear database and repopulate with all 16 cafes
async function updateDatabaseWithAllCafes() {
    if (typeof window.getCafesFromDatabase !== 'function') {
        console.error('Firebase functions not available');
        showToast('Firebase not available', 'error');
        return;
    }
    
    try {
        showToast('Updating database with all 16 cafes...', 'info');
        console.log('Starting database update...');
        
        // Get all existing cafes
        const existingCafes = await window.getCafesFromDatabase();
        console.log('Existing cafes in database:', existingCafes.length);
        console.log('Existing cafe names:', existingCafes.map(c => c.name));
        
        // Delete all existing cafes
        console.log('Deleting existing cafes...');
        for (const cafe of existingCafes) {
            try {
                await db.collection("cafes").doc(cafe.id).delete();
                console.log(`✓ Deleted cafe: ${cafe.name}`);
            } catch (error) {
                console.error(`✗ Error deleting cafe ${cafe.name}:`, error);
            }
        }
        
        console.log('Database cleared. Adding all 16 sample cafes...');
        console.log('Sample cafes to add:', sampleCafes.map(c => c.name));
        
        // Add all sample cafes to database
        for (const cafe of sampleCafes) {
            try {
                const newId = await window.addCafeToDatabase(cafe);
                console.log(`✓ Added cafe "${cafe.name}" with ID: ${newId}`);
            } catch (error) {
                console.error(`✗ Error adding cafe ${cafe.name}:`, error);
            }
        }
        
        // Wait a moment for Firebase to update
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Reload cafes from database
        console.log('Reloading cafes from database...');
        await loadCafes();
        
        showToast('Database updated successfully with all 16 cafes!', 'success');
        console.log('Database update complete. Total cafes:', cafes.length);
        
    } catch (error) {
        console.error('Error updating database:', error);
        showToast('Error updating database. Please try again.', 'error');
    }
}

// Simple function to just add missing cafes (without deleting existing ones)
async function addMissingCafes() {
    if (typeof window.getCafesFromDatabase !== 'function') {
        console.error('Firebase functions not available');
        showToast('Firebase not available', 'error');
        return;
    }
    
    try {
        showToast('Adding missing cafes to database...', 'info');
        
        // Get current cafes from database
        const existingCafes = await window.getCafesFromDatabase();
        console.log('Current cafes in database:', existingCafes.length);
        
        // Find cafes that are missing
        const existingNames = existingCafes.map(c => c.name);
        const missingCafes = sampleCafes.filter(cafe => !existingNames.includes(cafe.name));
        
        console.log('Missing cafes:', missingCafes.map(c => c.name));
        
        if (missingCafes.length === 0) {
            showToast('All cafes are already in the database!', 'info');
            return;
        }
        
        // Add missing cafes
        for (const cafe of missingCafes) {
            try {
                const newId = await window.addCafeToDatabase(cafe);
                console.log(`✓ Added missing cafe "${cafe.name}" with ID: ${newId}`);
            } catch (error) {
                console.error(`✗ Error adding cafe ${cafe.name}:`, error);
            }
        }
        
        // Reload cafes
        await loadCafes();
        
        showToast(`Added ${missingCafes.length} missing cafes to database!`, 'success');
        
    } catch (error) {
        console.error('Error adding missing cafes:', error);
        showToast('Error adding missing cafes. Please try again.', 'error');
    }
} 

// Change trending cafe (call this weekly)
function setTrendingCafe(newCafeId) {
    trendingCafeId = newCafeId;
    
    // Update map markers
    addCafeMarkers();
    
    // Update trending spot display
    updateTrendingSpot();
    
    // Update stats
    updateStats();
    
    console.log(`Trending cafe changed to ID: ${trendingCafeId}`);
    showToast(`Trending spot updated!`, 'success');
} 