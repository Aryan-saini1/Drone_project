import { StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { Text, View } from '../../components/Themed';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';

// API endpoint configuration
const API_URL = 'http://192.168.180.84:5001';

interface Defect {
  type: string;
  location: string;
  cause: string;
  solution: string;
  severity: string;
  prevention: string;
}

interface AnalysisResult {
  success: boolean;
  filePath: string;
  defects: Defect[];
}

export default function TabOneScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const formData = new FormData();
      const imageUri = image;
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const response = await axios.post<AnalysisResult>(`${API_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 10000,
      });

      setResult(response.data);
    } catch (error: any) {
      console.error('Error:', error);
      let errorMessage = 'Error analyzing image. Please try again.';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check if the server is running.';
      } else if (error.response) {
        errorMessage = `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Could not connect to the server. Please check if it is running.';
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Defect Detector</Text>
          <Text style={styles.subtitle}>Welcome to your drone defect detection system</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <MaterialIcons name="camera-alt" size={24} color="white" />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <MaterialIcons name="photo-library" size={24} color="white" />
              <Text style={styles.buttonText}>Upload Image</Text>
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
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <MaterialIcons name="search" size={24} color="white" />
                    <Text style={styles.buttonText}>Analyze Image</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {result && result.defects && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>
                {result.defects.length > 0 ? 'Defects Detected' : 'No Defects Found'}
              </Text>
              {result.defects.map((defect, index) => (
                <View key={index} style={styles.defectItem}>
                  <Text style={styles.defectTitle}>Defect {index + 1}</Text>
                  <Text style={styles.resultText}>Type: {defect.type}</Text>
                  <Text style={styles.resultText}>Location: {defect.location}</Text>
                  <Text style={styles.resultText}>Severity: {defect.severity}</Text>
                  <Text style={styles.treatmentTitle}>Cause:</Text>
                  <Text style={styles.treatmentText}>{defect.cause}</Text>
                  <Text style={styles.treatmentTitle}>Solution:</Text>
                  <Text style={styles.treatmentText}>{defect.solution}</Text>
                  <Text style={styles.treatmentTitle}>Prevention:</Text>
                  <Text style={styles.treatmentText}>{defect.prevention}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1e293b',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 150,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  analyzeButton: {
    width: '100%',
    backgroundColor: '#10b981',
  },
  resultContainer: {
    width: '100%',
    backgroundColor: '#334155',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 5,
  },
  treatmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 15,
    marginBottom: 5,
  },
  treatmentText: {
    fontSize: 16,
    color: '#94a3b8',
    lineHeight: 24,
  },
  defectItem: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  defectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
});
