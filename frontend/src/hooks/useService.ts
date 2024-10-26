import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../api/servicesApi';
import { ServiceCreate, ServiceUpdate } from '../api/types/services';

// Fetch list of services without pagination
export const useServices = () => {
  return useQuery('services', () => getServices(), {
    keepPreviousData: true,
  });
};

// Fetch a single service by ID
export const useServiceById = (serviceId?: number) => {
  return useQuery(['service', serviceId], () => getServiceById(serviceId!), {
    enabled: !!serviceId, // Only fetch when serviceId is provided
  });
};

// Create a new service
export const useCreateService = () => {
  const queryClient = useQueryClient();
  return useMutation((newService: ServiceCreate) => createService(newService), {
    onSuccess: () => {
      queryClient.invalidateQueries('services');
    },
  });
};

// Update an existing service
export const useUpdateService = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({
      serviceId,
      serviceData,
    }: {
      serviceId: number;
      serviceData: ServiceUpdate;
    }) => updateService(serviceId, serviceData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('services');
      },
    }
  );
};

// Delete a service by ID
export const useDeleteService = () => {
  const queryClient = useQueryClient();
  return useMutation(deleteService, {
    onSuccess: () => {
      queryClient.invalidateQueries('services');
    },
  });
};
