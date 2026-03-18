// ============================================================
// FILE: src/services/api.js
// Updated with offline cache support
// ============================================================

import axios from 'axios';
import { cacheAuthToken } from './offlineCache';

const BASE_URL = 'https://courageous-illumination-production-1258.up.railway.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

const uploadApi = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
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
    // Cache token for offline access
    await cacheAuthToken(res.data.token, { name, email });
    console.log('💾 Token cached for offline use');
  }
  return res.data;
};

export const login = async (email, password) => {
  const res = await api.post('/login', { email, password });
  if (res.data.token) {
    setToken(res.data.token);
    // Cache token for offline access
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

export const uploadUltrasound = async (imageUri) => {
  try {
    console.log('📤 Starting upload...');
    console.log('Token present:', authToken ? 'YES ✓' : 'NO ✗');
    console.log('Auth header in uploadApi:', uploadApi.defaults.headers.common['Authorization'] ? 'YES ✓' : 'NO ✗');
    
    console.log('Converting image to blob...');
    const imageBlob = await uriToBlob(imageUri);
    console.log('✅ Blob created:', imageBlob.size, 'bytes');
    
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'ultrasound.jpg';
    
    formData.append('image', imageBlob, filename);

    console.log('📦 FormData prepared with blob');

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