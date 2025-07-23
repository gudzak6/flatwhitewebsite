// add-new-coffee-spots.js
// Script to add new coffee shops to Firebase Firestore, skipping existing ones by name
// Usage: node add-new-coffee-spots.js

const fs = require('fs');
const path = require('path');
const firebase = require('firebase/compat/app');
require('firebase/compat/firestore');

// Firebase config (copy from firebase-config.js)
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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Read and parse coffees.txt
const csvPath = path.join(__dirname, 'coffees.txt');
const csvData = fs.readFileSync(csvPath, 'utf8');
const lines = csvData.trim().split('\n');
const headers = lines[0].split(',').map(h => h.trim());
const cafes = lines.slice(1).map(line => {
  const parts = line.split(',');
  const name = parts[0].trim();
  const address = parts[1].trim();
  let lat, lng;

  // Try to parse coordinates from bracketed array at the end
  const bracketMatch = line.match(/\[([^\]]+)\]/);
  if (bracketMatch) {
    const coords = bracketMatch[1].split(',').map(Number);
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      lat = coords[0];
      lng = coords[1];
    }
  } else if (parts.length >= 5) {
    lat = parseFloat(parts[3]);
    lng = parseFloat(parts[4]);
  }

  let coordinates = undefined;
  if (!isNaN(lat) && !isNaN(lng)) {
    coordinates = [lng, lat]; // Always [lng, lat]
  }
  return {
    name,
    address,
    coordinates
  };
});

(async () => {
  try {
    // Fetch all existing cafes
    const snapshot = await db.collection('cafes').get();
    const existingNames = new Set();
    snapshot.forEach(doc => {
      if (doc.data().name) {
        existingNames.add(doc.data().name.trim().toLowerCase());
      }
    });

    let added = 0, skipped = 0;
    for (const cafe of cafes) {
      const nameKey = cafe.name.trim().toLowerCase();
      if (existingNames.has(nameKey)) {
        console.log(`Skipping existing cafe: ${cafe.name}`);
        skipped++;
        continue;
      }
      if (!cafe.coordinates) {
        console.warn(`Skipping cafe with missing or invalid coordinates: ${cafe.name}`);
        skipped++;
        continue;
      }
      // Prepare Firestore doc
      const cafeDoc = {
        name: cafe.name,
        address: cafe.address,
        coordinates: cafe.coordinates,
        rating: 0,
        reviewCount: 0,
        createdAt: new Date()
      };
      await db.collection('cafes').add(cafeDoc);
      console.log(`Added new cafe: ${cafe.name}`);
      added++;
    }
    console.log(`\nDone! Added: ${added}, Skipped: ${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating cafes:', err);
    process.exit(1);
  }
})(); 