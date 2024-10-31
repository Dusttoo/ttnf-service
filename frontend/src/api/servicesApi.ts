import { Service, ServiceCreate, ServiceUpdate, Tag, TagCreate, Category, CategoryCreate } from './types/services';
import axiosWithTimeout from './axiosInstance';

// Services API
export const getServices = async (): Promise<Service[]> => {
    const response = await axiosWithTimeout.get('/services', {
        headers: {
            isBackgroundRequest: 'true', // Set as background request
        },
    });
    return response.data.services;
};

export const getServiceById = async (serviceId: number): Promise<Service> => {
    const response = await axiosWithTimeout.get(`/services/${serviceId}`, {
        headers: {
            isBackgroundRequest: 'true', // Set as background request
        },
    });
    return response.data;
};

export const createService = async (serviceData: ServiceCreate): Promise<Service> => {
    const response = await axiosWithTimeout.post('/services', serviceData);
    return response.data;
};

export const updateService = async (serviceId: number, serviceData: ServiceUpdate): Promise<Service> => {
    const response = await axiosWithTimeout.put(`/services/${serviceId}`, serviceData);
    return response.data;
};

export const deleteService = async (serviceId: number): Promise<void> => {
    await axiosWithTimeout.delete(`/services/${serviceId}`);
};

// Tags API
export const getTags = async (): Promise<Tag[]> => {
    const response = await axiosWithTimeout.get('/tags', {
        headers: {
            isBackgroundRequest: 'true', // Set as background request
        },
    });
    return response.data;
};

// Categories API
export const getCategories = async (): Promise<Category[]> => {
    const response = await axiosWithTimeout.get('/categories', {
        headers: {
            isBackgroundRequest: 'true', // Set as background request
        },
    });
    return response.data;
};