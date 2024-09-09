import apiClient from './axiosInstance';
import { Production, ProductionCreate, ProductionUpdate } from '../api/types';

export const getProductions = async (page: number, pageSize: number): Promise<{ items: Production[], totalCount: number }> => {
    const response = await apiClient.get(`/productions/?page=${page}&pageSize=${pageSize}`);
    return response.data;
};

export const getProductionById = async (id: number): Promise<Production> => {
    const response = await apiClient.get(`/productions/${id}`);
    return response.data;
};

export const createProduction = async (productionData: ProductionCreate): Promise<Production> => {
    const response = await apiClient.post('/productions/', productionData);
    return response.data;
};

export const updateProduction = async (productionId: number, productionData: ProductionUpdate): Promise<Production> => {
    const response = await apiClient.put(`/productions/${productionId}`, productionData);
    return response.data;
};

export const deleteProduction = async (productionId: number): Promise<void> => {
    await apiClient.delete(`/productions/${productionId}`);
};