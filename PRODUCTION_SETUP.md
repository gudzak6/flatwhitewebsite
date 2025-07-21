# 🚀 Production Setup Guide - Flat White Finder

This guide will help you deploy your Flat White Finder website with real Mapbox integration.

## 📋 Prerequisites

- A Mapbox account (free tier available)
- A web server or hosting service
- Basic knowledge of web development

## 🗺️ Step 1: Get Your Mapbox Access Token

### 1.1 Create Mapbox Account
1. Go to [Mapbox](https://www.mapbox.com/)
2. Click "Sign up" and create an account
3. Verify your email address

### 1.2 Get Your Access Token
1. Log into your Mapbox account
2. Go to [Access Tokens](https://account.mapbox.com/access-tokens/)
3. Copy your **Default public token** (starts with `pk.`)

### 1.3 Understand Usage Limits
- **Free Tier**: 50,000 map loads/month
- **Additional**: $5 per 1,000 map loads
- **Geocoding**: 100,000 requests/month free

## ⚙️ Step 2: Configure Your Website

### 2.1 Update Configuration
1. Open `config.js`
2. Replace `YOUR_MAPBOX_ACCESS_TOKEN_HERE` with your actual token:

```javascript
const CONFIG = {
    MAPBOX: {
        ACCESS_TOKEN: 'pk.your_actual_token_here',
        // ... other settings
    }
};
```

### 2.2 Test Your Configuration
1. Start your local server: `python3 -m http.server 8000`
2. Open `http://localhost:8000`
3. Check the browser console for any errors
4. Try adding a cafe to test geocoding

## 🌐 Step 3: Deploy to Production

### 3.1 Choose a Hosting Service

#### Option A: Netlify (Recommended)
1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com/)
3. Click "New site from Git"
4. Connect your GitHub repository
5. Deploy automatically

#### Option B: Vercel
1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import your repository
4. Deploy with one click

#### Option C: GitHub Pages
1. Push your code to GitHub
2. Go to repository Settings > Pages
3. Select source branch (usually `main`)
4. Your site will be available at `https://username.github.io/repository-name`

### 3.2 Environment Variables (Optional)
For better security, you can use environment variables:

#### Netlify
1. Go to Site Settings > Environment Variables
2. Add: `MAPBOX_ACCESS_TOKEN` = your token
3. Update `config.js`:

```javascript
const CONFIG = {
    MAPBOX: {
        ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN_HERE',
        // ... other settings
    }
};
```

## 🔧 Step 4: Advanced Configuration

### 4.1 Custom Map Styles
You can customize your map appearance:

```javascript
const CONFIG = {
    MAPBOX: {
        STYLE: 'mapbox://styles/mapbox/outdoors-v11', // Different style
        // Available styles:
        // - mapbox://styles/mapbox/streets-v11 (default)
        // - mapbox://styles/mapbox/outdoors-v11
        // - mapbox://styles/mapbox/light-v11
        // - mapbox://styles/mapbox/dark-v11
        // - mapbox://styles/mapbox/satellite-v9
    }
};
```

### 4.2 Custom Map Center
Set your default map location:

```javascript
const CONFIG = {
    MAPBOX: {
        DEFAULT_CENTER: [-0.1276, 51.5074], // London coordinates
        DEFAULT_ZOOM: 10
    }
};
```

### 4.3 Enable/Disable Features
Control which features are active:

```javascript
const CONFIG = {
    FEATURES: {
        ENABLE_REAL_SEARCH: true,    // Use Mapbox search
        ENABLE_GEOCODING: true,      // Convert addresses to coordinates
        ENABLE_DIRECTIONS: false,    // Future: route planning
        ENABLE_ANALYTICS: false      // Future: usage tracking
    }
};
```

## 📊 Step 5: Monitor Usage

### 5.1 Mapbox Usage Dashboard
1. Go to [Mapbox Account](https://account.mapbox.com/)
2. Check "Usage" tab
3. Monitor map loads and geocoding requests

### 5.2 Set Up Alerts
1. Go to [Mapbox Account](https://account.mapbox.com/)
2. Set up usage alerts
3. Get notified when approaching limits

## 🔒 Step 6: Security Best Practices

### 6.1 Restrict Token Usage
1. Go to [Mapbox Account](https://account.mapbox.com/)
2. Create a new token with restrictions:
   - **URL restrictions**: Limit to your domain
   - **Token scopes**: Only enable needed permissions

### 6.2 Environment Variables
Use environment variables instead of hardcoding tokens:

```javascript
// config.js
const CONFIG = {
    MAPBOX: {
        ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN || 'fallback_token',
    }
};
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Map Not Loading
- Check browser console for errors
- Verify your access token is correct
- Ensure you're not over usage limits

#### 2. Geocoding Not Working
- Check network tab for API errors
- Verify address format
- Check geocoding usage limits

#### 3. Search Not Working
- Verify Mapbox Geocoding API is enabled
- Check search query format
- Ensure proper error handling

### Debug Mode
Enable debug logging:

```javascript
const CONFIG = {
    DEBUG: true,
    // ... other settings
};
```

## 📈 Step 7: Performance Optimization

### 7.1 Enable Caching
Add cache headers to your server:

```html
<!-- In your HTML -->
<meta http-equiv="Cache-Control" content="max-age=3600">
```

### 7.2 Optimize Images
- Use WebP format for images
- Compress images before uploading
- Use lazy loading for images

### 7.3 Minimize API Calls
- Implement proper debouncing
- Cache geocoding results
- Use local storage for temporary data

## 🎯 Next Steps

### Future Enhancements
1. **User Authentication**: Add user accounts
2. **Database Integration**: Store data in a real database
3. **Real-time Updates**: WebSocket for live updates
4. **Mobile App**: React Native or Flutter app
5. **Analytics**: Track user behavior
6. **SEO Optimization**: Improve search rankings

### API Integrations
Consider adding:
- **Google Places API**: More detailed cafe information
- **Yelp API**: Reviews and ratings
- **Foursquare API**: Venue details
- **OpenStreetMap**: Free alternative to Mapbox

## 📞 Support

If you encounter issues:
1. Check the [Mapbox Documentation](https://docs.mapbox.com/)
2. Review browser console for errors
3. Test with a simple example first
4. Contact Mapbox support if needed

---

**Happy coding! ☕** 