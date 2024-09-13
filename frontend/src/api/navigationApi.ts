import axiosWithTimeout from './axiosInstance';
import { NavLink } from './types/navigation';

export const getNavLinks = async (): Promise<NavLink[]> => {
    const response = await axiosWithTimeout.get<NavLink[]>('/navigation/links');
    return response.data;
};

export const createNavLink = async (navLink: Partial<NavLink>): Promise<NavLink> => {
    const response = await axiosWithTimeout.post<NavLink>('/navigation/links', navLink);
    return response.data;
};

export const updateNavLink = async (navLink: Partial<NavLink>): Promise<NavLink> => {
    const response = await axiosWithTimeout.put<NavLink>('/navigation/links', navLink);
    return response.data;
};

export const deleteNavLink = async (id: number): Promise<void> => {
    await axiosWithTimeout.delete(`/navigation/links/${id}`);
};