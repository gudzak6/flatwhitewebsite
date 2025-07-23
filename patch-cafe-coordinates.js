// patch-cafe-coordinates.js
// Script to patch missing/invalid coordinates in Firebase cafes using coffees.txt
// Usage: node patch-cafe-coordinates.js

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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Read and parse coffees.txt
const csvPath = path.join(__dirname, 'coffees.txt');
const csvData = fs.readFileSync(csvPath, 'utf8');
const lines = csvData.trim().split('\n');
const cafesFromFile = {};
lines.slice(1).forEach(line => {
  const parts = line.split(',');
  const name = parts[0].trim();
  // Try to parse coordinates from bracketed array or separate columns
  let lat, lng;
  if (parts.length >= 5 && parts[4].includes('[')) {
    // Format: ..., [lat, lng]
    const coordMatch = parts[4].match(/\[\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\]/);
    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lng = parseFloat(coordMatch[2]);
    }
  } else if (parts.length >= 5) {
    lat = parseFloat(parts[3]);
    lng = parseFloat(parts[4]);
  } else if (parts.length >= 4) {
    lat = parseFloat(parts[2]);
    lng = parseFloat(parts[3]);
  }
  let coordinates = undefined;
  if (!isNaN(lat) && !isNaN(lng)) {
    coordinates = [lng, lat];
  }
  cafesFromFile[name.toLowerCase()] = { name, coordinates };
});

(async () => {
  try {
    const snapshot = await db.collection('cafes').get();
    let updated = 0, skipped = 0;
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const nameKey = (data.name || '').trim().toLowerCase();
      const hasValidCoords = Array.isArray(data.coordinates) && data.coordinates.length === 2 &&
        typeof data.coordinates[0] === 'number' && typeof data.coordinates[1] === 'number';
      if (hasValidCoords) {
        skipped++;
        continue;
      }
      const fileCafe = cafesFromFile[nameKey];
      if (fileCafe && fileCafe.coordinates) {
        await db.collection('cafes').doc(doc.id).update({ coordinates: fileCafe.coordinates });
        console.log(`Updated coordinates for: ${data.name}`);
        updated++;
      } else {
        console.warn(`No coordinates found in file for: ${data.name}`);
        skipped++;
      }
    }
    console.log(`\nDone! Updated: ${updated}, Skipped: ${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error('Error patching cafes:', err);
    process.exit(1);
  }
})(); 