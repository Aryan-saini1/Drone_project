import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const BACKEND_URL = ''; // Empty string since we're using proxy

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Handle camera stream
  useEffect(() => {
    if (isCameraActive) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error('Error accessing camera:', err);
          setError('Error accessing camera. Please ensure you have granted camera permissions.');
        });
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraActive]);

  // Check server connection on component mount
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        const response = await fetch('/api/health', { mode: 'cors' });
        if (!response.ok) {
          setError('Backend server is not responding. Please make sure it is running.');
        }
      } catch (error) {
        setError('Cannot connect to backend server. Please make sure it is running on port 5001.');
      }
    };

    checkServerConnection();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
        setSelectedImage(file);
        setError(null);
        setPreviewImage(URL.createObjectURL(blob));
        setIsCameraActive(false);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      }, 'image/jpeg');
    }
  };

  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
    if (!isCameraActive) {
      setSelectedImage(null);
      setPreviewImage(null);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      setError('Please select or capture an image first');
      return;
    }

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      // First check if server is running
      const healthCheck = await fetch('/api/health', { mode: 'cors' });
      if (!healthCheck.ok) {
        throw new Error('Server is not responding');
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error('Server error. Please try again.');
      }

      const data = await response.json();
      if (data.success) {
        setDefects(data.defects);
      } else {
        setError(data.error || 'Error processing image');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to connect to server. Please make sure the backend is running on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Defect Detection System</h1>
      </header>
      <main>
        <div className="upload-section">
          <form onSubmit={handleSubmit}>
            <div className="input-options">
              <button type="button" onClick={toggleCamera} className="camera-button">
                {isCameraActive ? 'Close Camera' : 'Open Camera'}
              </button>
              <label className="file-upload-label">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                />
              </label>
            </div>

            {isCameraActive ? (
              <div className="camera-preview">
                <video ref={videoRef} autoPlay playsInline />
                <button type="button" onClick={captureImage} className="capture-button">
                  Capture Image
                </button>
              </div>
            ) : (
              previewImage && (
                <div className="image-preview">
                  <img src={previewImage} alt="Preview" />
                </div>
              )
            )}

            {error && <div className="error-message">{error}</div>}

            <button type="submit" disabled={!selectedImage || loading}>
              {loading ? 'Analyzing...' : 'Detect Defects'}
            </button>
          </form>
        </div>

        {defects.length > 0 && (
          <div className="results-section">
            <h2>Detection Results</h2>
            {defects.map((defect, index) => (
              <div key={index} className="defect-card">
                <h3>Defect Type: {defect.type}</h3>
                <div className="defect-details">
                  <p><strong>Location:</strong> {defect.location}</p>
                  <p><strong>Severity:</strong> <span className={`severity-${defect.severity.toLowerCase()}`}>{defect.severity}</span></p>
                  <p><strong>Cause:</strong> {defect.cause}</p>
                  <p><strong>Solution:</strong> {defect.solution}</p>
                  <p><strong>Prevention:</strong> {defect.prevention}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
