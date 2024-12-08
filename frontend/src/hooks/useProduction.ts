import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getProductionsFiltered,
  getProductionById,
  createProduction,
  updateProduction,
  deleteProduction,
} from '../api/productionApi';
import {
  Production,
  ProductionCreate,
  ProductionUpdate,
  SelectedFilters,
} from '../api/types/dog';

export const useProductions = (
  filters: SelectedFilters,
  page: number,
  pageSize: number
) => {
  return useQuery(
    ['productions', filters, page, pageSize],
    () => getProductionsFiltered(filters, page, pageSize),
    {
      keepPreviousData: true,
    }
  );
};

export const useProduction = (productionId: number) => {
  return useQuery<Production, Error>(['production', productionId], () =>
    getProductionById(productionId)
  );
};

export const useCreateProduction = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (newProduction: ProductionCreate) => createProduction(newProduction),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('productions');
      },
      onError: (error) => {
        console.error('Error creating production:', error); 
        throw error; 
      },
    }
  );
};

export const useUpdateProduction = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({
      productionId,
      productionData,
    }: {
      productionId: number;
      productionData: ProductionUpdate;
    }) => updateProduction(productionId, productionData),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries('productions');
        queryClient.invalidateQueries(['production', variables.productionId]);
      },
      onError: (error) => {
        console.error('Error updating production:', error); 
        throw error; 
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
