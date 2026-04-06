import axios from 'axios';
import { Platform } from 'react-native';
import { cacheAuthToken } from './offlineCache';

const BASE_URL = 'https://courageous-illumination-production-1258.up.railway.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

const uploadApi = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

let authToken = null;

export const setToken = (token) => {
  authToken = token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  uploadApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('🔐 Token set:', token ? 'YES' : 'NO');
};

export const getToken = () => authToken;

export const clearToken = () => {
  authToken = null;
  delete api.defaults.headers.common['Authorization'];
  delete uploadApi.defaults.headers.common['Authorization'];
};

export const signup = async (name, email, password) => {
  const res = await api.post('/signup', {
    name,
    email,
    password,
    password_confirmation: password,
  });

  if (res.data.token) {
    setToken(res.data.token);
    await cacheAuthToken(res.data.token, { name, email });
    console.log('💾 Token cached for offline use');
  }

  return res.data;
};

export const login = async (email, password) => {
  const res = await api.post('/login', { email, password });

  if (res.data.token) {
    setToken(res.data.token);
    await cacheAuthToken(res.data.token, { email });
    console.log('💾 Token cached for offline use');
  }

  return res.data;
};

export const submitScreening = async (answers) => {
  const res = await api.post('/screen', answers);
  return res.data;
};

export const sendMessage = async (message) => {
  try {
    const res = await api.post('/assist', { message });
    return res.data;
  } catch (error) {
    console.error('❌ Assist error:', error.response?.data || error.message);
    throw error;
  }
};

export const getHistory = async () => {
  const res = await api.get('/screenings');
  return res.data;
};

export const deleteScreening = async (id) => {
  const res = await api.delete(`/screenings/${id}`);
  return res.data;
};

export const clearHistory = async () => {
  const res = await api.delete('/screenings');
  return res.data;
};

// ✅ FINAL robust upload function
export const uploadUltrasound = async (imageUri) => {
  try {
    console.log('📤 Starting upload...');
    console.log('Token:', authToken ? 'YES' : 'NO');

    const formData = new FormData();

    const filename = imageUri.split('/').pop() || 'ultrasound.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    if (Platform.OS === 'web') {
      // Web requires actual file fetch
      const response = await fetch(imageUri);
      const blob = await response.blob();

      formData.append('image', blob, filename);
    } else {
      // Mobile (APK / Emulator)
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      });
    }

    console.log('📦 FormData ready:', {
      name: filename,
      type,
      platform: Platform.OS,
    });

    const res = await uploadApi.post('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('✅ Upload success:', res.data);
    return res.data;

  } catch (error) {
    console.error('❌ Upload error FULL:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    throw error;
  }
};

export default api;