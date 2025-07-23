// delete-cafes-by-name.js
// Script to delete cafes from Firebase by name using coffees.txt
// Usage: node delete-cafes-by-name.js

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
const cafeNames = lines.slice(1).map(line => line.split(',')[0].trim().toLowerCase());

(async () => {
  try {
    const snapshot = await db.collection('cafes').get();
    let deleted = 0, notFound = 0;
    for (const name of cafeNames) {
      const match = snapshot.docs.find(doc => (doc.data().name || '').trim().toLowerCase() === name);
      if (match) {
        await db.collection('cafes').doc(match.id).delete();
        console.log(`Deleted cafe: ${match.data().name}`);
        deleted++;
      } else {
        console.warn(`Cafe not found in Firebase: ${name}`);
        notFound++;
      }
    }
    console.log(`\nDone! Deleted: ${deleted}, Not found: ${notFound}`);
    process.exit(0);
  } catch (err) {
    console.error('Error deleting cafes:', err);
    process.exit(1);
  }
})(); 