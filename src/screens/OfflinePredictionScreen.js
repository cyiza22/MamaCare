import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, ActivityIndicator, StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as tf from '@tensorflow/tfjs';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';
import { COLORS, FONTS, SIZES, SHADOWS } from '../theme';
import PinkButton from '../components/PinkButton';
import { cacheScreening } from '../services/cache';

const CLASS_NAMES = ['benign', 'malignant', 'normal'];

const OfflinePredictionScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [modelLoading, setModelLoading] = useState(true);
  const [result, setResult] = useState(null);
  const modelRef = useRef(null);

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      setModelLoading(true);
      await tf.ready();
      console.log('TF backend:', tf.getBackend());

      // Fetch model.json manually so we can patch it
      const response = await fetch('/model/model.json');
      const modelJSON = await response.json();

      // Patch: ensure InputLayer has batch_input_shape
      const layers = modelJSON.modelTopology?.config?.layers || [];
      for (const layer of layers) {
        if (layer.class_name === 'InputLayer' && !layer.config.batch_input_shape) {
          layer.config.batch_input_shape = [null, 224, 224, 3];
          console.log('Patched InputLayer shape');
        }
      }

      // Fetch weights
      const weightsResponse = await fetch('/model/group1-shard1of1.bin');
      const weightsBuffer = await weightsResponse.arrayBuffer();
      console.log('Weights size:', weightsBuffer.byteLength);

      const weightSpecs = modelJSON.weightsManifest[0].weights;

      const model = await tf.loadLayersModel({
        load: async () => ({
          modelTopology: modelJSON.modelTopology,
          weightSpecs,
          weightData: weightsBuffer,
        }),
      });

      modelRef.current = model;
      setModelReady(true);
      console.log('Model loaded!');
    } catch (err) {
      console.log('Model load error:', err.message);
      Alert.alert('Model Error', err.message);
    } finally {
      setModelLoading(false);
    }
  };

  const imageToTensor = async (uri) => {
    // Resize to 224x224 and get base64
    const manipulated = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 224, height: 224 } }],
      { format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    // Decode JPEG to raw RGBA pixels
    const rawData = Buffer.from(manipulated.base64, 'base64');
    const { data, width, height } = jpeg.decode(rawData, { useTArray: true });

    // Convert RGBA to RGB Float32Array
    const pixelCount = width * height;
    const rgbData = new Float32Array(pixelCount * 3);
    for (let i = 0; i < pixelCount; i++) {
      rgbData[i * 3] = data[i * 4];         // R
      rgbData[i * 3 + 1] = data[i * 4 + 1]; // G
      rgbData[i * 3 + 2] = data[i * 4 + 2]; // B
    }

    return tf.tensor4d(rgbData, [1, 224, 224, 3]);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access.');
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

  const predict = async () => {
    if (!image || !modelRef.current) return;
    setLoading(true);

    try {
      const imageTensor = await imageToTensor(image.uri);
      const prediction = modelRef.current.predict(imageTensor);
      const probs = await prediction.data();

      const maxIdx = Array.from(probs).indexOf(Math.max(...probs));

      const predResult = {
        label: CLASS_NAMES[maxIdx],
        confidence: Math.round(probs[maxIdx] * 10000) / 10000,
        probabilities: {
          benign: Math.round(probs[0] * 10000) / 10000,
          malignant: Math.round(probs[1] * 10000) / 10000,
          normal: Math.round(probs[2] * 10000) / 10000,
        },
        model_type: 'on_device_tfjs',
      };

      setResult(predResult);
      await cacheScreening(predResult, 'image');
      tf.dispose([imageTensor, prediction]);
    } catch (err) {
      console.log('Prediction error:', err);
      Alert.alert('Prediction Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLabelColor = (l) =>
    l === 'malignant' ? '#E53E3E' : l === 'benign' ? '#38A169' : '#3182CE';

  const getLabelEmoji = (l) =>
    l === 'malignant' ? '🔴' : l === 'benign' ? '🟢' : '🔵';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#6B46C1', '#805AD5']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Offline Analysis</Text>
            <Text style={styles.headerSub}>AI runs on your phone — no internet needed</Text>
          </View>
          <View style={[styles.statusDot, modelReady ? styles.dotGreen : styles.dotRed]} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>

        {modelLoading && (
          <View style={styles.statusBox}>
            <ActivityIndicator size="small" color="#6B46C1" />
            <Text style={[styles.statusText, { color: '#6B46C1' }]}>Loading AI model...</Text>
          </View>
        )}

        {modelReady && !modelLoading && (
          <View style={[styles.statusBox, { backgroundColor: '#F0FFF4' }]}>
            <Text style={[styles.statusText, { color: '#38A169' }]}>
              AI model ready — works without internet
            </Text>
          </View>
        )}

        <View style={styles.imageSection}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.preview} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderEmoji}>📱</Text>
              <Text style={styles.placeholderText}>No image selected</Text>
              <Text style={styles.placeholderHint}>Works completely offline</Text>
            </View>
          )}
        </View>

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

        {image && !result && (
          <PinkButton
            title={loading ? 'Analyzing...' : 'Analyze on Device'}
            onPress={predict}
            disabled={loading || !modelReady}
            style={{ marginTop: 20 }}
          />
        )}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#6B46C1" />
            <Text style={styles.loadingText}>Running AI on your phone...</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>On-Device Result</Text>

            <View style={[styles.labelBadge, { backgroundColor: getLabelColor(result.label) + '15' }]}>
              <Text style={{ fontSize: 32 }}>{getLabelEmoji(result.label)}</Text>
              <View>
                <Text style={[styles.labelText, { color: getLabelColor(result.label) }]}>
                  {result.label?.toUpperCase()}
                </Text>
                <Text style={styles.confText}>
                  {(result.confidence * 100).toFixed(1)}% confidence
                </Text>
              </View>
            </View>

            {result.probabilities && (
              <View style={{ marginTop: 20 }}>
                <Text style={styles.probTitle}>Detailed Probabilities</Text>
                {Object.entries(result.probabilities).map(([key, val]) => (
                  <View key={key} style={styles.probRow}>
                    <Text style={styles.probLabel}>
                      {getLabelEmoji(key)} {key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                    <View style={styles.probBarBg}>
                      <View style={[styles.probBarFill, {
                        width: `${val * 100}%`,
                        backgroundColor: getLabelColor(key),
                      }]} />
                    </View>
                    <Text style={styles.probVal}>{(val * 100).toFixed(1)}%</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.offlineBadge}>
              <Text style={styles.offlineText}>📱 Analyzed on-device (no internet used)</Text>
            </View>

            <View style={styles.disclaimer}>
              <Text style={styles.disclaimerText}>
                This is a preliminary AI screening tool and not a medical diagnosis.
                Please consult a healthcare professional for proper evaluation.
              </Text>
            </View>

            <PinkButton
              title="Upload Another Image"
              variant="outline"
              onPress={() => { setImage(null); setResult(null); }}
              style={{ marginTop: 16 }}
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
    paddingTop: 56, paddingBottom: 24, paddingHorizontal: 24,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  backBtn: { marginBottom: 8 },
  backText: { color: COLORS.white, fontSize: SIZES.body, ...FONTS.medium },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { fontSize: SIZES.title, color: COLORS.white, ...FONTS.bold },
  headerSub: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.8)', ...FONTS.regular, marginTop: 4 },
  statusDot: { width: 12, height: 12, borderRadius: 6, marginLeft: 12 },
  dotGreen: { backgroundColor: '#48BB78' },
  dotRed: { backgroundColor: '#FC8181' },
  body: { flex: 1 },
  bodyContent: { padding: 20 },
  statusBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#F3F0FF', borderRadius: 12, padding: 14, marginBottom: 16,
  },
  statusText: { fontSize: SIZES.small, ...FONTS.medium },
  imageSection: { backgroundColor: COLORS.white, borderRadius: 20, overflow: 'hidden', ...SHADOWS.small },
  preview: { width: '100%', height: 280, resizeMode: 'cover' },
  placeholder: { height: 220, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F0FF' },
  placeholderEmoji: { fontSize: 48, marginBottom: 8 },
  placeholderText: { fontSize: SIZES.subtitle, color: COLORS.gray600, ...FONTS.semibold },
  placeholderHint: { fontSize: SIZES.small, color: COLORS.gray400, ...FONTS.regular, marginTop: 4 },
  pickRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  pickBtn: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 16,
    padding: 16, alignItems: 'center', gap: 6, ...SHADOWS.small,
  },
  pickEmoji: { fontSize: 28 },
  pickLabel: { fontSize: SIZES.small, color: COLORS.gray700, ...FONTS.semibold },
  loadingBox: { alignItems: 'center', marginTop: 24, gap: 12 },
  loadingText: { fontSize: SIZES.body, color: COLORS.gray600, ...FONTS.medium },
  resultCard: { backgroundColor: COLORS.white, borderRadius: 20, padding: 20, marginTop: 20, ...SHADOWS.small },
  resultTitle: { fontSize: SIZES.subtitle, ...FONTS.bold, color: COLORS.dark, marginBottom: 16 },
  labelBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, gap: 14 },
  labelText: { fontSize: SIZES.title, ...FONTS.bold },
  confText: { fontSize: SIZES.small, color: COLORS.gray600, ...FONTS.medium, marginTop: 2 },
  probTitle: { fontSize: SIZES.body, ...FONTS.semibold, color: COLORS.gray700, marginBottom: 12 },
  probRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 },
  probLabel: { width: 100, fontSize: SIZES.small, color: COLORS.gray700, ...FONTS.medium },
  probBarBg: { flex: 1, height: 8, backgroundColor: COLORS.gray100, borderRadius: 4, overflow: 'hidden' },
  probBarFill: { height: '100%', borderRadius: 4 },
  probVal: { width: 48, fontSize: SIZES.small, color: COLORS.gray600, ...FONTS.medium, textAlign: 'right' },
  offlineBadge: { backgroundColor: '#F3F0FF', borderRadius: 12, padding: 12, marginTop: 16, alignItems: 'center' },
  offlineText: { fontSize: SIZES.small, color: '#6B46C1', ...FONTS.medium },
  disclaimer: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 14, marginTop: 12 },
  disclaimerText: { fontSize: SIZES.small, color: '#92400E', ...FONTS.regular, lineHeight: 20 },
});

export default OfflinePredictionScreen;