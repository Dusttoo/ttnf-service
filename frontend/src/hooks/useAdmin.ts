import { useQuery } from 'react-query';
import { fetchDashboardStats } from '../api/adminApi';
import { DashboardStats, ContactSubmission, PaginatedResponse, WaitlistEntry  } from '../api/types/admin';
import { fetchContactSubmissions, fetchAdminWaitlistSubmissions } from '../api/adminApi';

const ADMIN_STATS_QUERY_KEY = 'adminStats';

export const useAdminStats = () => {
  return useQuery<DashboardStats, Error>(
    ADMIN_STATS_QUERY_KEY,
    fetchDashboardStats,
    {
      staleTime: 5 * 60 * 1000, 
      cacheTime: 10 * 60 * 1000, 
      refetchOnWindowFocus: true,
    }
  );
};

interface PaginatedSubmissionsParams {
    page: number;
    pageSize: number;
  }
  
  export const useContactSubmissions = ({ page, pageSize }: PaginatedSubmissionsParams) => {
    return useQuery<PaginatedResponse<ContactSubmission>, Error>(
      ['contactSubmissions', page, pageSize],
      () => fetchContactSubmissions(page, pageSize),
      {
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000, // 5 minutes
      }
    );
  };

  export const useWaitlistSubmissions = ({ page, pageSize }: PaginatedSubmissionsParams) => {
    return useQuery<PaginatedResponse<WaitlistEntry>, Error>(
      ['waitlistSubmissions', page, pageSize],
      () => fetchAdminWaitlistSubmissions(page, pageSize),
      {
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000, // 5 minutes
      }
    );
  };