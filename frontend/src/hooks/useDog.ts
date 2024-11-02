import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getDogById, deleteDog, createDog, updateDog, getDogsFiltered } from '../api/dogApi';
import { Dog, DogCreate, DogUpdate, SelectedFilters } from '../api/types/dog';

export const useDog = (dogId: number) => {
    return useQuery<Dog, Error>(['dog', dogId], () => getDogById(dogId));
};

export const useDogs = (filters: SelectedFilters, page: number, pageSize: number) => {
    return useQuery(['dogs', filters, page, pageSize], () => getDogsFiltered(filters, page, pageSize), {
      staleTime: 0,
      keepPreviousData: false,
    });
  };

export const useFilteredDogs = (filters: SelectedFilters) => {
    return useQuery(['dogs', filters], () => getDogsFiltered(filters));
};

export const useDeleteDog = () => {
    const queryClient = useQueryClient();
    return useMutation((dogId: number) => deleteDog(dogId), {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dogs'], exact: false });
        },
    });
};

export const useCreateDog = () => {
    const queryClient = useQueryClient();
    return useMutation((newDog: DogCreate) => createDog(newDog), {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dogs'], exact: false });
        },
    });
};

export const useUpdateDog = () => {
    const queryClient = useQueryClient();
    return useMutation(
        ({ dogId, dogData }: { dogId: number, dogData: DogUpdate }) => updateDog(dogId, dogData),
        {
            onSuccess: (_data, variables) => {
                queryClient.invalidateQueries({ queryKey: ['dogs'], exact: false });
                queryClient.invalidateQueries(['dog', variables.dogId]);
              },
        }
    );
};