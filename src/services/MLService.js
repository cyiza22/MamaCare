import axios from 'axios';

const ML_API_BASE = 'https://breast-canserscreening-production-950a.up.railway.app/api';

class MLService {
  /**
   * Predict breast cancer risk from questionnaire answers
   * @param {Object} answers - Questionnaire answers
   * @returns {Promise<Object>} - Risk prediction result
   */
  static async predictRisk(answers) {
    try {
      const response = await axios.post(`${ML_API_BASE}/screen`, answers);
      return response.data;
    } catch (error) {
      console.error('ML Service - Risk prediction error:', error);
      throw new Error(error.response?.data?.message || 'Failed to predict risk');
    }
  }

  /**
   * Predict image classification (benign/malignant/normal)
   * @param {string} imageUri - Image URI from device
   * @returns {Promise<Object>} - Image classification result
   */
  static async predictImage(imageUri) {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'ultrasound.jpg',
      });

      const response = await axios.post(`${ML_API_BASE}/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('ML Service - Image prediction error:', error);
      throw new Error(error.response?.data?.message || 'Failed to predict image');
    }
  }

  /**
   * Get AI-powered chat response
   * @param {string} userMessage - User's message
   * @returns {Promise<Object>} - Chat response
   */
  static async getAssistantResponse(userMessage) {
    try {
      const response = await axios.post(`${ML_API_BASE}/assist`, {
        message: userMessage,
      });

      return response.data;
    } catch (error) {
      console.error('ML Service - Chat error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get response');
    }
  }

  /**
   * Load ML model (placeholder - model is on backend)
   * @returns {Promise<boolean>}
   */
  static async loadModel() {
    try {
      // Model is loaded on the backend, no need to load locally
      console.log('ML models are served from backend API');
      return true;
    } catch (error) {
      console.error('ML Service - Model load error:', error);
      throw error;
    }
  }

  /**
   * Check if model is loaded
   * @returns {boolean}
   */
  static async isModelLoaded() {
    // Since we're using API, always consider it "loaded"
    return true;
  }
}

export default MLService;