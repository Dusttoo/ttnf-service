import axiosWithTimeout from './axiosInstance';
import { Page } from './types/page';

export const getPages = async (): Promise<Page[]> => {
  const response = await axiosWithTimeout.get<Page[]>('/pages');
  return response.data;
};

export const getPageById = async (id: string): Promise<Page> => {
  const response = await axiosWithTimeout.get<Page>(`/pages/${id}`);
  return response.data;
};

export const getPageBySlug = async (slug: string): Promise<Page> => {
  const response = await axiosWithTimeout.get<Page>(`/pages/slug/${slug}`);
  return response.data;
};

export const createPage = async (pageData: Partial<Page>): Promise<Page> => {
  const response = await axiosWithTimeout.post<Page>('/pages', pageData);
  return response.data;
};

export const updatePage = async (id: string, page: Page): Promise<void> => {
  await axiosWithTimeout.put(`/pages/${id}`, page);
};

export const deletePage = async (id: string): Promise<void> => {
  await axiosWithTimeout.delete(`/pages/${id}`);
};
