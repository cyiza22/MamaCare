import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import PinkButton from '../components/PinkButton';
import RiskBadge from '../components/RiskBadge';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme';

const OfflinePredictionScreen = () => {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setPrediction(null);
      setError(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send to API for analysis
      const formData = new FormData();
      formData.append('image', {
        uri: selectedImage,
        type: 'image/jpeg',
        name: 'ultrasound.jpg',
      });

      const response = await fetch('https://breast-canserscreening-production-950a.up.railway.app/api/predict', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setPrediction(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (label) => {
    if (label === 'benign') return COLORS.success;
    if (label === 'malignant') return COLORS.danger;
    return COLORS.gray;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Ultrasound Analysis</Text>
        <Text style={styles.subtitle}>Upload an ultrasound image for AI-powered analysis</Text>
      </View>

      <View style={styles.section}>
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Text style={styles.selectedLabel}>Selected Image</Text>
            <View style={styles.imageThumbnail}>
              {/* Note: Image display would require additional setup */}
              <Text style={styles.imageText}>📷 Image selected</Text>
            </View>
            <PinkButton
              text="Change Image"
              onPress={pickImage}
              style={styles.marginTop}
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📤</Text>
            <Text style={styles.emptyText}>No image selected</Text>
            <PinkButton
              text="Select Image"
              onPress={pickImage}
              style={styles.marginTop}
            />
          </View>
        )}
      </View>

      {selectedImage && !prediction && !loading && (
        <PinkButton
          text="Analyze Image"
          onPress={analyzeImage}
          style={styles.analyzeButton}
        />
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Analyzing image...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {prediction && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Analysis Result</Text>
          
          <View style={[styles.resultBadge, { backgroundColor: getRiskColor(prediction.label) }]}>
            <Text style={styles.resultLabel}>{prediction.label.toUpperCase()}</Text>
          </View>

          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence:</Text>
            <Text style={styles.confidenceValue}>
              {(prediction.confidence * 100).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.probabilitiesContainer}>
            <Text style={styles.probabilitiesTitle}>Detailed Probabilities:</Text>
            {Object.entries(prediction.probabilities || {}).map(([key, value]) => (
              <View key={key} style={styles.probabilityRow}>
                <Text style={styles.probabilityLabel}>{key}:</Text>
                <Text style={styles.probabilityValue}>
                  {(value * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              This analysis is for educational purposes only and should not be used for medical diagnosis. 
              Always consult with a healthcare professional.
            </Text>
          </View>

          <PinkButton
            text="Analyze Another Image"
            onPress={() => {
              setSelectedImage(null);
              setPrediction(null);
              setError(null);
            }}
            style={styles.marginTop}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SIZES.padding,
    paddingBottom: SIZES.padding * 2,
  },
  header: {
    marginBottom: SIZES.padding * 2,
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacing,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.gray,
    lineHeight: 20,
  },
  section: {
    marginBottom: SIZES.padding * 2,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.card,
  },
  imageContainer: {
    alignItems: 'center',
  },
  selectedLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: SIZES.spacing,
  },
  imageThumbnail: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.padding,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  imageText: {
    fontSize: SIZES.large,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SIZES.padding,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SIZES.spacing,
  },
  emptyText: {
    fontSize: SIZES.body,
    color: COLORS.gray,
    marginBottom: SIZES.padding,
  },
  marginTop: {
    marginTop: SIZES.padding,
  },
  analyzeButton: {
    marginBottom: SIZES.padding * 2,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.padding * 2,
  },
  loadingText: {
    marginTop: SIZES.spacing,
    fontSize: SIZES.body,
    color: COLORS.gray,
  },
  errorBox: {
    backgroundColor: COLORS.dangerLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: SIZES.body,
  },
  resultBox: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.card,
  },
  resultTitle: {
    fontSize: SIZES.heading,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  resultBadge: {
    paddingVertical: SIZES.padding,
    paddingHorizontal: SIZES.padding * 2,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  resultLabel: {
    color: COLORS.white,
    fontSize: SIZES.heading,
    fontWeight: FONTS.bold,
  },
  confidenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.spacing,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    marginBottom: SIZES.padding,
  },
  confidenceLabel: {
    fontSize: SIZES.body,
    color: COLORS.gray,
  },
  confidenceValue: {
    fontSize: SIZES.body,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  probabilitiesContainer: {
    marginBottom: SIZES.padding,
  },
  probabilitiesTitle: {
    fontSize: SIZES.body,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    marginBottom: SIZES.spacing,
  },
  probabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.spacing,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  probabilityLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    textTransform: 'capitalize',
  },
  probabilityValue: {
    fontSize: SIZES.small,
    fontWeight: FONTS.bold,
    color: COLORS.text,
  },
  disclaimer: {
    backgroundColor: COLORS.warningLight,
    padding: SIZES.spacing,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
  },
  disclaimerText: {
    fontSize: SIZES.small,
    color: COLORS.warning,
    lineHeight: 18,
  },
});

export default OfflinePredictionScreen;