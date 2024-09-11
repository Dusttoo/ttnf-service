import apiClient from './axiosInstance';
import { AuthResponse } from '../api/types/core';

interface LoginData {
    username: string;
    password: string;
}

export const login = async ({ username, password }: LoginData) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await apiClient.post('/auth/token', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
    } else {
        throw new Error('Authentication failed');
    }
    return response.data;
};

export const register = async (userData: { username: string; email: string; password: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    return response.data;
};

export const logout = async (): Promise<void> => {
    await apiClient.post('/logout');
};