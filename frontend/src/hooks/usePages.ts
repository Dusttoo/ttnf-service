import { useQuery } from 'react-query';
import { getPages } from '../api/pageApi';
import { Page } from '../api/types/page';

export const usePages = () => {
    return useQuery<Page[], Error>('pages', getPages, {
        staleTime: 600000, // Cache for 10 minutes
        retry: 1,          // Retry once if the fetch fails
    });
};