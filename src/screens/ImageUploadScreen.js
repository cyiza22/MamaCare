import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme';
import PinkButton from '../components/PinkButton';
import { uploadUltrasound } from '../services/api';
import { cacheScreening } from '../services/cache';
import { analyzeOffline, initMLModel, isMLReady } from '../services/MLService';

const ImageUploadScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [offlineLoading, setOfflineLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [mlReady, setMlReady] = useState(false);
  const [analysisMode, setAnalysisMode] = useState(null); // 'offline' or 'server'

  // Initialize ML model on component mount
  useEffect(() => {
    const initModel = async () => {
      try {
        console.log('🚀 Initializing ML model...');
        await initMLModel();
        setMlReady(true);
        console.log('✅ ML model ready');
      } catch (error) {
        console.error('⚠️ ML model initialization failed:', error.message);
        // App continues without offline mode
      }
    };

    initModel();
  }, []);

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
      const asset = picked.assets[0];
      console.log('✅ Image picked:', {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type,
      });
      setImage(asset);
      setResult(null);
      setAnalysisMode(null);
      setDebugInfo(`Image: ${asset.width}x${asset.height}`);
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
      const asset = picked.assets[0];
      console.log('✅ Photo taken:', {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      });
      setImage(asset);
      setResult(null);
      setAnalysisMode(null);
      setDebugInfo(`Photo: ${asset.width}x${asset.height}`);
    }
  };

  // Offline analysis using local ML model
  const handleOfflineAnalysis = async () => {
    if (!image) return;

    if (!isMLReady()) {
      Alert.alert('⏳ Model Loading', 'The ML model is still loading. Please wait a moment and try again.');
      return;
    }

    setOfflineLoading(true);
    setAnalysisMode('offline');
    setDebugInfo('Analyzing locally on device...');

    try {
      console.log('🚀 Starting offline analysis...');
      const offlineResult = await analyzeOffline(image.uri);

      console.log('✅ Offline analysis complete:', offlineResult);
      setDebugInfo('✅ Analysis complete (offline)!');

      // Normalize result
      const normalizedResult = {
        label: offlineResult.label || 'unknown',
        confidence: (offlineResult.confidence || 0) / 100, // Convert from percentage
        probabilities: {
          benign: (offlineResult.probabilities?.benign || 0) / 100,
          malignant: (offlineResult.probabilities?.malignant || 0) / 100,
          normal: (offlineResult.probabilities?.normal || 0) / 100,
        },
        class: offlineResult.class,
        source: 'offline',
      };

      // Cache locally
      await cacheScreening(normalizedResult, 'image');
      setResult(normalizedResult);
    } catch (err) {
      console.error('❌ Offline analysis failed:', err);
      setDebugInfo(`Error: ${err.message}`);
      Alert.alert('❌ Analysis Failed', err.message || 'Failed to analyze image. Please try server analysis.');
      setAnalysisMode(null);
    } finally {
      setOfflineLoading(false);
    }
  };

  // Server analysis (your existing working code)
  const handleServerAnalysis = async () => {
    if (!image) return;

    setLoading(true);
    setAnalysisMode('server');
    setDebugInfo('Uploading to server...');

    try {
      console.log('🚀 Starting server upload...');
      setDebugInfo('Uploading to server...');

      const res = await uploadUltrasound(image.uri);

      console.log('✅ Upload response:', res);
      setDebugInfo('✅ Analysis complete (server)!');

      // Normalize the response
      const normalizedResult = {
        label: res.label || 'unknown',
        confidence: res.confidence || 0,
        probabilities: res.probabilities || {
          benign: 0,
          malignant: 0,
          normal: 0,
        },
        class: res.class,
        source: 'server',
      };

      console.log('📦 Normalized result:', normalizedResult);

      // Cache the result locally
      await cacheScreening(normalizedResult, 'image');

      setResult(normalizedResult);
    } catch (err) {
      console.error('❌ Upload failed:', err);

      const errorMsg = err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Unknown error';

      setDebugInfo(`Error: ${errorMsg}`);

      let displayMsg = 'Upload failed. Please try again.';

      if (err.response?.status === 413) {
        displayMsg = 'Image is too large. Please choose a smaller image.';
      } else if (err.response?.status === 422) {
        const errors = err.response.data?.errors;
        if (errors?.image) {
          displayMsg = errors.image[0];
        } else {
          displayMsg = 'Validation error. Please check your image.';
        }
      } else if (err.response?.status === 500) {
        displayMsg = 'Server error. Please try again later.';
      } else if (err.message?.includes('timeout')) {
        displayMsg = 'Upload timed out. Please check your connection.';
      }

      Alert.alert('Upload Failed', displayMsg);
      setAnalysisMode(null);
    } finally {
      setLoading(false);
    }
  };

  const getLabelColor = (label) => {
    switch (label?.toLowerCase()) {
      case 'malignant': return '#E53E3E';
      case 'benign': return '#38A169';
      case 'normal': return '#3182CE';
      default: return COLORS.gray600;
    }
  };

  const getLabelEmoji = (label) => {
    switch (label?.toLowerCase()) {
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

        {/* Debug info */}
        {debugInfo && (
          <View style={styles.debugBox}>
            <Text style={styles.debugText}>📝 {debugInfo}</Text>
          </View>
        )}

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

        {/* Analysis buttons */}
        {image && !result && (
          <View style={styles.buttonContainer}>
            {/* Offline button */}
            <TouchableOpacity
              style={[
                styles.analysisBtn,
                styles.offlineBtn,
                (!mlReady || offlineLoading) && styles.buttonDisabled,
              ]}
              onPress={handleOfflineAnalysis}
              disabled={!mlReady || offlineLoading}
            >
              {offlineLoading ? (
                <>
                  <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 8 }} />
                  <Text style={styles.analysisBtnText}>Analyzing Offline...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.analysisBtnIcon}>📱</Text>
                  <Text style={styles.analysisBtnText}>
                    {mlReady ? 'Analyze on Device' : 'Loading Model...'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Server button */}
            <TouchableOpacity
              style={[
                styles.analysisBtn,
                styles.serverBtn,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleServerAnalysis}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ActivityIndicator size="small" color={COLORS.white} style={{ marginRight: 8 }} />
                  <Text style={styles.analysisBtnText}>Uploading...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.analysisBtnIcon}>☁️</Text>
                  <Text style={styles.analysisBtnText}>Analyze on Server</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Results */}
        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Analysis Result</Text>

            {/* Analysis source badge */}
            <View style={styles.sourceBadge}>
              <Text style={styles.sourceBadgeText}>
                {result.source === 'offline' ? '📱 Device Analysis' : '☁️ Server Analysis'}
              </Text>
            </View>

            {/* Main prediction */}
            <View style={[styles.labelBadge, { backgroundColor: getLabelColor(result.label) + '15' }]}>
              <Text style={styles.labelEmoji}>{getLabelEmoji(result.label)}</Text>
              <View>
                <Text style={[styles.labelText, { color: getLabelColor(result.label) }]}>
                  {result.label?.toUpperCase() || 'UNKNOWN'}
                </Text>
                <Text style={styles.confidenceText}>
                  {((result.confidence || 0) * 100).toFixed(1)}% confidence
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
                          { width: `${(val || 0) * 100}%`, backgroundColor: getLabelColor(key) },
                        ]}
                      />
                    </View>
                    <Text style={styles.probVal}>{((val || 0) * 100).toFixed(1)}%</Text>
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
              onPress={() => { setImage(null); setResult(null); setDebugInfo(''); setAnalysisMode(null); }}
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
  debugBox: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  debugText: {
    fontSize: SIZES.small,
    color: COLORS.gray600,
    ...FONTS.medium,
  },
  body: { flex: 1 },
  bodyContent: { padding: 20 },
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
  buttonContainer: {
    gap: 12,
    marginTop: 20,
  },
  analysisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    ...SHADOWS.small,
  },
  offlineBtn: {
    backgroundColor: '#8E44AD',
  },
  serverBtn: {
    backgroundColor: COLORS.pink,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  analysisBtnIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  analysisBtnText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    ...FONTS.semibold,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    ...SHADOWS.small,
  },
  resultTitle: { fontSize: SIZES.subtitle, ...FONTS.bold, color: COLORS.dark, marginBottom: 12 },
  sourceBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  sourceBadgeText: {
    fontSize: SIZES.small,
    color: COLORS.gray700,
    ...FONTS.medium,
  },
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
  disclaimer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },
  disclaimerText: { fontSize: SIZES.small, color: '#92400E', ...FONTS.regular, lineHeight: 20 },
  tryAgainBtn: { marginTop: 16 },
});

export default ImageUploadScreen;