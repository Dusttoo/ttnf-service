import { Breeding, BreedingCreate, BreedingUpdate } from '../api/types/breeding';
import apiClient from './axiosInstance';

export const getBreedings = async (page?: number, pageSize?: number) => {
    const requestUrl: string = '/breedings/'
    if (page && pageSize) {
        requestUrl.concat(`?page=${page}&page_size=${pageSize}`)
    }
    const response = await apiClient.get(requestUrl);
    return {
        items: response.data.items,
        total: response.data.totalCount,
    };
};

export const createBreeding = async (breedingData: BreedingCreate): Promise<Breeding> => {
    const response = await apiClient.post(`/breedings/`, breedingData);
    return response.data;
};

export const getBreedingById = async (breedingId: number): Promise<Breeding> => {
    const response = await apiClient.get(`/breedings/${breedingId}`);
    return response.data;
};

export const updateBreeding = async (breedingId: number, breedingData: BreedingUpdate): Promise<Breeding> => {
    const response = await apiClient.put(`/breedings/${breedingId}`, breedingData);
    return response.data;
};

export const deleteBreeding = async (breedingId: number): Promise<void> => {
    await apiClient.delete(`/breedings/${breedingId}`);
};