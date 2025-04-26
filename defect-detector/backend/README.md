# Defect Detector Backend

This is the backend service for the Wind Turbine Defect Detector application.

## Google Cloud Configuration

This application uses Google Cloud's Vertex AI and Gemini API for defect analysis.

### Configuration Details

- **Project ID:** prismatic-canto-456409-k8
- **Project Number:** 567438766078
- **Location:** us-central1 (default Vertex AI location)
- **Gemini API Key:** AIzaSyAW9WDm2z4BCfVxzT_htSUUmd6wu5G3hMo

### Setup Instructions

1. **Install Google Cloud SDK**:
   Follow instructions at https://cloud.google.com/sdk/docs/install

2. **Authenticate with Google Cloud**:
   ```
   gcloud auth login
   gcloud config set project prismatic-canto-456409-k8
   gcloud auth application-default login
   ```

3. **For Service Account Authentication (optional)**:
   - Create a service account in Google Cloud Console
   - Download service account key as JSON
   - Save it as `credentials.json` in the backend directory
   - Activate it with: `gcloud auth activate-service-account --key-file=credentials.json`

4. **Install Dependencies**:
   ```
   npm install
   ```

5. **Run the Server**:
   ```
   node server.js
   ```

## API Endpoints

- **POST /api/upload**: Upload and analyze an image for defects
- **GET /api/health**: Health check endpoint

## Technologies Used

- Express.js
- Google Cloud Vertex AI
- Google Gemini API
- Multer for file uploads 