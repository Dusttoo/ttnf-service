import axios from 'axios';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';
import store from '../store';
import { startLoading, stopLoading } from '../store/loadingSlice';
import { withTimeout } from '../utils/withTimeout';

let API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

if (process.env.NODE_ENV !== 'development') {
  API_BASE_URL = API_BASE_URL.replace(/^http:\/\//i, 'https://');
}

const TIMEOUT = 10000;

const apiClient = axios.create({
  baseURL: API_BASE_URL || 'https://api-dev.texastopnotchfrenchies.com/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    store.dispatch(startLoading());

    if (
      config.data &&
      typeof config.data === 'object' &&
      !(config.data instanceof URLSearchParams) &&
      !(config.data instanceof FormData)
    ) {
      config.data = snakecaseKeys(config.data, { deep: true });
    }

    if (config.url && !config.url.startsWith('http')) {
      config.url = `${API_BASE_URL}${config.url}`;
    } else if (config.url) {
      config.url = config.url.replace(/^http:\/\//i, 'https://');
    }

    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    store.dispatch(stopLoading());
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    store.dispatch(stopLoading());

    if (response.data && typeof response.data === 'object') {
      response.data = camelcaseKeys(response.data, { deep: true });
    }
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response || error.message);
    store.dispatch(stopLoading());

    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out:', error.message);
    }

    return Promise.reject(error);
  }
);

export const axiosWithTimeout = (config: any, timeout = TIMEOUT) => {
  return withTimeout(apiClient(config), timeout);
};

export default apiClient;
