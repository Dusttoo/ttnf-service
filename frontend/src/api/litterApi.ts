import axiosWithTimeout from './axiosInstance';
import { LitterCreate, Litter, PuppyCreate, LitterUpdate } from './types/breeding';
import { Dog } from './types/dog';

export const createLitter = async (litterData: LitterCreate): Promise<Litter> => {
    const response = await axiosWithTimeout.post(`/litters/`, litterData);
    return response.data;
};

export const getLitterById = async (id: number): Promise<Litter> => {
    const response = await axiosWithTimeout.get(`/litters/${id}`);
    return response.data;
};

export const getAllLitters = async (page?: number, pageSize?: number): Promise<{ items: Litter[], totalCount: number }> => {
    const requestUrl: string = '/litters/'
    if (page && pageSize) {
        requestUrl.concat(`?page=${page}&page_size=${pageSize}`)
    }
    const response = await axiosWithTimeout.get(requestUrl);
    return response.data;
};

export const populateLitter = async (breedingId: number, litterData: LitterCreate): Promise<Litter> => {
    const response = await axiosWithTimeout.post(`/litters/${breedingId}`, litterData);
    return response.data;
};

export const addPuppiesToLitter = async (litterId: number, puppies: PuppyCreate[]): Promise<Dog[]> => {
    const response = await axiosWithTimeout.post(`/litters/${litterId}/puppies`, puppies);
    return response.data;
};

export const deleteLitter = async (litterId: number): Promise<void> => {
    await axiosWithTimeout.delete(`/litters/${litterId}`);
};

export const getPuppiesByLitterId = async (litterId: number): Promise<Dog[]> => {
    const response = await axiosWithTimeout.get(`/litters/${litterId}/puppies`);
    return response.data;
};

export const updateLitter = async (litterId: number, litterData: LitterUpdate): Promise<Litter> => {
    const response = await axiosWithTimeout.put(`/litters/${litterId}`, litterData);
    return response.data;
};

export const getLittersByBreeding = async (breedingId: number): Promise<Litter[]> => {
    const response = await axiosWithTimeout.get(`/litters/by-breeding/${breedingId}`);
    return response.data;
};