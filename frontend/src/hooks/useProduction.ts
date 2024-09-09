import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getProductions, getProductionById, createProduction, updateProduction, deleteProduction } from '../api/productionApi';
import { Production, ProductionCreate, ProductionUpdate } from '../api/types/dog';

export const useProductions = (page: number, pageSize: number) => {
    return useQuery(['productions', page, pageSize], () => getProductions(page, pageSize), {
        keepPreviousData: true,
    });
};

export const useProduction = (productionId: number) => {
    return useQuery<Production, Error>(['production', productionId], () => getProductionById(productionId));
};

export const useCreateProduction = () => {
    const queryClient = useQueryClient();
    return useMutation((newProduction: ProductionCreate) => createProduction(newProduction), {
        onSuccess: () => {
            queryClient.invalidateQueries('productions');
        },
    });
};

export const useUpdateProduction = () => {
    const queryClient = useQueryClient();
    return useMutation(
        ({ productionId, productionData }: { productionId: number; productionData: ProductionUpdate }) => updateProduction(productionId, productionData),
        {
            onSuccess: (_data, variables) => {
                queryClient.invalidateQueries('productions');
                queryClient.invalidateQueries(['production', variables.productionId]);
            },
        }
    );
};

export const useDeleteProduction = () => {
    const queryClient = useQueryClient();
    return useMutation((productionId: number) => deleteProduction(productionId), {
        onSuccess: () => {
            queryClient.invalidateQueries('productions');
        },
    });
};