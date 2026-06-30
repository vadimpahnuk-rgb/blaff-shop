import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.initData) {
    config.headers.Authorization = `tma ${tg.initData}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Auth failed — redirecting to init');
    }
    return Promise.reject(error);
  }
);

export default client;
