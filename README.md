# Flat White Finder

A web application to discover and review the best flat whites in your city. Built with HTML, CSS, JavaScript, and Firebase.

## Features

- 🗺️ Interactive map with cafe locations
- 📍 User location detection
- 🔍 Search cafes by name or location
- ⭐ Rate and review cafes
- 📱 Responsive design
- 🗄️ Real-time database with Firebase

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

The Firebase configuration is already set up in `firebase-config.js`. Make sure you have:

- Firebase project created
- Firestore database enabled
- Security rules configured

### 3. Mapbox Configuration

Update `config.js` with your Mapbox access token:

```javascript
const CONFIG = {
    API: {
        MAPBOX_TOKEN: 'your_mapbox_token_here',
        MAPBOX_GEOCODING: 'https://api.mapbox.com/geocoding/v5/mapbox.places'
    }
};
```

### 4. Run the Application

```bash
npm start
# or
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Database Schema

### Cafes Collection
```javascript
{
  id: "auto-generated",
  name: "Cafe Name",
  address: "123 Coffee St",
  phone: "(555) 123-4567",
  hours: "7 AM - 6 PM",
  coordinates: [longitude, latitude],
  rating: 4.5,
  reviewCount: 10,
  createdAt: timestamp
}
```

### Reviews Collection
```javascript
{
  id: "auto-generated",
  cafeId: "cafe_document_id",
  title: "Review Title",
  text: "Review text",
  rating: 5,
  author: "Anonymous",
  createdAt: timestamp
}
```

## Firebase Security Rules

Make sure your Firestore security rules allow read/write access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cafes/{cafeId} {
      allow read, write: if true; // For demo - add authentication in production
    }
    match /reviews/{reviewId} {
      allow read, write: if true; // For demo - add authentication in production
    }
  }
}
```

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS, DaisyUI
- **Maps**: Mapbox GL JS
- **Database**: Firebase Firestore
- **Icons**: Font Awesome

## Development

### File Structure
```
flatWhiteWebsite/
├── index.html          # Main application
├── about.html          # About page
├── script.js           # Main JavaScript logic
├── firebase-config.js  # Firebase configuration
├── config.js           # App configuration
├── custom.css          # Custom styles
├── package.json        # Dependencies
└── README.md           # This file
```

### Key Functions

- `loadCafes()` - Load cafes from Firebase
- `addCafeToDatabase()` - Add new cafe to database
- `addReviewToDatabase()` - Add review to database
- `getCurrentLocation()` - Get user location
- `searchCafes()` - Search cafes by name/address

## Production Deployment

For production deployment, consider:

1. **Authentication** - Add user login/signup
2. **Security Rules** - Implement proper Firestore security
3. **Image Upload** - Add cafe photos
4. **Real-time Updates** - Live updates when data changes
5. **Caching** - Implement offline support
6. **Analytics** - Track user behavior

## License

MIT License - feel free to use this project for learning or commercial purposes. 