import { axiosWithTimeout } from './axiosInstance'; 
import { AuthResponse } from '../api/types/core';

interface LoginData {
    username: string;
    password: string;
}

export const login = async ({ username, password }: LoginData) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axiosWithTimeout(
        {
            method: 'post',
            url: '/auth/token',
            data: formData,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        },
        10000
    );

    if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
    } else {
        throw new Error('Authentication failed');
    }
    return response.data;
};

export const register = async (userData: { username: string; email: string; password: string }): Promise<AuthResponse> => {
    const response = await axiosWithTimeout(
        {
            method: 'post',
            url: '/auth/register',
            data: userData,
        },
        10000
    );
    return response.data;
};

export const logout = async (): Promise<void> => {
    await axiosWithTimeout(
        {
            method: 'post',
            url: '/logout',
        },
        10000
    );
};