# Drone Project - Solar Panel and Windmill Defect Detection System

## Overview
A comprehensive solution for automated defect detection in solar panels and windmills using drone technology. The system captures high-resolution images of infrastructure, analyzes them using computer vision and machine learning algorithms, and provides detailed reports about potential defects and maintenance recommendations.

## Features
- Real-time defect detection using drone-captured imagery
- Support for both solar panel and windmill inspection
- Automated defect classification and severity assessment
- Detailed maintenance recommendations
- Cross-platform mobile application for field inspections
- Web-based dashboard for data visualization and management
- Historical data tracking and trend analysis

## Tech Stack

### Backend
- Python
- FastAPI
- TensorFlow/PyTorch for ML models
- OpenCV for image processing
- PostgreSQL for database
- Redis for caching

### Frontend
- React.js
- Material-UI
- Chart.js for data visualization
- Redux for state management

### Mobile App
- React Native
- Expo
- NativeWind for styling
- React Navigation

### Infrastructure
- Docker for containerization
- AWS/GCP for cloud deployment
- GitHub Actions for CI/CD

## Project Structure
```
Drone/
├── defect-detector/          # Main backend application
│   ├── frontend/            # Web dashboard
│   └── mobile-app/          # Mobile application
├── defect-detector-mobile/  # Mobile application
└── README.md
```

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- Docker
- PostgreSQL
- Redis

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Aryan-saini1/Drone_project.git
cd Drone_project
```

2. Set up the backend:
```bash
cd defect-detector
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

4. Set up the mobile app:
```bash
cd ../mobile-app
npm install
```

### Running the Application

1. Start the backend:
```bash
cd defect-detector
uvicorn main:app --reload
```

2. Start the frontend:
```bash
cd frontend
npm start
```

3. Start the mobile app:
```bash
cd mobile-app
npm start
```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
For any queries or support, please reach out to the project maintainers.

## Acknowledgments
- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for their invaluable tools and libraries 
