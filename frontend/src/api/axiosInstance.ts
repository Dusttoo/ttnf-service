import axios from 'axios';
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';
import store from '../store';
import { startLoading, stopLoading } from '../store/loadingSlice';

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("REACT_APP_BACKEND_URL:", process.env.REACT_APP_BACKEND_URL);

let API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';
if (process.env.NODE_ENV !== 'development') {
    API_BASE_URL = API_BASE_URL.replace(/^http:\/\//i, 'https://');
}

const apiClient = axios.create({
    baseURL: API_BASE_URL || "https://api-dev.texastopnotchfrenchies.com/api/v1",
    headers: {
        'Content-Type': 'application/json',
    },
});

const getToken = () => {
    const token = localStorage.getItem('token');
    console.log("Auth Token:", token);
    return token;
};

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

        console.log("API Request Details:");
        console.log("URL:", config.url);
        console.log("Method:", config.method);
        console.log("Headers:", config.headers);
        console.log("Data:", config.data);

        return config;
    },
    (error) => {
        console.error("API Request Error:", error);
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
        console.log("API Response Details:");
        console.log("URL:", response.config.url);
        console.log("Status:", response.status);
        console.log("Data:", response.data);
        console.log("Headers:", response.headers);
        return response;
    },
    (error) => {
        console.error("API Response Error:", error.response || error.message);
        store.dispatch(stopLoading());
        return Promise.reject(error);
    }
);

export default apiClient;