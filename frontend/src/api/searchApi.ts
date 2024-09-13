import axiosWithTimeout from './axiosInstance';
import { SearchResponse } from '../api/types/core';

export const searchResources = async (
    query: string,
    resources: string[],
    limit: number
): Promise<SearchResponse[]> => {
    try {
        const response = await axiosWithTimeout.get('/search', {
            params: {
                query,
                resources: resources.join(','),
                limit,
            },
        });
        return response.data.results;
    } catch (error) {
        console.error('Error fetching search results:', error);
        return [];
    }
};