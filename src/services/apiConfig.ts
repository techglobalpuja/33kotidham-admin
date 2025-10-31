import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export const API_BASE_URL = 'https://api.33kotidham.in';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = localStorage.getItem('token');
  console.log("check token",token);
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});


// Response interceptor to handle 401 unauthorized responses
axiosInstance.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Remove token from localStorage
      localStorage.removeItem('token');
      // Redirect to signin page
      window.location.href = '/admin/signin';
    }
    return Promise.reject(error);
  }
);