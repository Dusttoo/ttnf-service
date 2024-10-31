import axiosWithTimeout from './axiosInstance';
import { WebsiteSettings } from './types/core';

export const clearCache = async () => {
    const response = await axiosWithTimeout.post('/utils/clear-cache');
    return response.data;
};

export const fetchWebsiteSettings = async (): Promise<WebsiteSettings> => {
    const response = await axiosWithTimeout.get('/settings', {
        headers: {
            isBackgroundRequest: 'true', // Set as background request
        },
    });
    return response.data;
};