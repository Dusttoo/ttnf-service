import axiosWithTimeout from './axiosInstance'
import {WebsiteSettings} from './types/core'

export const clearCache = async () => {
  const response = await axiosWithTimeout.post('/utils/clear-cache');
  return response.data;
};

export const fetchWebsiteSettings = async (): Promise<WebsiteSettings> => {
  const response = await axiosWithTimeout.get('/settings');
  return response.data;
};