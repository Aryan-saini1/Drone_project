# Drone Defect Detector

A comprehensive solution for detecting and analyzing defects in drones using image processing. Available as both a web application and a mobile app.

## Project Structure

```
defect-detector/
├── backend/         # Node.js backend server
├── frontend/        # React web application
└── mobile-app/      # React Native mobile application
```

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd defect-detector/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node server.js
   ```

The server will run on port 5001. You can verify it's running by visiting:
- Health check: http://localhost:5001/api/health

## Web Application Setup

1. Navigate to the frontend directory:
   ```bash
   cd defect-detector/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The web application will be available at http://localhost:3000

## Mobile App Setup (Expo)

1. Navigate to the mobile app directory:
   ```bash
   cd defect-detector-mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

4. Running on your device:
   - Install the Expo Go app from your device's app store
   - Make sure your phone and computer are on the same WiFi network
   - Scan the QR code shown in the terminal with:
     - iOS: Use the Camera app
     - Android: Use the Expo Go app's QR scanner

   Alternatively, you can run on simulators:
   - iOS: Press 'i' in the terminal (requires Xcode)
   - Android: Press 'a' in the terminal (requires Android Studio)

## Features

### Web Application
- Upload drone images for defect analysis
- Real-time defect detection
- Detailed defect information including:
  - Type of defect
  - Location
  - Severity
  - Cause
  - Recommended solutions
  - Prevention measures

### Mobile Application
- Capture photos directly using device camera
- Upload existing images from gallery
- Real-time defect analysis
- Comprehensive defect reports
- User-friendly interface
- Dark mode support

## Troubleshooting

### Mobile App
1. If you see "Could not connect to server":
   - Ensure the backend server is running
   - Check if your phone and computer are on the same network
   - Verify the API_URL in the mobile app matches your computer's IP address

2. If images fail to upload:
   - Check if the 'uploads' directory exists in the backend
   - Ensure you have granted camera and photo library permissions

### Web Application
1. If the application fails to load:
   - Check if the backend server is running
   - Verify the API endpoint configuration

## Development Notes

- The backend uses port 5001
- The web frontend uses port 3000
- The mobile app connects to the backend using your local IP address
- Both web and mobile versions share the same backend API

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Contact
For any queries or support, please reach out to the project maintainers.

## Acknowledgments
- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for their invaluable tools and libraries 
