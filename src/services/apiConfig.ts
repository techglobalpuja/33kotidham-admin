import axios from 'axios';

export const API_BASE_URL = 'https://api.33kotidham.in';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log("check token",token);
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});