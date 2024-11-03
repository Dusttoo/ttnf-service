import axiosWithTimeout from './axiosInstance';
import { DashboardStats, PaginatedResponse, ContactSubmission, WaitlistEntry } from './types/admin';


// Function to fetch dashboard stats
export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axiosWithTimeout.get<DashboardStats>('/admin/stats', {
    headers: {
      isBackgroundRequest: 'true', 
    },
  });
  return response.data;
};
  // Function to fetch contact submissions with pagination
  export const fetchContactSubmissions = async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<ContactSubmission>> => {
    const response = await axiosWithTimeout.get<PaginatedResponse<ContactSubmission>>('/admin/contact', {
      params: { page, page_size: pageSize },
      headers: {
        isBackgroundRequest: 'true',
      }
    });
    return response.data;
  };
  
  // Function to fetch waitlist submissions with pagination
  export const fetchAdminWaitlistSubmissions = async (
    page: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<WaitlistEntry>> => {
    const response = await axiosWithTimeout.get<PaginatedResponse<WaitlistEntry>>('/admin/waitlist', {
      params: { page, page_size: pageSize },
      headers: {
        isBackgroundRequest: 'true',
      }
    });
    return response.data;
  };