import axiosWithTimeout from './axiosInstance';
import { ImageResponse } from './types/media';

export const uploadImage = async (file: File): Promise<ImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosWithTimeout.post<ImageResponse>('/images/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getImageUrl = async (filename: string): Promise<ImageResponse> => {
    const response = await axiosWithTimeout.get<ImageResponse>(`/images/${filename}`);
    return response.data;
};