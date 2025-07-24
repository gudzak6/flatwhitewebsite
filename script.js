// Global variables
let map;
let currentLocation = null;
let cafes = [];
let selectedCafe = null;
let currentRating = 0;
let placesService = null;

// Set trendingCafeId to null initially (will be set after loading from Firebase)
let trendingCafeId = null;

// Search panel state
let currentTab = 'top-ranked'; // 'top-ranked' or 'nearby'
let nearbyCafes = [];
let topRankedCafes = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initializing Flat White Finder...');
    initializeMap();
    await loadCafes(); // Wait for cafes to load
    setupEventListeners();
    await updateStats();
    initializePlacesService();
    
    // Initialize search panel with top ranked cafes
    await loadTopRankedCafes();
    
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
        const ratingSpan = trendingSection.querySelector('.text-coffee-700');
        const viewButton = trendingSection.querySelector('button');

        if (title) title.textContent = trendingCafe.name;
        if (description) description.textContent = `This week's trending spot for the perfect flat white`;
        if (ratingSpan) ratingSpan.textContent = `${trendingCafe.rating} (${trendingCafe.reviewCount} reviews)`;
        if (viewButton) viewButton.onclick = () => openCafeDetails(trendingCafe.id);
    }
}

// Load cafes from Firebase database
async function loadCafes() {
    try {
        // Check if Firebase functions are available
        if (typeof window.getCafesFromDatabase !== 'function') {
            console.error('Firebase not ready. Cannot load cafes.');
            cafes = [];
            addCafeMarkers();
            await updateStats();
            return;
        }

        console.log('Loading cafes from database...');
        const databaseCafes = await window.getCafesFromDatabase();

        console.log('Database cafes loaded:', databaseCafes.length);
        console.log('Database cafe IDs:', databaseCafes.map(c => ({ id: c.id, name: c.name, type: typeof c.id })));

        cafes = databaseCafes;
        // Set trendingCafeId to the first cafe if available
        trendingCafeId = cafes.length > 0 ? cafes[0].id : null;

        // Update the map with cafes
        addCafeMarkers();
        await updateStats();
        updateTrendingSpot();
    } catch (error) {
        console.error('Error loading cafes:', error);
        showToast('Error loading cafes from database', 'error');
        cafes = [];
        addCafeMarkers();
        await updateStats();
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
            markerEl.innerHTML = '<i class="fas fa-star"></i>';
        }

        // Create the main details popup (on click)
        const detailsPopup = new mapboxgl.Popup({ offset: 25 });
        detailsPopup.setHTML(`
            <div style="min-width:140px;display:flex;flex-direction:column;align-items:flex-start;gap:8px;">
                <div style="font-weight:600; color:#333; font-size:1rem;">${cafe.name}</div>
                <div style="color:#8B4513; font-size:0.95rem;">Rating: ${cafe.rating ? cafe.rating.toFixed(1) : 'N/A'}</div>
                <button onclick="event.stopPropagation(); openReviewModalFromMap('${cafe.id}')" style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: white; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-size: 0.9rem;">Add Review</button>
            </div>
        `);
        detailsPopup.on('open', () => {
            const closeBtn = document.querySelector('.custom-popup-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => detailsPopup.remove());
            }
        });

        // Add marker to map
        new mapboxgl.Marker(markerEl)
            .setLngLat(cafe.coordinates)
            .setPopup(detailsPopup)
            .addTo(map);
    });
}

// Helper to open review modal from map marker popup
function openReviewModalFromMap(cafeId) {
    selectedCafe = cafes.find(cafe => cafe.id === cafeId);
    if (!selectedCafe) return;
    // Ensure reviews is always an array
    if (!Array.isArray(selectedCafe.reviews)) selectedCafe.reviews = [];
    // Update modal content for review
    const cafeNameEl = document.getElementById('reviewCafeName');
    if (cafeNameEl) {
        cafeNameEl.textContent = selectedCafe.name;
    } else {
        console.error('reviewCafeName element not found in DOM!');
    }
    // (Removed rating block logic)
    document.getElementById('cafeScore').textContent = selectedCafe.rating ? selectedCafe.rating.toFixed(1) : 'N/A';
    document.getElementById('reviewCount').textContent = `(${selectedCafe.reviewCount || 0} reviews)`;
    document.getElementById('cafeAddress').textContent = selectedCafe.address;
    document.getElementById('cafePhone').textContent = selectedCafe.phone || 'No phone available';
    document.getElementById('cafeHours').textContent = selectedCafe.hours || 'Hours not available';
    updateCafeModalStars(selectedCafe.rating);
    // Open the review modal directly
    openReviewForm();
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
        if (!Array.isArray(selectedCafe.reviews)) selectedCafe.reviews = [];
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
    
    console.log('Requesting location permission...');
    
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
            currentLocation = { lat: latitude, lng: longitude };
            
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
                .setLngLat([longitude, latitude])
                .addTo(map);
            
            // Fly to user location
            map.flyTo({
                center: [longitude, latitude],
                zoom: 14
            });
            
            console.log('Location updated! Found your position.');
            
            // Update map stats
            updateMapStats();
            
            // If currently on nearby tab, refresh the nearby cafes
            if (currentTab === 'nearby') {
                loadNearbyCafes();
            }
            
            showToast('Location found! Check the "Nearby" tab for cafes close to you.', 'success');
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
        
        console.log(`Found ${filteredCafes.length} cafes`);
    } else {
        // Show all cafes if no results
        addCafeMarkers();
        console.log('No cafes found');
    }
}

// Update stats
async function updateStats() {
    const totalCafes = cafes.length;
    let totalReviews = 0;
    try {
        if (typeof window.getAllReviewsFromDatabase === 'function') {
            const allReviews = await window.getAllReviewsFromDatabase();
            totalReviews = allReviews.length;
        } else {
            // Fallback: sum reviewCount from cafes
            totalReviews = cafes.reduce((sum, cafe) => sum + cafe.reviewCount, 0);
        }
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        totalReviews = cafes.reduce((sum, cafe) => sum + cafe.reviewCount, 0);
    }
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
    
    console.log('Using New York City as default location');
    
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
        await updateStats();
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
        console.log('Updating database with all 16 cafes...');
        
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
        console.log('Adding missing cafes to database...');
        
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
async function setTrendingCafe(newCafeId) {
    trendingCafeId = newCafeId;
    
    // Update map markers
    addCafeMarkers();
    
    // Update trending spot display
    updateTrendingSpot();
    
    // Update stats
    await updateStats();
    
    console.log(`Trending cafe changed to ID: ${newCafeId}`);
    showToast(`Trending spot updated!`, 'success');
}

// Search Panel Functions
function showTopRanked() {
    currentTab = 'top-ranked';
    updateTabButtons();
    loadTopRankedCafes();
}

function showNearby() {
    currentTab = 'nearby';
    updateTabButtons();
    loadNearbyCafes();
}

function updateTabButtons() {
    const topRankedBtn = document.querySelector('button[onclick="showTopRanked()"]');
    const nearbyBtn = document.querySelector('button[onclick="showNearby()"]');
    
    if (currentTab === 'top-ranked') {
        topRankedBtn.className = 'btn btn-xs bg-coffee-600 text-white border-coffee-600 hover:bg-coffee-700';
        nearbyBtn.className = 'btn btn-xs btn-outline border-coffee-600 text-coffee-600 hover:bg-coffee-600 hover:text-white';
    } else {
        topRankedBtn.className = 'btn btn-xs btn-outline border-coffee-600 text-coffee-600 hover:bg-coffee-600 hover:text-white';
        nearbyBtn.className = 'btn btn-xs bg-coffee-600 text-white border-coffee-600 hover:bg-coffee-700';
    }
}

async function loadTopRankedCafes() {
    try {
        // Sort cafes by rating (highest first) and review count
        topRankedCafes = cafes
            .filter(cafe => cafe.rating && cafe.reviewCount > 0)
            .sort((a, b) => {
                // Sort by rating first, then by review count
                if (b.rating !== a.rating) {
                    return b.rating - a.rating;
                }
                return b.reviewCount - a.reviewCount;
            })
            .slice(0, 10); // Get top 10
        
        await displayCafesInPanel(topRankedCafes, 'Top Ranked Cafes');
    } catch (error) {
        console.error('Error loading top ranked cafes:', error);
        showToast('Error loading top ranked cafes', 'error');
    }
}

async function loadNearbyCafes() {
    try {
        if (!currentLocation) {
            // If no location, show message to get location
            await displayCafesInPanel([], 'Nearby Cafes', 'Please use "My Location" to find cafes near you.');
            return;
        }

        // Calculate distances and sort by proximity
        nearbyCafes = cafes
            .filter(cafe => cafe.coordinates && cafe.coordinates.length === 2)
            .map(cafe => {
                const distance = calculateDistance(
                    currentLocation.lat,
                    currentLocation.lng,
                    cafe.coordinates[1], // lat
                    cafe.coordinates[0]  // lng
                );
                return { ...cafe, distance };
            })
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10); // Get closest 10
        
        await displayCafesInPanel(nearbyCafes, 'Nearby Cafes');
    } catch (error) {
        console.error('Error loading nearby cafes:', error);
        showToast('Error loading nearby cafes', 'error');
    }
}

async function displayCafesInPanel(cafesToShow, title, message = null) {
    const container = document.getElementById('reviewsContainer');
    if (!container) return;

    if (message) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-map-marker-alt text-4xl text-coffee-400 mb-4"></i>
                <p class="text-coffee-600">${message}</p>
            </div>
        `;
        return;
    }

    if (cafesToShow.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-coffee text-4xl text-coffee-400 mb-4"></i>
                <p class="text-coffee-600">No cafes found</p>
            </div>
        `;
        return;
    }

    // Load reviews for each cafe
    const cafesWithReviews = await Promise.all(cafesToShow.map(async (cafe) => {
        try {
            const reviews = await window.getReviewsFromDatabase(cafe.id);
            return {
                ...cafe,
                reviews: reviews.slice(0, 3) // Get top 3 reviews
            };
        } catch (error) {
            console.error(`Error loading reviews for ${cafe.name}:`, error);
            return {
                ...cafe,
                reviews: []
            };
        }
    }));

    container.innerHTML = cafesWithReviews.map((cafe, index) => `
        <div class="bg-white rounded-lg p-3 shadow-sm border border-coffee-100">
            <div class="flex-1">
                <div class="mb-2">
                    <h4 class="font-bold text-coffee-800">${cafe.name}</h4>
                    <p class="text-sm text-coffee-600">${cafe.address}</p>
                    ${cafe.distance ? `<p class="text-xs text-coffee-500">${cafe.distance.toFixed(1)} km away</p>` : ''}
                </div>
                ${cafe.reviews && cafe.reviews.length > 0 ? `
                    <div class="mb-2 flex items-center gap-2">
                        <div class="rating rating-sm">${generateStars(cafe.rating)}</div>
                        <span class="text-coffee-700 text-sm">${cafe.rating ? cafe.rating.toFixed(1) : 'N/A'} (${cafe.reviewCount || 0} reviews)</span>
                    </div>
                ` : ''}
                <!-- Top 3 Reviews or Empty State -->
                ${cafe.reviews && cafe.reviews.length > 0 ? `
                    <div class="mb-3">
                        <h5 class="text-xs font-semibold text-coffee-700 mb-2">Top Reviews:</h5>
                        <div class="space-y-2">
                            ${cafe.reviews.map(review => `
                                <div class="bg-coffee-50 rounded p-2">
                                    <div class="flex items-center gap-2 mb-1">
                                        <div class="flex text-yellow-400 text-xs">
                                            ${generateStars(review.rating)}
                                        </div>
                                        <span class="text-xs text-coffee-600">${review.rating}/5</span>
                                    </div>
                                    <p class="text-xs text-coffee-800 mb-1">"${review.text}"</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="mb-3 flex flex-col items-center text-center">
                        <i class="fas fa-mug-hot text-2xl text-coffee-300 mb-1"></i>
                        <p class="text-xs text-coffee-500 italic">No reviews yet</p>
                        <button class="btn btn-xs btn-coffee mt-2" onclick="openReviewModalFromMap('${cafe.id}')">
                            <i class="fas fa-star mr-1"></i>Be the first to review
                        </button>
                    </div>
                `}
                <div class="flex items-center justify-between mt-2">
                    <button class="btn btn-xs btn-outline btn-coffee" onclick="openCafeDetails('${cafe.id}')">
                        <i class="fas fa-eye mr-1"></i>View Details
                    </button>
                    ${cafe.reviews && cafe.reviews.length > 0 ? `
                        <button class="btn btn-xs btn-coffee" onclick="openReviewModalFromMap('${cafe.id}')">
                            <i class="fas fa-star mr-1"></i>Add Review
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
}

function voteUp(cafeId) {
    // This would integrate with your existing voting system
    console.log('Voting up cafe:', cafeId);
    // You can integrate this with the rankings.js voting system
    showToast('Vote recorded!', 'success');
}

function voteDown(cafeId) {
    // This would integrate with your existing voting system
    console.log('Voting down cafe:', cafeId);
    // You can integrate this with the rankings.js voting system
    showToast('Vote recorded!', 'success');
}

 