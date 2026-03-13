import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme';
import PinkButton from '../components/PinkButton';
import { uploadUltrasound } from '../services/api'; 

const ImageUploadScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!picked.canceled) {
      setImage(picked.assets[0]);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }

    const picked = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
    });

    if (!picked.canceled) {
      setImage(picked.assets[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await uploadUltrasound(image.uri);
      setResult(res);
    } catch (err) {
      Alert.alert('Upload Failed', 'Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getLabelColor = (label) => {
    switch (label) {
      case 'malignant': return '#E53E3E';
      case 'benign': return '#38A169';
      case 'normal': return '#3182CE';
      default: return COLORS.gray600;
    }
  };

  const getLabelEmoji = (label) => {
    switch (label) {
      case 'malignant': return '🔴';
      case 'benign': return '🟢';
      case 'normal': return '🔵';
      default: return '⚪';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={[COLORS.pink, COLORS.pinkDark]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ultrasound Analysis</Text>
        <Text style={styles.headerSub}>Upload a breast ultrasound image for AI prediction</Text>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>

        {/* Image Preview */}
        <View style={styles.imageSection}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.preview} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderEmoji}>🔬</Text>
              <Text style={styles.placeholderText}>No image selected</Text>
              <Text style={styles.placeholderHint}>Pick or take an ultrasound photo</Text>
            </View>
          )}
        </View>

        {/* Pick buttons */}
        <View style={styles.pickRow}>
          <TouchableOpacity style={styles.pickBtn} onPress={pickImage}>
            <Text style={styles.pickEmoji}>🖼️</Text>
            <Text style={styles.pickLabel}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickBtn} onPress={takePhoto}>
            <Text style={styles.pickEmoji}>📷</Text>
            <Text style={styles.pickLabel}>Camera</Text>
          </TouchableOpacity>
        </View>

        {/* Upload button */}
        {image && !result && (
          <PinkButton
            title={loading ? 'Analyzing...' : 'Analyze Image'}
            onPress={handleUpload}
            disabled={loading}
            style={styles.uploadBtn}
          />
        )}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.pink} />
            <Text style={styles.loadingText}>AI is analyzing your image...</Text>
          </View>
        )}

        {/* Results */}
        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Analysis Result</Text>

            {/* Main prediction */}
            <View style={[styles.labelBadge, { backgroundColor: getLabelColor(result.label) + '15' }]}>
              <Text style={styles.labelEmoji}>{getLabelEmoji(result.label)}</Text>
              <View>
                <Text style={[styles.labelText, { color: getLabelColor(result.label) }]}>
                  {result.label?.toUpperCase()}
                </Text>
                <Text style={styles.confidenceText}>
                  {(result.confidence * 100).toFixed(1)}% confidence
                </Text>
              </View>
            </View>

            {/* Probabilities */}
            {result.probabilities && (
              <View style={styles.probSection}>
                <Text style={styles.probTitle}>Detailed Probabilities</Text>
                {Object.entries(result.probabilities).map(([key, val]) => (
                  <View key={key} style={styles.probRow}>
                    <Text style={styles.probLabel}>
                      {getLabelEmoji(key)} {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                    <View style={styles.probBarBg}>
                      <View
                        style={[
                          styles.probBarFill,
                          { width: `${val * 100}%`, backgroundColor: getLabelColor(key) },
                        ]}
                      />
                    </View>
                    <Text style={styles.probVal}>{(val * 100).toFixed(1)}%</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                ⚠️ This is a preliminary AI screening tool and not a medical diagnosis.
                Please consult a healthcare professional for proper evaluation.
              </Text>
            </View>

            {/* Try again */}
            <PinkButton
              title="Upload Another Image"
              variant="outline"
              onPress={() => { setImage(null); setResult(null); }}
              style={styles.tryAgainBtn}
            />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.offWhite },
  // Header
  header: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backBtn: { marginBottom: 8 },
  backText: { color: COLORS.white, fontSize: SIZES.body, ...FONTS.medium },
  headerTitle: { fontSize: SIZES.title, color: COLORS.white, ...FONTS.bold },
  headerSub: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.8)', ...FONTS.regular, marginTop: 4 },
  // Body
  body: { flex: 1 },
  bodyContent: { padding: 20 },
  // Image section
  imageSection: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  preview: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  placeholder: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.pinkSoft,
  },
  placeholderEmoji: { fontSize: 48, marginBottom: 8 },
  placeholderText: { fontSize: SIZES.subtitle, color: COLORS.gray600, ...FONTS.semibold },
  placeholderHint: { fontSize: SIZES.small, color: COLORS.gray400, ...FONTS.regular, marginTop: 4 },
  // Pick buttons
  pickRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  pickBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    ...SHADOWS.small,
  },
  pickEmoji: { fontSize: 28 },
  pickLabel: { fontSize: SIZES.small, color: COLORS.gray700, ...FONTS.semibold },
  // Upload button
  uploadBtn: { marginTop: 20 },
  // Loading
  loadingBox: {
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  loadingText: { fontSize: SIZES.body, color: COLORS.gray600, ...FONTS.medium },
  // Result card
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    ...SHADOWS.small,
  },
  resultTitle: { fontSize: SIZES.subtitle, ...FONTS.bold, color: COLORS.dark, marginBottom: 16 },
  // Label badge
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  labelEmoji: { fontSize: 32 },
  labelText: { fontSize: SIZES.title, ...FONTS.bold },
  confidenceText: { fontSize: SIZES.small, color: COLORS.gray600, ...FONTS.medium, marginTop: 2 },
  // Probabilities
  probSection: { marginTop: 20 },
  probTitle: { fontSize: SIZES.body, ...FONTS.semibold, color: COLORS.gray700, marginBottom: 12 },
  probRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  probLabel: { width: 100, fontSize: SIZES.small, color: COLORS.gray700, ...FONTS.medium },
  probBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.gray100,
    borderRadius: 4,
    overflow: 'hidden',
  },
  probBarFill: { height: '100%', borderRadius: 4 },
  probVal: { width: 48, fontSize: SIZES.small, color: COLORS.gray600, ...FONTS.medium, textAlign: 'right' },
  // Disclaimer
  disclaimer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  disclaimerText: { fontSize: SIZES.small, color: '#92400E', ...FONTS.regular, lineHeight: 20 },
  // Try again
  tryAgainBtn: { marginTop: 16 },
});

export default ImageUploadScreen;
