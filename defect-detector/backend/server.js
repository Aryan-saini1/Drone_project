const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 5001; // Explicitly set to 5001

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Enhanced CORS configuration
app.use(cors({
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
    credentials: true
}));

// Middleware
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Mock defect data
const mockDefects = [
    {
        type: 'Surface Crack',
        location: 'Top-right corner',
        cause: 'Thermal stress or mechanical impact',
        solution: 'Apply epoxy resin to seal the crack. Clean the area thoroughly before application.',
        severity: 'Medium',
        prevention: 'Regular maintenance and avoiding sudden temperature changes'
    },
    {
        type: 'Corrosion',
        location: 'Bottom surface',
        cause: 'Exposure to moisture and oxygen',
        solution: 'Remove rust with sandpaper, apply rust converter, and coat with protective paint',
        severity: 'High',
        prevention: 'Regular cleaning and application of protective coatings'
    },
    {
        type: 'Paint Peeling',
        location: 'Left side panel',
        cause: 'Poor surface preparation or environmental exposure',
        solution: 'Remove loose paint, sand the surface, and apply new primer and paint',
        severity: 'Low',
        prevention: 'Use high-quality paint and proper surface preparation'
    },
    {
        type: 'Structural Deformation',
        location: 'Center section',
        cause: 'Excessive load or impact',
        solution: 'Consult with structural engineer for proper reinforcement',
        severity: 'High',
        prevention: 'Regular inspection and load monitoring'
    }
];

// Routes
app.post('/api/upload', upload.single('image'), (req, res) => {
    console.log('Received upload request');
    if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File uploaded successfully:', req.file.filename);

    // Randomly select 1-2 defects from the mock data
    const numDefects = Math.floor(Math.random() * 2) + 1;
    const selectedDefects = [];
    for (let i = 0; i < numDefects; i++) {
        const randomIndex = Math.floor(Math.random() * mockDefects.length);
        selectedDefects.push(mockDefects[randomIndex]);
    }

    console.log('Sending response with defects:', selectedDefects);
    res.json({
        success: true,
        filePath: req.file.path,
        defects: selectedDefects
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Handle preflight requests
app.options('/api/*', (req, res) => {
    res.status(200).end();
});

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Health check available at http://localhost:${port}/api/health`);
}); 