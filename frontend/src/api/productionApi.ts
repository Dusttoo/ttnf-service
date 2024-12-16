import axiosWithTimeout from './axiosInstance';
import {
    Production,
    ProductionCreate,
    ProductionUpdate,
    SelectedFilters,
} from './types/dog';

export const getProductionsFiltered = async (
    filters: SelectedFilters,
    page: number,
    pageSize: number,
    orderBy?: string
) => {
    const { gender, sire, dam } = filters;
    const response = await axiosWithTimeout.get(`/productions`, {
        params: {
            page,
            pageSize,
            gender,
            sireId: sire?.id,
            damId: dam?.id,
            orderBy
        },
        headers: {
            isBackgroundRequest: 'true', 
        },
    });

    return response.data;
};

export const getProductionById = async (id: number): Promise<Production> => {
    const response = await axiosWithTimeout.get(`/productions/${id}`, {
        headers: {
            isBackgroundRequest: 'true', 
        },
    });
    return response.data;
};

export const createProduction = async (
    productionData: ProductionCreate,
): Promise<Production> => {
    const response = await axiosWithTimeout.post('/productions/', productionData);
    return response.data;
};

export const updateProduction = async (
    productionId: number,
    productionData: ProductionUpdate,
): Promise<Production> => {
    const response = await axiosWithTimeout.put(
        `/productions/${productionId}`,
        productionData,
        {
            headers: {
                isBackgroundRequest: 'true', 
            },
        }
    );
    return response.data;
};

export const deleteProduction = async (productionId: number): Promise<void> => {
    await axiosWithTimeout.delete(`/productions/${productionId}`);
};