import axiosWithTimeout from './axiosInstance';
import { PaginatedResponse } from './types/core';
import { Dog, DogCreate, DogUpdate, SelectedFilters } from './types/dog';

export const getDogs = async (
  page = 1,
  pageSize = 10
): Promise<PaginatedResponse<Dog>> => {
  const response = await axiosWithTimeout.get<PaginatedResponse<Dog>>('/dogs', {
    params: { page, page_size: pageSize },
    headers: {
      isBackgroundRequest: 'true', // Set as background request
    },
  });
  return response.data;
};

export const getDogById = async (id: number): Promise<Dog> => {
  const response = await axiosWithTimeout.get<Dog>(`/dogs/${id}`, {
    headers: {
      isBackgroundRequest: 'true', // Set as background request
    },
  });
  return response.data;
};

export const createDog = async (dogData: DogCreate): Promise<Dog> => {
  const response = await axiosWithTimeout.post<Dog>('/dogs', dogData);
  return response.data;
};

export const updateDog = async (
  id: number,
  dogData: DogUpdate
): Promise<Dog> => {
  const response = await axiosWithTimeout.put<Dog>(`/dogs/${id}`, dogData, {
    headers: {
      isBackgroundRequest: 'true', // Set as background request
    },
  });
  return response.data;
};

export const deleteDog = async (id: number): Promise<void> => {
  await axiosWithTimeout.delete(`/dogs/${id}`);
};

export const getDogsFiltered = async (
  filters: SelectedFilters,
  page?: number,
  itemsPerPage?: number
) => {
  const params = new URLSearchParams();
  if (filters.gender) params.append('gender', filters.gender);
  if (filters.status && filters.status.length > 0) {
    filters.status.forEach((status) => params.append('status', status));
  }
  if (filters.owned) params.append('owned', 'true');
  if (filters.sire?.id) params.append('sire', filters.sire.id.toString());
  if (filters.dam?.id) params.append('dam', filters.dam.id.toString());
  if (filters.retired !== undefined) {
    params.append('retired', filters.retired.toString());
  }
  if (page !== undefined && itemsPerPage !== undefined) {
    params.append('page', page.toString());
    params.append('page_size', itemsPerPage.toString());
  }

  const response = await axiosWithTimeout.get(
    `/dogs/filtered?${params.toString()}`,
    {
      headers: {
        isBackgroundRequest: 'true', // Set as background request
      },
    }
  );

  return {
    items: response.data.items,
    total: response.data.totalCount,
  };
};
