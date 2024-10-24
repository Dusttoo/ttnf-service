import { axiosWithTimeout } from './axiosInstance';
import { AuthResponse, User } from '../api/types/core';

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
      withCredentials: true,
    },
    10000
  );

  if (
    response.data.message === 'Login successful (cookie-based authentication)'
  ) {
    return response.data;
  } else {
    throw new Error('Authentication failed');
  }
};

export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await axiosWithTimeout(
      {
        method: 'get',
        url: '/auth/validate-session',
        withCredentials: true,
      },
      10000
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch current user:', error);
    return null;
  }
};

export const register = async (userData: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  const response = await axiosWithTimeout(
    {
      method: 'post',
      url: '/auth/register',
      data: userData,
      withCredentials: true,
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
      withCredentials: true,
    },
    10000
  );
};
