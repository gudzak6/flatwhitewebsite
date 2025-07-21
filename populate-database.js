// Utility script to populate Firebase database with sample cafes
// Run this in the browser console after the page loads

// Functions are now globally available from firebase-config.js

// Use the sampleCafes from script.js (already defined globally)

// Function to populate database
async function populateDatabase() {
    console.log('Starting database population...');
    
    try {
        // Check if cafes already exist
        const existingCafes = await getCafesFromDatabase();
        console.log(`Found ${existingCafes.length} existing cafes`);
        
        if (existingCafes.length > 0) {
            console.log('Database already has cafes. Skipping population.');
            return;
        }
        
        // Add each cafe to the database
        for (const cafe of sampleCafes) {
            try {
                const cafeId = await addCafeToDatabase(cafe);
                console.log(`✅ Added cafe: ${cafe.name} with ID: ${cafeId}`);
            } catch (error) {
                console.error(`❌ Error adding cafe ${cafe.name}:`, error);
            }
        }
        
        console.log('🎉 Database population complete!');
        
        // Verify the cafes were added
        const finalCafes = await getCafesFromDatabase();
        console.log(`Total cafes in database: ${finalCafes.length}`);
        
    } catch (error) {
        console.error('❌ Error during database population:', error);
    }
}

// Make function globally available
window.populateDatabase = populateDatabase;

console.log('Database population script loaded!');
console.log('Run populateDatabase() in the console to add the sample cafes.'); 