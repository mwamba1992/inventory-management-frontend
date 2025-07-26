import axios from 'axios'
import { useUserStore } from '@/stores/user'
import { Configs } from '@/utils/Configs'

const API_BASE_URL = Configs.API_BASE_URL;

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL, // Replace with your API URL
  timeout: 40000 // Adjust timeout as needed
});

// Request Interceptor to append token
api.interceptors.request.use(
  (config) => {
    const token = useUserStore().getToken;

    // If token exists, append it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      window.location.href = '/login';
    }

    return config;
  },
  (error) => {
    // Handle request error (if needed)
    return Promise.reject(error);
  }
);

// Response Interceptor to handle 401 Unauthorized (token expiration)
api.interceptors.response.use(
  (response) => {
    // Return the response as is if the request is successful
    return response;
  },
  async (error) => {
    // Check if the error is a 401 (Unauthorized)
    if (error.response && error.response.status === 401) {

      // Token might have expired or is invalid
      const refreshToken = useUserStore().refreshToken;

      if (refreshToken) {
        try {
          const refreshTokenDto = {
            refreshToken: refreshToken,
            userId: useUserStore().getId
          };
          // Attempt to refresh the token by making a refresh request
          const response = await api.post('/auth/refresh', { refreshTokenDto });

          // Get the new token from the response
          const { newToken } = response.data;
          useUserStore().token = newToken; // Update the token in the store

          // Update the original request's Authorization header with the new token
          error.config.headers['Authorization'] = `Bearer ${newToken}`;

          // Retry the original request with the new token
          return api(error.config);
        } catch (refreshError) {
          useUserStore().clearUser(); // Clear user data from store
          // Redirect to login page or show login modal
          window.location.href = '/login';
        }
      } else {
        // No refresh token available, redirect to login
        useUserStore().clearUser();
        window.location.href = '/login';
      }
    }

    // If the error is not related to token expiration, reject it as usual
    return Promise.reject(error);
  }
);


// Function to refresh the token
const refreshToken = async (refreshToken) => {
  try {
    const response = await api.post('/auth/refresh', { refreshToken });
    const { newToken } = response.data;
    useUserStore().token = newToken; // Update the token in the store
    return newToken;
  } catch (error) {
    useUserStore().clearUser()
    window.location.href = '/login';  // Redirect to login page
    throw error;  // rethrow the error after handling
  }
};

export default api;
