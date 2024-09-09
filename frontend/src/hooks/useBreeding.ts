import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getBreedings, getBreedingById, createBreeding, updateBreeding, deleteBreeding } from '../api/breedingApi';
import { BreedingCreate, BreedingUpdate } from '../api/types/breeding';

export const useBreedings = (page: number, pageSize: number) => {
    return useQuery(['breedings', page, pageSize], () => getBreedings(page, pageSize), {
        keepPreviousData: true,
    });
};

export const useSetPagination = () => {
    const queryClient = useQueryClient();
    return useMutation(
        ({ page, pageSize }: { page: number; pageSize: number }) => {
            return getBreedings(page, pageSize);
        },
        {
            onSuccess: (data, { page, pageSize }) => {
                queryClient.setQueryData(['breedings', page, pageSize], data);
            },
        }
    );
};

export const useBreedingById = (breedingId?: number) => {
    return useQuery(
        ['breeding', breedingId],
        () => getBreedingById(breedingId!),
        {
            enabled: !!breedingId,
        }
    );
};

export const useCreateBreeding = () => {
    const queryClient = useQueryClient();
    return useMutation(
        (newBreeding: BreedingCreate) => createBreeding(newBreeding),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('breedings');
            },
        }
    );
};

export const useUpdateBreeding = () => {
    const queryClient = useQueryClient();
    return useMutation(
        ({ breedingId, breedingData }: { breedingId: number; breedingData: BreedingUpdate }) => updateBreeding(breedingId, breedingData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('breedings');
            },
        }
    );
};

export const useDeleteBreeding = () => {
    const queryClient = useQueryClient();
    return useMutation(deleteBreeding, {
        onSuccess: () => {
            queryClient.invalidateQueries('breedings');
        },
    });
};