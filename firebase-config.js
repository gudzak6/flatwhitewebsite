// Firebase configuration using compat version
// No imports needed - using global Firebase object

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyCYWO9UI_hdYyAfvMSn-Mce0Oe947dihhg",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "flatwhitewebsite.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "flatwhitewebsite",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "flatwhitewebsite.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "348416375349",
  appId: process.env.FIREBASE_APP_ID || "1:348416375349:web:1fbcfddfb3896cfe3b4f7c",
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
        const querySnapshot = await db.collection("reviews")
            .where("cafeId", "==", cafeId)
            // Removed orderBy to avoid index requirement - will sort in JavaScript
            .get();
        const reviews = [];
        querySnapshot.forEach((doc) => {
            reviews.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort reviews by createdAt date in JavaScript instead of Firestore
        reviews.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt.toDate ? a.createdAt.toDate() : a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt.toDate ? b.createdAt.toDate() : b.createdAt) : new Date(0);
            return dateB - dateA; // Descending order (newest first)
        });
        
        return reviews;
    } catch (error) {
        console.error("Error getting reviews: ", error);
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