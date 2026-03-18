import * as tf from '@tensorflow/tfjs';
import * as tflite from '@tensorflow/tfjs-tflite';

let model = null;
let isModelLoaded = false;

// Load TFLite model from assets
export const initMLModel = async () => {
  try {
    console.log('🤖 Initializing TFLite model from assets...');
    if (isModelLoaded) {
      console.log('✅ Model already loaded');
      return;
    }

    // Try to load .tflite model
    // Path should be: assets/model/model.tflite
    const modelPath = require('../assets/model/model.tflite');
    
    console.log('📦 Loading TFLite model...');
    
    model = await tflite.loadTFLiteModel(modelPath);

    console.log('✅ TFLite model loaded successfully');
    isModelLoaded = true;

  } catch (error) {
    console.error('❌ Failed to load TFLite model:', error);
    // Fallback to JSON model if TFLite fails
    console.log('⚠️ Attempting fallback to JSON model...');
    await initMLModelJSON();
  }
};

// Fallback: Load JSON model
const initMLModelJSON = async () => {
  try {
    const model = await tf.loadLayersModel(
      tf.io.bundleResourceIOHandler(
        require('../assets/model/model.json'),
        [require('../assets/model/group1-shard1of1.bin')]
      )
    );
    console.log('✅ JSON model loaded as fallback');
    isModelLoaded = true;
    return model;
  } catch (error) {
    console.error('❌ Fallback JSON model also failed:', error);
    throw error;
  }
};

// Analyze with TFLite model
export const analyzeOffline = async (imageUri) => {
  try {
    if (!isModelLoaded || !model) {
      throw new Error('Model not loaded. Please try again.');
    }

    console.log('📸 Analyzing image with TFLite model...');

    // Load and preprocess image
    const imageTensor = await loadImageAsTensor(imageUri);
    console.log('✅ Image tensor created:', imageTensor.shape);

    // Preprocess
    let processedTensor = imageTensor.cast('float32').div(255.0);

    // Add batch dimension if needed
    if (processedTensor.shape.length === 3) {
      processedTensor = processedTensor.expandDims(0);
    }

    console.log('📊 Processed tensor shape:', processedTensor.shape);

    // Run inference
    const predictions = model.predict(processedTensor);
    const predictionsArray = await predictions.array();

    // Cleanup
    imageTensor.dispose();
    processedTensor.dispose();
    predictions.dispose();

    console.log('🔍 Raw predictions:', predictionsArray);

    // Transform to result format
    const result = transformPredictions(
      Array.isArray(predictionsArray[0]) ? predictionsArray[0] : predictionsArray
    );

    console.log('✅ Analysis complete:', result);
    return result;

  } catch (error) {
    console.error('❌ Offline analysis failed:', error);
    throw error;
  }
};

const loadImageAsTensor = async (uri) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const tensor = tf.browser.fromPixels(canvas);
        resolve(tensor);
      } catch (error) {
        reject(new Error(`Failed to create tensor: ${error.message}`));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = uri;
  });
};

const transformPredictions = (rawPredictions) => {
  // Handle different output formats
  let benignScore = rawPredictions[0] || 0;
  let malignantScore = rawPredictions[1] || 0;
  let normalScore = rawPredictions[2] || 0;

  // Normalize
  const total = benignScore + malignantScore + normalScore;
  if (total > 0 && total !== 1) {
    benignScore /= total;
    malignantScore /= total;
    normalScore /= total;
  }

  const scores = {
    benign: benignScore,
    malignant: malignantScore,
    normal: normalScore,
  };

  let label = 'benign';
  let confidence = benignScore;
  let classNum = 0;

  if (malignantScore > confidence) {
    label = 'malignant';
    confidence = malignantScore;
    classNum = 2;
  }
  if (normalScore > confidence) {
    label = 'normal';
    confidence = normalScore;
    classNum = 1;
  }

  return {
    class: classNum,
    label,
    confidence: Math.round(confidence * 10000) / 100,
    probabilities: {
      benign: Math.round(benignScore * 10000) / 100,
      malignant: Math.round(malignantScore * 10000) / 100,
      normal: Math.round(normalScore * 10000) / 100,
    },
    source: 'offline',
  };
};

export const isMLReady = () => isModelLoaded;