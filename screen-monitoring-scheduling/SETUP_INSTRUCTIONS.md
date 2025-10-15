# WellnessAI Setup Instructions

## Features Implemented

✅ **Smart Schedule Demo** - AI-powered work-break cycles with weather-based food suggestions
✅ **AI Chat Bot** - Interactive wellness assistant with context-aware responses
✅ **Firebase Authentication** - Google sign-in integration
✅ **Protected Dashboard** - User authentication required
✅ **Weather-based Notifications** - Smart break reminders with food suggestions
✅ **Activity Tracking** - Real-time mouse and keyboard activity monitoring

## Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable Google Authentication in Authentication > Sign-in method

2. **Get Firebase Configuration**
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click "Add app" and select Web
   - Copy the configuration object

3. **Environment Variables**
   Create a `.env` file in the root directory with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Installation & Running

1. **Install Dependencies**
```bash
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

3. **Access the Application**
   - Open http://localhost:5173
   - Sign in with Google account
   - Access the dashboard at `/dashboard`

## Key Features

### 🧠 Smart Schedule Demo
- Set custom work and break durations
- AI-powered break suggestions
- Weather-based food recommendations
- Automatic session management

### 🤖 AI Chat Bot
- Context-aware wellness advice
- Quick action buttons
- Real-time activity monitoring
- Personalized suggestions

### 🔐 Authentication
- Google sign-in integration
- Protected dashboard routes
- User session management
- Secure logout functionality

### 📊 Dashboard
- Real-time activity tracking
- Productivity and wellness scores
- Quick action buttons
- Comprehensive analytics

## Usage

1. **Sign In**: Use Google account to authenticate
2. **Dashboard**: Access the main dashboard with overview, schedule, AI assistant, and analytics
3. **Smart Schedule**: Enable AI-powered work-break cycles
4. **AI Assistant**: Chat with the wellness bot for personalized advice
5. **Activity Tracking**: Monitor your computer usage patterns

## Weather Integration

The app includes simulated weather data for food suggestions. In a production environment, you can integrate with a real weather API:

```env
VITE_WEATHER_API_KEY=your_weather_api_key_here
```

## Customization

- Modify break durations in `ScheduleDemo.tsx`
- Add new food suggestions in the `foodSuggestions` array
- Customize AI responses in `AIChatBot.tsx`
- Update dashboard metrics in `Dashboard.tsx`

## Security Notes

- Firebase configuration is client-side (safe for Vite apps)
- Authentication state is managed securely
- Protected routes prevent unauthorized access
- User data is handled according to Firebase security rules

## Troubleshooting

1. **Firebase not working**: Check your environment variables
2. **Authentication fails**: Ensure Google sign-in is enabled in Firebase
3. **Build errors**: Make sure all dependencies are installed
4. **Activity tracking issues**: Check browser permissions

## Next Steps

- Add real weather API integration
- Implement data persistence with Firestore
- Add more advanced analytics
- Create mobile app version
- Add team collaboration features
