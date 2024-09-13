import apiClient from './axiosInstance';
import { PaginatedResponse } from '../api/types/core';
import { Dog, DogCreate, DogUpdate } from '../api/types/dog'

export const getDogs = async (page = 1, pageSize = 10): Promise<PaginatedResponse<Dog>> => {
    const response = await apiClient.get<PaginatedResponse<Dog>>('/dogs', { params: { page, page_size: pageSize } });
    return response.data;
};

export const getDogById = async (id: number): Promise<Dog> => {
    const response = await apiClient.get<Dog>(`/dogs/${id}`);
    return response.data;
};

export const createDog = async (dogData: DogCreate): Promise<Dog> => {
    const response = await apiClient.post<Dog>('/dogs', dogData);
    return response.data;
};

export const updateDog = async (id: number, dogData: DogUpdate): Promise<Dog> => {
    const response = await apiClient.put<Dog>(`/dogs/${id}`, dogData);
    return response.data;
};

export const deleteDog = async (id: number): Promise<void> => {
    await apiClient.delete(`/dogs/${id}`);
};

interface FilterParams {
    gender?: string;
    status?: string[];
    owned?: boolean;
    sireId?: number;
    damId?: number;
}

export const getDogsFiltered = async (filters: FilterParams, page?: number, itemsPerPage?: number) => {
    const params = new URLSearchParams();
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.status && filters.status.length > 0) {
        filters.status.forEach(status => params.append('status', status));
    }
    if (filters.owned) params.append('owned', 'true');
    if (filters.sireId) params.append('sire', filters.sireId.toString());
    if (filters.damId) params.append('dam', filters.damId.toString());
    if (page !== undefined) params.append('page', page.toString());
    if (itemsPerPage !== undefined) params.append('page_size', itemsPerPage.toString());
    const response = await apiClient.get(`/dogs/filtered?${params.toString()}`);
    return {
        items: response.data.items,
        total: response.data.totalCount,
    };
};