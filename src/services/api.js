import axios from 'axios';

const BASE_URL = 'https://courageous-illumination-production-1258.up.railway.app/api';

// Main API instance for JSON requests
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Separate instance for file uploads (multipart)
const uploadApi = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Store auth token
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

// AUTH
export const signup = async (name, email, password) => {
  const res = await api.post('/signup', {
    name,
    email,
    password,
    password_confirmation: password,
  });
  if (res.data.token) setToken(res.data.token);
  return res.data;
};

export const login = async (email, password) => {
  const res = await api.post('/login', { email, password });
  if (res.data.token) setToken(res.data.token);
  return res.data;
};

// SCREENING (Questionnaire)
export const submitScreening = async (answers) => {
  const res = await api.post('/screen', answers);
  return res.data;
};

// CHAT ASSISTANT
export const sendMessage = async (message) => {
  console.log('📤 Sending to /assist:', { message });
  
  try {
    const res = await api.post('/assist', { message });
    console.log('✅ Response:', res.data);
    return res.data;
  } catch (error) {
    console.error('❌ Error:', {
      message: error.message,
      status: error.response?.status,
    });
    throw error;
  }
};

// SCREENING HISTORY
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

// Helper: Convert file URI to blob
const uriToBlob = async (uri) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onerror = reject;
    xhr.onload = () => {
      resolve(xhr.response);
    };
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
};

// IMAGE PREDICTION (Ultrasound) - FIXED WITH SEPARATE UPLOAD INSTANCE
export const uploadUltrasound = async (imageUri) => {
  try {
    console.log('📤 Starting upload...');
    console.log('Token present:', authToken ? 'YES ✓' : 'NO ✗');
    console.log('Auth header in uploadApi:', uploadApi.defaults.headers.common['Authorization'] ? 'YES ✓' : 'NO ✗');
    
    // Convert URI to blob
    console.log('Converting image to blob...');
    const imageBlob = await uriToBlob(imageUri);
    console.log('✅ Blob created:', imageBlob.size, 'bytes');
    
    // Create FormData
    const formData = new FormData();
    
    // Extract filename
    const filename = imageUri.split('/').pop() || 'ultrasound.jpg';
    
    // Append blob as file
    formData.append('image', imageBlob, filename);

    console.log('📦 FormData prepared with blob');
    console.log('About to send with uploadApi instance');
    console.log('uploadApi Authorization header:', uploadApi.defaults.headers.common['Authorization'] || 'MISSING');

    // Use the dedicated upload instance which has the token set
    const res = await uploadApi.post('/predict', formData);

    console.log('✅ Upload successful!');
    return res.data;

  } catch (error) {
    console.error('❌ Upload error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      headers: error.config?.headers?.Authorization ? 'Present' : 'MISSING',
    });
    throw error;
  }
};

export default api;