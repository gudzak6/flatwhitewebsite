// Global variables
let cafes = [];
let filteredCafes = [];
let selectedCafe = null;
let currentFilter = 'all';

// Initialize the library page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Library page initialized');
    loadCafes();
    setupEventListeners();
});

// Load cafes from Firebase
async function loadCafes() {
    console.log('Loading cafes for library...');
    
    try {
        // Show loading state
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('cafesContainer').innerHTML = '';
        
        // Load cafes from Firebase
        const cafesData = await window.getCafesFromDatabase();
        
        // Transform the data to match our format
        cafes = cafesData.map(cafe => ({
            id: cafe.id,
            name: cafe.name,
            address: cafe.address,
            phone: cafe.phone || '',
            hours: cafe.hours || '',
            rating: cafe.rating || 0,
            reviewCount: cafe.reviewCount || 0,
            coordinates: cafe.coordinates || null
        }));
        
        console.log('Loaded cafes:', cafes.length);
        
        // Set filtered cafes to all cafes initially
        filteredCafes = [...cafes];
        
        // Update stats
        updateStats();
        
        // Display cafes
        displayCafes();
        
        // Hide loading state
        document.getElementById('loadingState').classList.add('hidden');
        
    } catch (error) {
        console.error('Error loading cafes:', error);
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('emptyState').classList.remove('hidden');
        showToast('Error loading cafes. Please try again.', 'error');
    }
}

// Display cafes in the grid
function displayCafes() {
    const container = document.getElementById('cafesContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredCafes.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    container.innerHTML = '';
    
    filteredCafes.forEach(cafe => {
        const cafeCard = createCafeCard(cafe);
        container.appendChild(cafeCard);
    });
}

// Create a cafe card element
function createCafeCard(cafe) {
    const card = document.createElement('div');
    card.className = 'card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer';
    card.onclick = () => openCafeDetails(cafe.id);
    
    // Generate star rating HTML
    const stars = generateStars(cafe.rating);
    
    card.innerHTML = `
        <div class="card-body">
            <div class="flex justify-between items-start mb-3">
                <h3 class="card-title text-coffee-800 text-lg">${cafe.name}</h3>
                <div class="badge badge-coffee">${cafe.rating.toFixed(1)}</div>
            </div>
            
            <div class="flex items-center gap-2 mb-3">
                <div class="rating rating-sm">
                    ${stars}
                </div>
                <span class="text-sm text-coffee-600">(${cafe.reviewCount} reviews)</span>
            </div>
            
            <div class="space-y-2 text-sm text-gray-600">
                <div class="flex items-center gap-2">
                    <i class="fas fa-map-marker-alt text-coffee-500"></i>
                    <span>${cafe.address}</span>
                </div>
                ${cafe.phone ? `
                <div class="flex items-center gap-2">
                    <i class="fas fa-phone text-coffee-500"></i>
                    <span>${cafe.phone}</span>
                </div>
                ` : ''}
                ${cafe.hours ? `
                <div class="flex items-start gap-2">
                    <i class="fas fa-clock text-coffee-500 mt-0.5"></i>
                    <span class="text-xs">${cafe.hours}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="card-actions justify-end mt-4">
                <button class="btn btn-sm btn-coffee" onclick="event.stopPropagation(); openCafeDetails('${cafe.id}')">
                    <i class="fas fa-eye mr-1"></i>View Details
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Generate star rating HTML
function generateStars(rating) {
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

// Search cafes
function searchCafes() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    console.log('Searching for:', query);
    
    if (!query) {
        filteredCafes = [...cafes];
    } else {
        filteredCafes = cafes.filter(cafe => 
            cafe.name.toLowerCase().includes(query) ||
            cafe.address.toLowerCase().includes(query)
        );
    }
    
    displayCafes();
    showToast(`Found ${filteredCafes.length} cafes`, 'info');
}

// Filter cafes by rating
function filterCafes() {
    const ratingFilter = document.getElementById('ratingFilter').value;
    const searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
    
    let filtered = [...cafes];
    
    // Apply search filter
    if (searchQuery) {
        filtered = filtered.filter(cafe => 
            cafe.name.toLowerCase().includes(searchQuery) ||
            cafe.address.toLowerCase().includes(searchQuery)
        );
    }
    
    // Apply rating filter
    if (ratingFilter) {
        const minRating = parseFloat(ratingFilter);
        filtered = filtered.filter(cafe => cafe.rating >= minRating);
    }
    
    filteredCafes = filtered;
    displayCafes();
}

// Sort cafes
function sortCafes() {
    const sortBy = document.getElementById('sortBy').value;
    
    filteredCafes.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'rating':
                return b.rating - a.rating;
            case 'reviews':
                return b.reviewCount - a.reviewCount;
            default:
                return 0;
        }
    });
    
    displayCafes();
}

// Update stats
function updateStats() {
    const totalCafes = cafes.length;
    const totalReviews = cafes.reduce((sum, cafe) => sum + cafe.reviewCount, 0);
    const avgRating = cafes.length > 0 
        ? Math.round((cafes.reduce((sum, cafe) => sum + cafe.rating, 0) / cafes.length) * 10) / 10
        : 0;

    document.getElementById('totalCafes').textContent = totalCafes;
    document.getElementById('totalReviews').textContent = totalReviews;
    document.getElementById('avgRating').textContent = avgRating;
}

// Open cafe details modal
async function openCafeDetails(cafeId) {
    console.log('Opening cafe details for:', cafeId);
    
    selectedCafe = cafes.find(cafe => cafe.id === cafeId);
    if (!selectedCafe) {
        showToast('Cafe not found', 'error');
        return;
    }
    
    // Update modal content
    document.getElementById('cafeName').textContent = selectedCafe.name;
    document.getElementById('cafeScore').textContent = selectedCafe.rating.toFixed(1);
    document.getElementById('reviewCount').textContent = `(${selectedCafe.reviewCount} reviews)`;
    document.getElementById('cafeAddress').textContent = selectedCafe.address;
    document.getElementById('cafePhone').textContent = selectedCafe.phone || 'No phone available';
    document.getElementById('cafeHours').textContent = selectedCafe.hours || 'Hours not available';
    
    // Update star rating display
    updateCafeModalStars(selectedCafe.rating);
    
    // Load reviews
    await loadReviews();
    
    // Open modal
    const modal = document.getElementById('cafeModal');
    modal.showModal();
}

// Update cafe modal stars
function updateCafeModalStars(rating) {
    const ratingContainer = document.querySelector('#cafeModal .rating');
    ratingContainer.innerHTML = '';
    
    for (let i = 1; i <= 5; i++) {
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'rating-2';
        input.className = 'mask mask-star-2 bg-orange-400';
        input.disabled = true;
        if (i <= rating) {
            input.checked = true;
        }
        ratingContainer.appendChild(input);
    }
}

// Load reviews for selected cafe
async function loadReviews() {
    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = '<div class="text-center"><div class="loading"></div><p class="text-sm text-coffee-600 mt-2">Loading reviews...</p></div>';

    try {
        // Load reviews from Firebase
        const reviews = await window.getReviewsFromDatabase(selectedCafe.id);
        
        // Update local cafe object with reviews from database
        selectedCafe.reviews = reviews.map(review => ({
            ...review,
            id: review.id,
            date: review.createdAt ? new Date(review.createdAt.toDate()).toISOString().split('T')[0] : review.date
        }));
        
        // Update the display with the loaded reviews
        updateReviewsDisplay();
    } catch (error) {
        console.error('Error loading reviews:', error);
        reviewsList.innerHTML = '<p class="text-center text-red-600">Error loading reviews. Please try again.</p>';
    }
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
    
    // Reset form
    document.getElementById('reviewForm').reset();
    
    // Open modal
    const modal = document.getElementById('reviewModal');
    modal.showModal();
}

// Close review modal
function closeReviewModal() {
    const modal = document.getElementById('reviewModal');
    modal.close();
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
        document.getElementById('cafeScore').textContent = selectedCafe.rating.toFixed(1);
        document.getElementById('reviewCount').textContent = `(${selectedCafe.reviewCount} reviews)`;
        updateCafeModalStars(selectedCafe.rating);
        
        // Update reviews display directly with the new review
        updateReviewsDisplay();
        
        // Refresh the library page to show updated stats
        await loadCafes();
        
        showToast('Review submitted successfully!', 'success');
    } catch (error) {
        console.error('Error submitting review:', error);
        showToast('Error submitting review. Please try again.', 'error');
    } finally {
        // Reset button state
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

// Calculate average rating
function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
}

// Add cafe modal functions
function openAddCafeModal() {
    const modal = document.getElementById('addCafeModal');
    modal.showModal();
}

function closeAddCafeModal() {
    const modal = document.getElementById('addCafeModal');
    modal.close();
}

// Submit new cafe
async function submitCafe(event) {
    event.preventDefault();
    
    const name = document.getElementById('cafeName').value.trim();
    const address = document.getElementById('cafeAddress').value.trim();
    const phone = document.getElementById('cafePhone').value.trim();
    const hours = document.getElementById('cafeHours').value.trim();
    
    if (!name || !address) {
        showToast('Please fill in cafe name and address', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading loading-spinner loading-sm"></div> Adding...';
    submitBtn.disabled = true;
    
    try {
        // Geocode the address to get coordinates
        const coordinates = await geocodeAddress(address);
        
        const cafeData = {
            name: name,
            address: address,
            phone: phone,
            hours: hours,
            coordinates: coordinates,
            rating: 0,
            reviewCount: 0
        };
        
        // Add to Firebase
        await window.addCafeToDatabase(cafeData);
        
        // Close modal and refresh
        closeAddCafeModal();
        await loadCafes();
        
        showToast('Cafe added successfully!', 'success');
    } catch (error) {
        console.error('Error adding cafe:', error);
        showToast('Error adding cafe. Please try again.', 'error');
    } finally {
        // Reset button state
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

// Geocode address using Mapbox
async function geocodeAddress(address) {
    const baseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
    const encodedAddress = encodeURIComponent(address);
    const url = `${baseUrl}/${encodedAddress}.json?access_token=${mapboxgl.accessToken}&limit=1`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
            return data.features[0].center; // [longitude, latitude]
        } else {
            // Return default NYC coordinates if geocoding fails
            return [-74.006, 40.7128];
        }
    } catch (error) {
        console.error('Geocoding failed:', error);
        // Return default NYC coordinates
        return [-74.006, 40.7128];
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} shadow-lg mb-2 max-w-sm`;
    toast.innerHTML = `
        <div>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(toast);
    
    // Remove toast after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Search input event listener
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchCafes();
            }
        });
    }
    
    // Close modals when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.close();
            }
        });
    });
} 

 