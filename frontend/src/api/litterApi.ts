import apiClient from './axiosInstance';
import { LitterCreate, Litter, PuppyCreate, LitterUpdate } from '../api/types/breeding';
import { Dog } from './types/dog';

export const createLitter = async (litterData: LitterCreate): Promise<Litter> => {
    const response = await apiClient.post(`/litters/`, litterData);
    return response.data;
};

export const getLitterById = async (id: number): Promise<Litter> => {
    const response = await apiClient.get(`/litters/${id}`);
    return response.data;
};

export const getAllLitters = async (page?: number, pageSize?: number): Promise<{ items: Litter[], totalCount: number }> => {
    const requestUrl: string = '/litters/'
    if (page && pageSize) {
        requestUrl.concat(`?page=${page}&page_size=${pageSize}`)
    }
    const response = await apiClient.get(requestUrl);
    return response.data;
};

export const populateLitter = async (breedingId: number, litterData: LitterCreate): Promise<Litter> => {
    const response = await apiClient.post(`/litters/${breedingId}`, litterData);
    return response.data;
};

export const addPuppiesToLitter = async (litterId: number, puppies: PuppyCreate[]): Promise<Dog[]> => {
    const response = await apiClient.post(`/litters/${litterId}/puppies`, puppies);
    return response.data;
};

export const deleteLitter = async (litterId: number): Promise<void> => {
    await apiClient.delete(`/litters/${litterId}`);
};

export const getPuppiesByLitterId = async (litterId: number): Promise<Dog[]> => {
    const response = await apiClient.get(`/litters/${litterId}/puppies`);
    return response.data;
};

export const updateLitter = async (litterId: number, litterData: LitterUpdate): Promise<Litter> => {
    const response = await apiClient.put(`/litters/${litterId}`, litterData);
    return response.data;
};

export const getLittersByBreeding = async (breedingId: number): Promise<Litter[]> => {
    const response = await apiClient.get(`/litters/by-breeding/${breedingId}`);
    return response.data;
};