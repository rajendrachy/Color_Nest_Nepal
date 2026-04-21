import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;
  
  if (userInfo && userInfo.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Global Session Revocation
      localStorage.removeItem('userInfo');
      localStorage.removeItem('cartItems');
      if (!window.location.pathname.startsWith('/login')) {
         window.location.href = '/?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
