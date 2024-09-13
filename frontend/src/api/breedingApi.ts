import { Breeding, BreedingCreate, BreedingUpdate } from '../api/types/breeding';
import axiosWithTimeout from './axiosInstance';

export const getBreedings = async (page?: number, pageSize?: number) => {
    let requestUrl: string = '/breedings/';
    if (page && pageSize) {
        requestUrl = requestUrl.concat(`?page=${page}&page_size=${pageSize}`);
    }
    const response = await axiosWithTimeout.get(requestUrl);
    return {
        items: response.data.items,
        total: response.data.totalCount,
    };
};

export const createBreeding = async (breedingData: BreedingCreate): Promise<Breeding> => {
    const response = await axiosWithTimeout.post(`/breedings/`, breedingData);
    return response.data;
};

export const getBreedingById = async (breedingId: number): Promise<Breeding> => {
    const response = await axiosWithTimeout.get(`/breedings/${breedingId}`);
    return response.data;
};

export const updateBreeding = async (breedingId: number, breedingData: BreedingUpdate): Promise<Breeding> => {
    const response = await axiosWithTimeout.put(`/breedings/${breedingId}`, breedingData);
    return response.data;
};

export const deleteBreeding = async (breedingId: number): Promise<void> => {
    await axiosWithTimeout.delete(`/breedings/${breedingId}`);
};