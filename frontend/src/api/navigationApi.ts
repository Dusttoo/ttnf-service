import apiClient from './axiosInstance';
import { NavLink } from '../api/types/navigation';

export const getNavLinks = async (): Promise<NavLink[]> => {
    const response = await apiClient.get<NavLink[]>('/navigation/links');
    return response.data;
};

export const createNavLink = async (navLink: Partial<NavLink>): Promise<NavLink> => {
    const response = await apiClient.post<NavLink>('/navigation/links', navLink);
    return response.data;
};

export const updateNavLink = async (navLink: Partial<NavLink>): Promise<NavLink> => {
    const response = await apiClient.put<NavLink>('/navigation/links', navLink);
    return response.data;
};

export const deleteNavLink = async (id: string): Promise<void> => {
    await apiClient.delete(`/navigation/links/${id}`);
};