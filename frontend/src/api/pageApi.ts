import apiClient from './axiosInstance';
import { Page } from '../types';

export const getPages = async (): Promise<Page[]> => {
    const response = await apiClient.get<Page[]>('/pages');
    return response.data;
};

export const getPageById = async (id: number): Promise<Page> => {
    const response = await apiClient.get<Page>(`/pages/${id}`);
    return response.data;
};

export const getPageBySlug = async (slug: string): Promise<Page> => {
    const response = await apiClient.get<Page>(`/pages/slug/${slug}`);
    console.log("api page: ", response.data)
    return response.data;
};

export const createPage = async (pageData: Partial<Page>): Promise<Page> => {
    const response = await apiClient.post<Page>('/pages', pageData);
    return response.data;
};

export const updatePage = async (id: number, page: Page): Promise<void> => {
    await apiClient.put(`/pages/${id}`, page);
};

export const deletePage = async (id: number): Promise<void> => {
    await apiClient.delete(`/pages/${id}`);
};