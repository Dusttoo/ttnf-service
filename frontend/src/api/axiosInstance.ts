import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';
import store from '../store';
import { startLoading, stopLoading } from '../store/loadingSlice';
import { withTimeout } from '../utils/withTimeout';

let API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://api-dev.texastopnotchfrenchies.com/api/v1';
if (process.env.NODE_ENV !== 'development') {
  API_BASE_URL = API_BASE_URL.replace(/^http:\/\//i, 'https://');
}
const TIMEOUT = 10000;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const isBackgroundRequest = config.headers?.isBackgroundRequest === 'true';

    if (!isBackgroundRequest) {
      store.dispatch(startLoading());
    }

    if (config.headers) {
      delete config.headers.isBackgroundRequest;
    }

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
    store.dispatch(stopLoading());
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    const isBackgroundRequest =
      response.config.headers?.isBackgroundRequest === 'true';

    if (!isBackgroundRequest) {
      store.dispatch(stopLoading());
    }

    if (response.data && typeof response.data === 'object') {
      response.data = camelcaseKeys(response.data, { deep: true });
    }
    return response;
  },
  (error) => {
    store.dispatch(stopLoading());
    return Promise.reject(error);
  }
);

export const axiosWithTimeout = (
  config: AxiosRequestConfig,
  timeout = TIMEOUT,
  isBackgroundRequest = false
) => {
  return withTimeout(
    apiClient({
      ...config,
      headers: {
        ...config.headers,
        isBackgroundRequest: isBackgroundRequest ? 'true' : 'false',
      },
    }) as Promise<AxiosResponse>,
    timeout
  );
};

export default apiClient;
