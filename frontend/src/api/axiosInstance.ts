import axios from 'axios';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';
import store from '../store';
import { startLoading, stopLoading } from '../store/loadingSlice';

let API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';
if (process.env.NODE_ENV !== 'development') {
    API_BASE_URL = API_BASE_URL.replace(/^http:\/\//i, 'https://');
}

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const getToken = () => localStorage.getItem('token');

apiClient.interceptors.request.use(
    (config) => {
        store.dispatch(startLoading());

        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data && typeof config.data === 'object' && !(config.data instanceof URLSearchParams) && !(config.data instanceof FormData)) {
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
        store.dispatch(stopLoading());
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

export default apiClient;