import { Breeding, BreedingCreate, BreedingUpdate } from '../api/types/breeding';
import axiosWithTimeout from './axiosInstance';

export const getBreedings = async (page?: number, pageSize?: number) => {
    let requestUrl: string = '/breedings/';
    if (page && pageSize) {
        requestUrl = requestUrl.concat(`?page=${page}&page_size=${pageSize}`);
    }
    const response = await axiosWithTimeout.get(requestUrl, {
        headers: {
            isBackgroundRequest: 'true', // Set as background request
        },
    });
    return {
        items: response.data.items,
        total: response.data.totalCount,
    };
};

export const createBreeding = async (breedingData: BreedingCreate): Promise<Breeding> => {
    const payload = breedingData.manualSireName
        ? {
            ...breedingData,
            manualSireName: breedingData.manualSireName,
            manualSireColor: breedingData.manualSireColor,
            manualSireImageUrl: breedingData.manualSireImageUrl,
            manualSirePedigreeLink: breedingData.manualSirePedigreeLink,
        }
        : breedingData;

    const response = await axiosWithTimeout.post(`/breedings/`, payload);
    return response.data;
};

export const getBreedingById = async (breedingId: number): Promise<Breeding> => {
    const response = await axiosWithTimeout.get(`/breedings/${breedingId}`, {
        headers: {
            isBackgroundRequest: 'true', // Set as background request
        },
    });
    return response.data;
};

export const updateBreeding = async (breedingId: number, breedingData: BreedingUpdate): Promise<Breeding> => {
    const payload = breedingData.manualSireName
        ? {
            ...breedingData,
            manualSireName: breedingData.manualSireName,
            manualSireColor: breedingData.manualSireColor,
            manualSireImageUrl: breedingData.manualSireImageUrl,
            manualSirePedigreeLink: breedingData.manualSirePedigreeLink,
        }
        : breedingData; // Use only registered sire if `maleDogId` is provided

    const response = await axiosWithTimeout.put(`/breedings/${breedingId}`, payload);
    return response.data;
};

export const deleteBreeding = async (breedingId: number): Promise<void> => {
    await axiosWithTimeout.delete(`/breedings/${breedingId}`);
};