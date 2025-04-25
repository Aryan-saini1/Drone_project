import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const BACKEND_URL = 'http://192.168.180.84:5001'; // Your computer's network IP address

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [defects, setDefects] = useState([]);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasPermission(cameraStatus === 'granted' && libraryStatus === 'granted');
    })();
  }, []);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/health`);
        console.log('Server health check:', response.data);
      } catch (error) {
        console.error('Server connection error:', error.message);
        Alert.alert(
          'Server Connection Error',
          'Cannot connect to the server. Make sure your phone and computer are on the same network.'
        );
      }
    };
    checkServer();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setImage(photo.uri);
        setIsCameraActive(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select or capture an image first');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });

      console.log('Attempting to connect to:', `${BACKEND_URL}/api/upload`);
      
      try {
        await axios.get(`${BACKEND_URL}/api/health`);
      } catch (error) {
        throw new Error('Server is not responding. Please check your connection.');
      }

      const response = await axios.post(`${BACKEND_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        timeout: 10000,
      });

      console.log('Server response:', response.data);
      if (response.data.success) {
        setDefects(response.data.defects);
      } else {
        Alert.alert('Error', response.data.error || 'Failed to analyze image');
      }
    } catch (error) {
      console.error('Error details:', error.message);
      Alert.alert(
        'Connection Error',
        error.message || 'Failed to connect to server. Make sure your phone and computer are on the same network.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting permissions...</Text></View>;
  }
  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera or photos</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Defect Detection System</Text>
      
      {isCameraActive ? (
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={cameraType}
          >
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={takePicture}>
                <Text style={styles.buttonText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsCameraActive(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Camera>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setIsCameraActive(true)}
            >
              <Text style={styles.buttonText}>Open Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Text style={styles.buttonText}>Pick Image</Text>
            </TouchableOpacity>
          </View>

          {image && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity
                style={[styles.button, styles.analyzeButton]}
                onPress={analyzeImage}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Analyzing...' : 'Detect Defects'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {loading && <ActivityIndicator size="large" color="#4CAF50" />}

          {defects.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsTitle}>Detection Results</Text>
              {defects.map((defect, index) => (
                <View key={index} style={styles.defectCard}>
                  <Text style={styles.defectTitle}>{defect.type}</Text>
                  <Text style={styles.defectText}>
                    <Text style={styles.label}>Location: </Text>
                    {defect.location}
                  </Text>
                  <Text style={[styles.defectText, styles[`severity${defect.severity}`]]}>
                    <Text style={styles.label}>Severity: </Text>
                    {defect.severity}
                  </Text>
                  <Text style={styles.defectText}>
                    <Text style={styles.label}>Cause: </Text>
                    {defect.cause}
                  </Text>
                  <Text style={styles.defectText}>
                    <Text style={styles.label}>Solution: </Text>
                    {defect.solution}
                  </Text>
                  <Text style={styles.defectText}>
                    <Text style={styles.label}>Prevention: </Text>
                    {defect.prevention}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#282c34',
    color: 'white',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzeButton: {
    marginTop: 20,
    width: '100%',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  defectCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  defectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff9800',
    marginBottom: 10,
  },
  defectText: {
    fontSize: 16,
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  severityHigh: {
    color: '#f44336',
  },
  severityMedium: {
    color: '#ff9800',
  },
  severityLow: {
    color: '#4caf50',
  },
}); 