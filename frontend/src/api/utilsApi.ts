import axiosWithTimeout from './axiosInstance'

export const clearCache = async () => {
  const response = await axiosWithTimeout.post('/utils/clear-cache');
  return response.data;
};