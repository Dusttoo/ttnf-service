import axiosWithTimeout from './axiosInstance';
import { ImageResponse } from './types/media';

export const uploadImage = async (file: File, entity: string, name: string, type: string): Promise<ImageResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity', entity);
    formData.append('name', name);
    formData.append('type', type);
    
    try {
        const response = await axiosWithTimeout.post<ImageResponse>('/images/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                isBackgroundRequest: 'true', 
            },
        });
        return response.data;
    } catch (error) {
        console.error("Upload error:", error);
        throw error;
    }
};

export const getImageUrl = async (filename: string): Promise<ImageResponse> => {
    const response = await axiosWithTimeout.get<ImageResponse>(`/images/${filename}`, {
        headers: {
            isBackgroundRequest: 'true', 
        },
    });
    return response.data;
};