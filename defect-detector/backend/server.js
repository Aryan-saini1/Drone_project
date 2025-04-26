const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { VertexAI } = require('@google-cloud/vertexai');

// Google Cloud configuration
const projectId = 'prismatic-canto-456409-k8';
const projectNumber = '567438766078';
const location = 'us-central1'; // Default Vertex AI location

const app = express();
const port = 5001;

// Initialize Google Generative AI with API key
const genAI = new GoogleGenerativeAI('AIzaSyAW9WDm2z4BCfVxzT_htSUUmd6wu5G3hMo');

// Initialize Vertex AI
let vertexAI;
try {
    vertexAI = new VertexAI({ project: projectId, location });
    console.log('Vertex AI initialized successfully');
} catch (error) {
    console.error('Failed to initialize Vertex AI:', error);
}

// Add error handling for API initialization
let model;
try {
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    console.log('Gemini API initialized successfully');
} catch (error) {
    console.error('Failed to initialize Gemini API:', error);
}

// Log Google Cloud configuration
console.log(`Using Google Cloud Project: ${projectId} (${projectNumber})`);

// Check if Google Cloud credentials are properly set
try {
    const { auth } = require('google-auth-library');
    const client = auth.getClient()
        .then(() => console.log('Google Cloud authentication successful'))
        .catch(err => console.error('Google Cloud authentication failed:', err));
} catch (error) {
    console.warn('Google auth library not available, skipping authentication check');
}

const siText1 = {text: `You are a civil engineer specializing in wind turbine maintenance. You will analyze defects and provide detailed analysis in the following format:
CAUSE: [Detailed explanation of what caused the defect]
PREVENTION: [List of preventive measures]
SOLUTION: [Step-by-step solution]
SEVERITY: [Low/Medium/High]
Please be specific and technical in your analysis.`};

// Set up generation config
const generationConfig = {
    maxOutputTokens: 2357,
    temperature: 0.5,
    topP: 0.95,
    responseModalities: ["TEXT"],
    safetySettings: [
        {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'OFF',
        },
        {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'OFF',
        },
        {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'OFF',
        },
        {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'OFF',
        }
    ],
    systemInstruction: {
        parts: [siText1]
    },
};

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

// Function to analyze defect using Vertex AI
async function analyzeDefectWithAI(defectType) {
    try {
        // Try using Vertex AI first
        if (vertexAI) {
            try {
                // Get generative model
                const generativeModel = vertexAI.preview.getGenerativeModel({
                    model: "gemini-1.5-pro",
                    generation_config: {
                        max_output_tokens: 2048,
                        temperature: 0.4,
                        top_p: 0.8,
                    },
                });

                const prompt = `As a civil engineer specializing in wind turbine maintenance, analyze the following defect: ${defectType}.
                
                Please provide a detailed analysis in the following structured format:
                
                CAUSE:
                [Detailed explanation of what caused the defect]
                
                PREVENTION:
                [List of preventive measures that could have avoided this defect]
                
                SOLUTION:
                [Step-by-step solution to fix the defect]
                
                SEVERITY:
                [Low/Medium/High]
                
                Please be specific and technical in your analysis.`;

                console.log('Sending prompt to Vertex AI:', prompt);
                
                const result = await generativeModel.generateContent({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                });
                
                const response = await result.response;
                const text = response.candidates[0].content.parts[0].text;
                
                console.log('Raw Vertex AI response:', text);
                
                // Parse the structured response
                const sections = parseAIResponse(text);
                console.log('Parsed sections from Vertex AI:', sections);
                
                return sections;
            } catch (vertexError) {
                console.error('Vertex AI Analysis Error, falling back to Gemini API:', vertexError);
                // Fall back to Gemini API if Vertex AI fails
            }
        }
        
        // Fallback to direct Gemini API
        if (!model) {
            throw new Error('Gemini API model not initialized');
        }

        const prompt = `As a civil engineer specializing in wind turbine maintenance, analyze the following defect: ${defectType}.
        
        Please provide a detailed analysis in the following structured format:
        
        CAUSE:
        [Detailed explanation of what caused the defect]
        
        PREVENTION:
        [List of preventive measures that could have avoided this defect]
        
        SOLUTION:
        [Step-by-step solution to fix the defect]
        
        SEVERITY:
        [Low/Medium/High]
        
        Please be specific and technical in your analysis.`;

        console.log('Sending prompt to Gemini API:', prompt);
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }]}],
            generationConfig
        });
        
        const response = await result.response;
        const text = response.text();
        console.log('Raw Gemini API response:', text);
        
        // Parse the structured response
        const sections = parseAIResponse(text);
        console.log('Parsed sections from Gemini API:', sections);

        return sections;
    } catch (error) {
        console.error('AI Analysis Error:', error);
        return {
            cause: 'Analysis not available',
            prevention: 'Analysis not available',
            solution: 'Analysis not available',
            severity: 'Unknown'
        };
    }
}

// Improved AI response parsing
function parseAIResponse(text) {
    if (!text) {
        console.log('No text to parse');
        return {
            cause: 'Analysis not available',
            prevention: 'Analysis not available',
            solution: 'Analysis not available',
            severity: 'Unknown'
        };
    }
    
    // Initialize the sections object
    const sections = {
        cause: 'Analysis not available',
        prevention: 'Analysis not available',
        solution: 'Analysis not available',
        severity: 'Unknown'
    };
    
    // Define the sections to extract
    const sectionNames = ['CAUSE:', 'PREVENTION:', 'SOLUTION:', 'SEVERITY:'];
    
    // Extract each section
    for (let i = 0; i < sectionNames.length; i++) {
        const currentSection = sectionNames[i];
        const startIndex = text.indexOf(currentSection);
        
        if (startIndex === -1) {
            console.log(`Section ${currentSection} not found in text`);
            continue;
        }
        
        // Find the next section or end of text
        let endIndex = text.length;
        for (let j = i + 1; j < sectionNames.length; j++) {
            const nextSectionIndex = text.indexOf(sectionNames[j], startIndex);
            if (nextSectionIndex !== -1) {
                endIndex = nextSectionIndex;
                break;
            }
        }
        
        // Extract the section text and clean it up
        let sectionText = text.substring(startIndex + currentSection.length, endIndex).trim();
        
        // Remove any markdown or formatting
        sectionText = sectionText.replace(/\*\*/g, '').trim();
        
        // If the section is not empty after cleaning, use it
        if (sectionText) {
            const sectionKey = currentSection.toLowerCase().replace(':', '');
            sections[sectionKey] = sectionText;
            console.log(`Extracted ${currentSection}`, sectionText);
        }
    }
    
    return sections;
}

// Legacy function maintained for backward compatibility
function extractSection(text, sectionName) {
    return parseAIResponse(text)[sectionName.toLowerCase().replace(':', '')];
}

// Mock defect types for initial detection
const defectTypes = [
    'Blade Surface Erosion',
    'Structural Crack',
    'Bearing Failure',
    'Gearbox Malfunction',
    'Foundation Damage'
];

// Routes
app.post('/api/upload', upload.single('image'), async (req, res) => {
    console.log('Received upload request');
    if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Simulate defect detection
        const numDefects = Math.floor(Math.random() * 2) + 1;
        const detectedDefects = [];

        for (let i = 0; i < numDefects; i++) {
            const randomDefectType = defectTypes[Math.floor(Math.random() * defectTypes.length)];
            
            // Get AI analysis for the defect
            const aiAnalysis = await analyzeDefectWithAI(randomDefectType);
            
            const analysis = {
                type: randomDefectType,
                location: 'Various sections of the wind turbine',
                severity: aiAnalysis?.severity || 'Unknown',
                cause: aiAnalysis?.cause || 'Analysis not available',
                prevention: aiAnalysis?.prevention || 'Analysis not available',
                solution: aiAnalysis?.solution || 'Analysis not available'
            };

            detectedDefects.push(analysis);
        }

        console.log('Sending response with defects:', detectedDefects);
        res.json({
            success: true,
            filePath: req.file.path,
            defects: detectedDefects
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
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