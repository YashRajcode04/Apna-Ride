import axios from 'axios';

const baseURL = '/api';

const API = axios.create({
  baseURL,
});

// Add token to requests
API.interceptors.request.use((config) => {
  const accessToken = sessionStorage.getItem('accessToken');
  const userInfo = sessionStorage.getItem('userInfo');

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else if (userInfo) {
    const { token } = JSON.parse(userInfo);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default API;
