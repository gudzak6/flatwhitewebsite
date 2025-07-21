// Firebase configuration using compat version
// No imports needed - using global Firebase object

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCYWO9UI_hdYyAfvMSn-Mce0Oe947dihhg",
  authDomain: "flatwhitewebsite.firebaseapp.com",
  projectId: "flatwhitewebsite",
  storageBucket: "flatwhitewebsite.firebasestorage.app",
  messagingSenderId: "348416375349",
  appId: "1:348416375349:web:1fbcfddfb3896cfe3b4f7c",
  measurementId: "G-3BB70RKTQ5"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const analytics = firebase.analytics(app);
const db = firebase.firestore(app);

// Database functions
const addCafeToDatabase = async (cafeData) => {
    try {
        const docRef = await db.collection("cafes").add({
            ...cafeData,
            createdAt: new Date(),
            rating: 0,
            reviewCount: 0
        });
        console.log("Cafe added with ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error adding cafe: ", error);
        throw error;
    }
};

const getCafesFromDatabase = async () => {
    try {
        const querySnapshot = await db.collection("cafes").get();
        const cafes = [];
        querySnapshot.forEach((doc) => {
            cafes.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return cafes;
    } catch (error) {
        console.error("Error getting cafes: ", error);
        throw error;
    }
};

const addReviewToDatabase = async (cafeId, reviewData) => {
    try {
        const docRef = await db.collection("reviews").add({
            cafeId: cafeId,
            ...reviewData,
            createdAt: new Date()
        });
        console.log("Review added with ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error adding review: ", error);
        throw error;
    }
};

const getReviewsFromDatabase = async (cafeId) => {
    try {
        console.log("Fetching reviews for cafe ID:", cafeId);
        console.log("Firebase db object:", db);
        
        const querySnapshot = await db.collection("reviews")
            .where("cafeId", "==", cafeId)
            // Removed orderBy to avoid index requirement - will sort in JavaScript
            .get();
        
        console.log("Query snapshot:", querySnapshot);
        console.log("Number of reviews found:", querySnapshot.size);
        
        const reviews = [];
        querySnapshot.forEach((doc) => {
            const reviewData = {
                id: doc.id,
                ...doc.data()
            };
            console.log("Review data:", reviewData);
            reviews.push(reviewData);
        });
        
        // Sort reviews by createdAt date in JavaScript instead of Firestore
        reviews.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt.toDate ? a.createdAt.toDate() : a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt.toDate ? b.createdAt.toDate() : b.createdAt) : new Date(0);
            return dateB - dateA; // Descending order (newest first)
        });
        
        console.log("Final sorted reviews:", reviews);
        return reviews;
    } catch (error) {
        console.error("Error getting reviews: ", error);
        console.error("Error details:", {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        throw error;
    }
};

const updateCafeRating = async (cafeId, newRating, newReviewCount) => {
    try {
        await db.collection("cafes").doc(cafeId).update({
            rating: newRating,
            reviewCount: newReviewCount
        });
        console.log("Cafe rating updated");
    } catch (error) {
        console.error("Error updating cafe rating: ", error);
        throw error;
    }
};

// Make functions globally available
window.addCafeToDatabase = addCafeToDatabase;
window.getCafesFromDatabase = getCafesFromDatabase;
window.addReviewToDatabase = addReviewToDatabase;
window.getReviewsFromDatabase = getReviewsFromDatabase;
window.updateCafeRating = updateCafeRating;

// Debug: Check if functions are available
console.log('Firebase functions loaded:', {
    addCafeToDatabase: typeof window.addCafeToDatabase,
    getCafesFromDatabase: typeof window.getCafesFromDatabase,
    addReviewToDatabase: typeof window.addReviewToDatabase,
    getReviewsFromDatabase: typeof window.getReviewsFromDatabase,
    updateCafeRating: typeof window.updateCafeRating
}); 