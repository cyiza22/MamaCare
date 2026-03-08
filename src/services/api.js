import axios from 'axios';

// const BASE_URL = 'http://10.0.2.2:8000/api';
// const BASE_URL = 'http://localhost:8000/api';
const BASE_URL = 'https://courageous-illumination-production-1258.up.railway.app/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Store auth token
let authToken = null;

export const setToken = (token) => {
  authToken = token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const getToken = () => authToken;

export const clearToken = () => {
  authToken = null;
  delete api.defaults.headers.common['Authorization'];
};

//AUTH

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

//SCREENING (Questionnaire) 

export const submitScreening = async (answers) => {
  const res = await api.post('/screen', answers);
  return res.data;
};

//CHAT ASSISTANT 

export const sendMessage = async (message) => {
  const res = await api.post('/assist', { message });
  return res.data;
};

//SCREENING HISTORY 

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

// ─── IMAGE PREDICTION (Ultrasound) ──────────────
// export const uploadUltrasound = async (imageUri) => {
//   const formData = new FormData();
//   formData.append('image', {
//     uri: imageUri,
//     type: 'image/jpeg',
//     name: 'ultrasound.jpg',
//   });

//   const res = await api.post('/predict', formData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   return res.data;
// };

export const uploadUltrasound = async (imageUri) => {
  const formData = new FormData();

  // Web: fetch the image and create a proper Blob
  const response = await fetch(imageUri);
  const blob = await response.blob();
  formData.append('image', blob, 'ultrasound.jpg');

  const res = await api.post('/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export default api;
