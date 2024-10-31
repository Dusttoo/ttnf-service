export * from 'axios';

declare module 'axios' {
    interface AxiosRequestConfig {
        isBackgroundRequest: boolean;
    }
}