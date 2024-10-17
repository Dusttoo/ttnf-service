import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as serviceApi from '../api/servicesApi';
import { Service, ServiceCreate, ServiceUpdate } from '../api/types/services';
import { RootState } from '../store';

interface ServicesState {
    items: Service[];
    details: Record<number, Service>;
    pagination: {
        page: number;
        pageSize: number;
        totalCount: number;
    };
    error: string | null | undefined;
}

const initialState: ServicesState = {
    items: [],
    details: {},
    pagination: {
        page: 1,
        pageSize: 10,
        totalCount: 0,
    },
    error: null,
};

// Thunks for async actions

export const fetchServices = createAsyncThunk(
    'services/fetchServices',
    async ({ page, pageSize }: { page?: number; pageSize?: number }, { getState }) => {
        const state = getState() as RootState;
        const services = state.services.items;
        const pagination = state.services.pagination;

        if (services.length && pagination.page === page && pagination.pageSize === pageSize) {
            return { items: services, total: pagination.totalCount };
        }
        const response = await serviceApi.getServices();
        return { items: response, total: response.length };  // Adjust if pagination support is added
    },
);

export const fetchServiceById = createAsyncThunk(
    'services/fetchServiceById',
    async (serviceId: number, { getState }) => {
        const state = getState() as RootState;
        const serviceDetails = state.services.details[serviceId];

        if (serviceDetails) {
            return serviceDetails;
        }

        const response = await serviceApi.getServiceById(serviceId);
        return response;
    },
);

export const createService = createAsyncThunk(
    'services/createService',
    async (serviceData: ServiceCreate) => {
        const response = await serviceApi.createService(serviceData);
        return response;
    },
);

export const updateService = createAsyncThunk(
    'services/updateService',
    async ({ serviceId, serviceData }: { serviceId: number; serviceData: ServiceUpdate }) => {
        const response = await serviceApi.updateService(serviceId, serviceData);
        return response;
    },
);

export const deleteService = createAsyncThunk(
    'services/deleteService',
    async (serviceId: number) => {
        await serviceApi.deleteService(serviceId);
        return serviceId;
    },
);

// Slice definition

const servicesSlice = createSlice({
    name: 'services',
    initialState,
    reducers: {
        setPagination(state, action) {
            state.pagination = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchServices.pending, (state) => {
            })
            .addCase(fetchServices.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.pagination.totalCount = action.payload.total;
            })
            .addCase(fetchServices.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(fetchServiceById.pending, (state) => {
            })
            .addCase(fetchServiceById.fulfilled, (state, action) => {
                state.details[action.payload.id] = action.payload;
            })
            .addCase(fetchServiceById.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(createService.pending, (state) => {
            })
            .addCase(createService.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(createService.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(updateService.pending, (state) => {
            })
            .addCase(updateService.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                state.details[action.payload.id] = action.payload;
            })
            .addCase(updateService.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(deleteService.pending, (state) => {
            })
            .addCase(deleteService.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
                delete state.details[action.payload];
            })
            .addCase(deleteService.rejected, (state, action) => {
                state.error = action.error.message || null;
            });
    },
});

export const { setPagination } = servicesSlice.actions;

// Selectors
export const selectServices = (state: RootState) => state.services.items;
export const selectServiceDetails = (state: RootState, serviceId: number) => state.services.details[serviceId];
export const selectServicesTotal = (state: RootState) => state.services.pagination.totalCount;

export default servicesSlice.reducer;
