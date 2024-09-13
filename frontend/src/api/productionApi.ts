import axiosWithTimeout from './axiosInstance';
import { Production, ProductionCreate, ProductionUpdate } from './types/dog';

export const getProductions = async (page: number, pageSize: number): Promise<{ items: Production[], totalCount: number }> => {
    const response = await axiosWithTimeout.get(`/productions/?page=${page}&pageSize=${pageSize}`);
    return response.data;
};

export const getProductionById = async (id: number): Promise<Production> => {
    const response = await axiosWithTimeout.get(`/productions/${id}`);
    return response.data;
};

export const createProduction = async (productionData: ProductionCreate): Promise<Production> => {
    const response = await axiosWithTimeout.post('/productions/', productionData);
    return response.data;
};

export const updateProduction = async (productionId: number, productionData: ProductionUpdate): Promise<Production> => {
    const response = await axiosWithTimeout.put(`/productions/${productionId}`, productionData);
    return response.data;
};

export const deleteProduction = async (productionId: number): Promise<void> => {
    await axiosWithTimeout.delete(`/productions/${productionId}`);
};