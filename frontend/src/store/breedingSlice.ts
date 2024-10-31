import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as breedingService from '../api/breedingApi';
import { Breeding, BreedingCreate, BreedingUpdate } from '../api/types/breeding';
import { RootState } from '../store';

interface BreedingsState {
    items: Breeding[];
    details: Record<number, Breeding>;
    pagination: {
        page: number;
        pageSize: number;
        totalCount: number;
    };
    error: string | null | undefined;
}

const initialState: BreedingsState = {
    items: [],
    details: {},
    pagination: {
        page: 1,
        pageSize: 10,
        totalCount: 0,
    },
    error: null,
};

// Thunks
export const fetchBreedings = createAsyncThunk(
    'breedings/fetchBreedings',
    async ({ page, pageSize }: { page?: number; pageSize?: number }, { getState }) => {
        const state = getState() as RootState;
        const breedings = state.breedings.items;
        const pagination = state.breedings.pagination;

        if (breedings.length && pagination.page === page && pagination.pageSize === pageSize) {
            return { items: breedings, total: pagination.totalCount };
        }
        return await breedingService.getBreedings(page, pageSize);
    },
);

export const fetchBreedingById = createAsyncThunk(
    'breedings/fetchBreedingById',
    async (breedingId: number, { getState }) => {
        const state = getState() as RootState;
        const breedingDetails = state.breedings.details[breedingId];
        return breedingDetails ?? await breedingService.getBreedingById(breedingId);
    },
);

export const createBreeding = createAsyncThunk(
    'breedings/createBreeding',
    async (breedingData: BreedingCreate) => {
        return await breedingService.createBreeding(breedingData);
    },
);

export const updateBreeding = createAsyncThunk(
    'breedings/updateBreeding',
    async ({ breedingId, breedingData }: { breedingId: number; breedingData: BreedingUpdate }) => {
        return await breedingService.updateBreeding(breedingId, breedingData);
    },
);

export const deleteBreeding = createAsyncThunk(
    'breedings/deleteBreeding',
    async (breedingId: number) => {
        await breedingService.deleteBreeding(breedingId);
        return breedingId;
    },
);

// Slice
const breedingsSlice = createSlice({
    name: 'breedings',
    initialState,
    reducers: {
        setPagination(state, action) {
            state.pagination = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBreedings.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.pagination.totalCount = action.payload.total;
            })
            .addCase(fetchBreedings.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(fetchBreedingById.fulfilled, (state, action) => {
                state.details[action.payload.id] = action.payload;
            })
            .addCase(fetchBreedingById.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(createBreeding.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(createBreeding.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(updateBreeding.fulfilled, (state, action) => {
                const index = state.items.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                state.details[action.payload.id] = action.payload;
            })
            .addCase(updateBreeding.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(deleteBreeding.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
                delete state.details[action.payload];
            })
            .addCase(deleteBreeding.rejected, (state, action) => {
                state.error = action.error.message || null;
            });
    },
});

export const { setPagination } = breedingsSlice.actions;

export const selectBreedings = (state: RootState) => state.breedings.items;
export const selectBreedingDetails = (state: RootState, breedingId: number) => state.breedings.details[breedingId];
export const selectBreedingsTotal = (state: RootState) => state.breedings.pagination.totalCount;

export default breedingsSlice.reducer;