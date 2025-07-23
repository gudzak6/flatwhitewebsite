// Standalone script to update Firebase database with all 16 cafes
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// Go to Project Settings > Service Accounts > Generate New Private Key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// All 16 cafes data
const allCafes = [
    {
        name: "SoHo",
        address: "284 Lafayette St, 10012 New York, United States",
        phone: "(555) 123-4567",
        hours: "Monday - Friday: 7AM - 8PM, Saturday - Sunday: 8AM - 8PM",
        coordinates: [-73.9954, 40.7234],
        rating: 4.8,
        reviewCount: 24,
        createdAt: new Date()
    },
    {
        name: "East Village - Bakery",
        address: "152 2nd Ave, 10003 New York, United States",
        phone: "(555) 234-5678",
        hours: "Monday - Friday: 7AM - 8PM, Saturday - Sunday: 8AM - 8PM",
        coordinates: [-73.9881, 40.7308],
        rating: 4.5,
        reviewCount: 18,
        createdAt: new Date()
    },
    {
        name: "Bushwick - Roastery",
        address: "1329 Willoughby Ave Unit #161, Brooklyn, New York 11237, United States",
        phone: "(555) 345-6789",
        hours: "Monday - Friday: 8AM - 6PM, Saturday - Sunday: 8AM - 6PM",
        coordinates: [-73.9072, 40.7089],
        rating: 4.9,
        reviewCount: 31,
        createdAt: new Date()
    },
    {
        name: "Cooper Square",
        address: "35 Cooper Sq, New York, NY 10003",
        phone: "(555) 456-7890",
        hours: "Monday - Friday: 7:30 AM - 4:30 PM, Saturday & Sunday: 8:00 AM - 5:00 PM",
        coordinates: [-73.9907, 40.7289],
        rating: 4.7,
        reviewCount: 15,
        createdAt: new Date()
    },
    {
        name: "Watch House",
        address: "660 5th Ave, New York, NY 10103, United States",
        phone: "(555) 567-8901",
        hours: "Monday - Friday: 7:00 AM - 6:00 PM, Saturday - Sunday: 9:00 AM - 6:30 PM",
        coordinates: [-73.976582, 40.760182],
        rating: 0,
        reviewCount: 0,
        createdAt: new Date()
    },
    {
        name: "Café Kitsune",
        address: "550 Hudson Street, NY 10014, New York City",
        phone: "+1 (646) 755-8158",
        hours: "Monday - Wednesday: 8:00 AM - 8:00 PM, Thursday: 8:00 AM - 9:00 PM, Friday - Saturday: 8:00 AM - 10:00 PM, Sunday: 8:00 AM - 8:00 PM",
        coordinates: [-74.005858, 40.735054],
        rating: 0,
        reviewCount: 0,
        createdAt: new Date()
    },
    {
        name: "Laughing Man Coffee",
        address: "184 Duane St, New York, NY 10013",
        phone: "(212) 680-1111",
        hours: "Monday - Sunday: 6:00 AM - 6:00 PM",
        coordinates: [-74.010153, 40.717227],
        rating: 0,
        reviewCount: 0,
        createdAt: new Date()
    },
    {
        name: "Le Cafe - Columbus Circle",
        address: "250 West 57th Street, New York, NY 10107",
        phone: "(555) 888-0001",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-73.982477, 40.766317],
        rating: 0,
        reviewCount: 0,
        createdAt: new Date()
    },
    {
        name: "Le Cafe - Fashion District",
        address: "501 Seventh Avenue, New York, NY 10018",
        phone: "(555) 888-0002",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-73.98856, 40.75286],
        rating: 0,
        reviewCount: 0,
        createdAt: new Date()
    },
    {
        name: "Le Cafe - Rockefeller",
        address: "1251 6th Avenue, New York, NY 10020",
        phone: "(555) 888-0003",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-73.981771, 40.76001],
        rating: 0,
        reviewCount: 0,
        createdAt: new Date()
    },
    {
        name: "Le Cafe - Nomad",
        address: "407 Park Avenue South, New York, NY 10016",
        phone: "(555) 888-0004",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-73.983689, 40.743347],
        rating: 0,
        reviewCount: 0,
        createdAt: new Date()
    },
    {
        name: "Le Cafe - West Side",
        address: "629 West 57th Street, New York, NY 10019",
        phone: "(555) 888-0005",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-73.99254, 40.77098],
        rating: 0,
        reviewCount: 0,
        createdAt: new Date()
    },
    {
        name: "Le Cafe - Turtle Bay",
        address: "909 3rd Avenue, New York, NY 10022",
        phone: "(555) 888-0006",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-73.968076, 40.758429],
        rating: 0,
        reviewCount: 0,
        createdAt: new Date()
    },
    {
        name: "Le Cafe - Bryant Park",
        address: "1440 Broadway, New York, NY 11221",
        phone: "(555) 888-0007",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-73.919671, 40.687991],
        rating: 0,
        reviewCount: 0,
        createdAt: new Date()
    },
    {
        name: "Le Cafe - Midtown East",
        address: "661 Lexington Avenue, New York, NY 10022",
        phone: "(555) 888-0008",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-73.969776, 40.759685],
        rating: 0,
        reviewCount: 0,
        createdAt: new Date()
    },
    {
        name: "Le Cafe - Jersey City",
        address: "444 Warren Street, Jersey City, NJ 07302",
        phone: "(555) 888-0009",
        hours: "Monday - Sunday: 7:00 AM - 8:00 PM",
        coordinates: [-74.03734, 40.72407],
        rating: 0,
        reviewCount: 0,
        createdAt: new Date()
    }
];

async function updateFirebaseDatabase() {
    try {
        console.log('🚀 Starting Firebase database update...');
        
        // Get current cafes
        const currentCafesSnapshot = await db.collection('cafes').get();
        const currentCafes = currentCafesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log(`📊 Current cafes in database: ${currentCafes.length}`);
        console.log('Current cafe names:', currentCafes.map(c => c.name));
        
        // Delete all existing cafes using batch operations
        console.log('\n🗑️  Deleting existing cafes...');
        const deleteBatch = db.batch();
        let deleteCount = 0;
        
        for (const doc of currentCafesSnapshot.docs) {
            if (doc.id && doc.id.trim() !== '') {
                deleteBatch.delete(doc.ref);
                deleteCount++;
            } else {
                console.log(`⚠️  Skipping document with invalid ID: ${doc.id}`);
            }
        }
        
        if (deleteCount > 0) {
            await deleteBatch.commit();
            console.log(`✓ Deleted ${deleteCount} cafes successfully`);
        } else {
            console.log('ℹ️  No valid documents to delete');
        }
        
        // Add all new cafes using batch operations
        console.log('\n➕ Adding all 16 cafes...');
        const addBatch = db.batch();
        const cafeRefs = [];
        
        for (const cafe of allCafes) {
            const docRef = db.collection('cafes').doc();
            addBatch.set(docRef, cafe);
            cafeRefs.push({ ref: docRef, name: cafe.name });
        }
        
        await addBatch.commit();
        
        // Log the results
        cafeRefs.forEach(({ ref, name }) => {
            console.log(`✓ Added: ${name} (ID: ${ref.id})`);
        });
        
        // Verify the update
        console.log('\n🔍 Verifying update...');
        const updatedCafesSnapshot = await db.collection('cafes').get();
        const updatedCafes = updatedCafesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log(`✅ Database update complete!`);
        console.log(`📈 Total cafes in database: ${updatedCafes.length}`);
        console.log('📋 All cafe names:');
        updatedCafes.forEach((cafe, index) => {
            console.log(`  ${index + 1}. ${cafe.name}`);
        });
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error updating database:', error);
        process.exit(1);
    }
}

// Run the update
updateFirebaseDatabase(); 