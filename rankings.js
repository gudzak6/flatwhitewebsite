// rankings.js
// Rankings by best review (average rating)

// Star rendering (copied from library.js)
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

// Load and display rankings
async function loadRankings() {
    const rankingsList = document.getElementById('rankingsList');
    rankingsList.innerHTML = '<div class="text-center py-8"><div class="loading loading-spinner loading-lg text-coffee-600"></div><p class="text-coffee-700 mt-4">Loading rankings...</p></div>';

    try {
        const cafesSnapshot = await db.collection('cafes').get();
        let cafes = [];
        cafesSnapshot.forEach(doc => {
            const data = doc.data();
            cafes.push({
                id: doc.id,
                name: data.name,
                address: data.address,
                rating: typeof data.rating === 'number' ? data.rating : 0,
                reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : 0
            });
        });
        // Sort by rating descending, then by review count
        cafes.sort((a, b) => {
            if (b.rating !== a.rating) return b.rating - a.rating;
            return b.reviewCount - a.reviewCount;
        });
        rankingsList.innerHTML = '';
        if (cafes.length === 0) {
            rankingsList.innerHTML = '<div class="text-center text-coffee-700">No cafes found.</div>';
            return;
        }
        cafes.forEach((cafe, idx) => {
            rankingsList.appendChild(createRankingCard(cafe, idx + 1));
        });
    } catch (err) {
        rankingsList.innerHTML = '<div class="text-center text-red-600">Error loading rankings.</div>';
        console.error('Error loading rankings:', err);
    }
}

// Create a ranking card for a cafe (no voting UI)
function createRankingCard(cafe, rank) {
    const card = document.createElement('div');
    card.className = 'card bg-base-100 shadow-md flex flex-row items-center gap-4 p-2 sm:p-4';
    card.innerHTML = `
        <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
                <span class="badge badge-neutral">#${rank}</span>
                <span class="font-semibold text-base sm:text-lg">${cafe.name}</span>
            </div>
            <div class="text-sm text-coffee-700 mb-1">${cafe.address || ''}</div>
            <div class="flex items-center gap-2">
                <div class="rating rating-sm">${generateStars(cafe.rating)}</div>
                <span class="text-coffee-700 text-sm">${cafe.rating ? cafe.rating.toFixed(1) : 'N/A'} (${cafe.reviewCount} reviews)</span>
            </div>
        </div>
    `;
    return card;
}

// On page load
window.addEventListener('DOMContentLoaded', loadRankings); 