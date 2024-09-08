import apiClient from './axiosInstance';
import { ImageResponse } from '../types';

export const uploadImage = async (file: File): Promise<ImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ImageResponse>('/images/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getImageUrl = async (filename: string): Promise<ImageResponse> => {
    const response = await apiClient.get<ImageResponse>(`/images/${filename}`);
    return response.data;
};