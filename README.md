# ReOwn Marketplace - React Native

A modern marketplace mobile application built with React Native, featuring a clean UI design and comprehensive marketplace functionality.

## Features

- **User Authentication**: Sign up, sign in with OTP verification
- **Product Listings**: Browse, search, and filter products
- **Reels**: Video-based product showcasing
- **Messaging**: Real-time chat between buyers and sellers
- **Profile Management**: User profiles with ratings and reviews
- **Categories**: Organized product categories
- **Favorites & Saved**: Save products and reels for later
- **Location Services**: Location-based product discovery
- **Multi-language Support**: Support for 13 languages
- **Dark Mode**: Theme switching capability

## Tech Stack

- **React Native 0.72.6**
- **React Navigation 6**: Navigation management
- **Supabase**: Backend services
- **React Native Vector Icons**: Icon library
- **React Native Linear Gradient**: Gradient backgrounds
- **React Native Image Picker**: Image selection
- **React Native Video**: Video playback
- **React Native Reanimated**: Smooth animations

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd reown-marketplace-mobile
```

2. Install dependencies
```bash
npm install
```

3. Install iOS dependencies (iOS only)
```bash
cd ios && pod install && cd ..
```

4. Run the application
```bash
# For Android
npm run android

# For iOS
npm run ios
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/             # Basic UI components (Button, Input, Card)
├── screens/            # Application screens
├── context/            # React Context providers
├── utils/              # Utility functions and constants
└── App.tsx             # Main application component
```

## Key Components

### UI Components
- **Button**: Customizable button with multiple variants
- **Input**: Text input with validation support
- **Card**: Container component with shadow styling

### Screens
- **Index**: Welcome/landing screen
- **Home**: Main marketplace feed
- **Reels**: Video product showcase
- **Messages**: Chat interface
- **Profile**: User profile management
- **Search**: Product and seller search
- **Settings**: App configuration

## Configuration

### Android
- Minimum SDK: 21
- Target SDK: 33
- Permissions: Camera, Location, Storage

### iOS
- Minimum iOS: 11.0
- Permissions: Camera, Photo Library, Location

## Development

### Running in Development
```bash
npm start
```

### Building for Production
```bash
# Android
cd android && ./gradlew assembleRelease

# iOS
# Use Xcode to build for production
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.