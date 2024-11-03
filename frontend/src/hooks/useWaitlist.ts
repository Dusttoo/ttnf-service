import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  fetchWaitlistEntries,
  filterWaitlistEntries,
  createWaitlistEntry,
  updateWaitlistEntry,
  deleteWaitlistEntry,
} from '../api/waitlistApi';
import { WaitlistCreate, WaitlistUpdate } from '../api/types/admin';

export const useWaitlist = (params: {
  page: number;
  page_size: number;
  sire_id?: number;
  dam_id?: number;
  color?: string;
}) => {
  return useQuery(['waitlist', params], () => filterWaitlistEntries(params), {
    keepPreviousData: true,
  });
};

export const useAddWaitlistEntry = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (newEntry: WaitlistCreate) => createWaitlistEntry(newEntry),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('waitlist');
      },
    }
  );
};

export const useEditWaitlistEntry = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ id, entry }: { id: number; entry: WaitlistUpdate }) =>
      updateWaitlistEntry(id, entry),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('waitlist');
      },
    }
  );
};

export const useDeleteWaitlistEntry = () => {
  const queryClient = useQueryClient();
  return useMutation((id: number) => deleteWaitlistEntry(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('waitlist');
    },
  });
};
