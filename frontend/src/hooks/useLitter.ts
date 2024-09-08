import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getLitterById, createLitter, updateLitter, getAllLitters, deleteLitter, addPuppiesToLitter, getLittersByBreeding } from '../api/litterApi';
import { Litter, LitterCreate, LitterUpdate, PuppyCreate, DogCreate } from '../types';

export const useLitters = (page: number, pageSize: number) => {
    return useQuery(['litters', page, pageSize], async () => {
        const data = await getAllLitters(page, pageSize);
        return {
            ...data,
            items: data.items,
        };
    }, {
        keepPreviousData: true,
    });
};

export const useLitter = (litterId: number, options: { enabled: boolean }) => {
    return useQuery<Litter, Error>(['litter', litterId], async () => {
        const data = await getLitterById(litterId);
        return data;
    }, options);
};

export const useCreateLitter = () => {
    const queryClient = useQueryClient();
    return useMutation((newLitter: LitterCreate) => createLitter(newLitter), {
        onSuccess: () => {
            queryClient.invalidateQueries('litters');
        },
    });
};

export const useUpdateLitter = () => {
    const queryClient = useQueryClient();
    return useMutation(
        ({ litterId, litterData }: { litterId: number, litterData: LitterUpdate }) => updateLitter(litterId, litterData),
        {
            onSuccess: (_data, variables) => {
                queryClient.invalidateQueries('litters');
                queryClient.invalidateQueries(['litter', variables.litterId]);
            },
        }
    );
};

export const useDeleteLitter = () => {
    const queryClient = useQueryClient();
    return useMutation((litterId: number) => deleteLitter(litterId), {
        onSuccess: () => {
            queryClient.invalidateQueries('litters');
        },
    });
};

export const useAddPuppiesToLitter = () => {
    const queryClient = useQueryClient();
    return useMutation(
        ({ litterId, puppies }: { litterId: number; puppies: PuppyCreate[] | DogCreate[] }) => addPuppiesToLitter(litterId, puppies),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('litters');
            },
        }
    );
};

export const useLittersByBreeding = (breedingId: number, options: { enabled: boolean }) => {
    return useQuery<Litter[], Error>(['littersByBreeding', breedingId], async () => {
        const data = await getLittersByBreeding(breedingId);
        return data;
    }, options);
};