import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import * as litterService from '../api/litterApi';
import { PuppyCreate, Dog } from '../api/types/dog';
import { Litter, LitterCreate, LitterUpdate } from '../api/types/breeding';
import { RootState } from '../store';

interface LittersState {
    items: Litter[];
    details: Record<number, Litter>;
    puppies: Record<number, Dog[]>;
    pagination: {
        page: number;
        pageSize: number;
        totalCount: number;
    };
    error: string | null | undefined;
}

const initialState: LittersState = {
    items: [],
    details: {},
    puppies: {},
    pagination: {
        page: 1,
        pageSize: 10,
        totalCount: 0,
    },
    error: null,
};

// Async Thunks
export const fetchLitters = createAsyncThunk(
    'litters/fetchLitters',
    async ({ page, pageSize }: { page?: number; pageSize?: number }) => {
        const response = await litterService.getAllLitters(page, pageSize);
        return response;
    },
);

export const fetchLitterById = createAsyncThunk(
    'litters/fetchLitterById',
    async (litterId: number) => {
        const response = await litterService.getLitterById(litterId);
        return response;
    },
);

export const createLitter = createAsyncThunk(
    'litters/createLitter',
    async (litterData: LitterCreate) => {
        const response = await litterService.createLitter(litterData);
        return response;
    },
);

export const populateLitter = createAsyncThunk(
    'litters/populateLitter',
    async ({ breedingId, litterData }: { breedingId: number; litterData: LitterCreate }) => {
        const response = await litterService.populateLitter(breedingId, litterData);
        return response;
    },
);

export const addPuppiesToLitter = createAsyncThunk(
    'litters/addPuppiesToLitter',
    async ({ litterId, puppies }: { litterId: number; puppies: PuppyCreate[] }) => {
        const response = await litterService.addPuppiesToLitter(litterId, puppies);
        return response;
    },
);

export const deleteLitter = createAsyncThunk(
    'litters/deleteLitter',
    async (litterId: number) => {
        await litterService.deleteLitter(litterId);
        return litterId;
    },
);

export const fetchPuppiesByLitterId = createAsyncThunk(
    'litters/fetchPuppiesByLitterId',
    async (litterId: number) => {
        const response = await litterService.getPuppiesByLitterId(litterId);
        return { litterId, puppies: response };
    },
);

export const updateLitter = createAsyncThunk(
    'litters/updateLitter',
    async ({ litterId, litterData }: { litterId: number; litterData: LitterUpdate }) => {
        const response = await litterService.updateLitter(litterId, litterData);
        return response;
    },
);

// Slice
const littersSlice = createSlice({
    name: 'litters',
    initialState,
    reducers: {
        setPagination(state, action) {
            state.pagination = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLitters.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.pagination.totalCount = action.payload.totalCount;
            })
            .addCase(fetchLitters.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(fetchLitterById.fulfilled, (state, action) => {
                state.details[action.payload.id] = action.payload;
            })
            .addCase(fetchLitterById.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(createLitter.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(createLitter.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(populateLitter.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(populateLitter.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(addPuppiesToLitter.fulfilled, (state, action) => {
                const litterId = action.meta.arg.litterId;
                if (state.details[litterId]) {
                    state.details[litterId].puppies = action.payload;
                }
            })
            .addCase(addPuppiesToLitter.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(updateLitter.fulfilled, (state, action) => {
                const index = state.items.findIndex((litter) => litter.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                state.details[action.payload.id] = action.payload;
            })
            .addCase(updateLitter.rejected, (state, action) => {
                state.error = action.error.message;
            })
            .addCase(deleteLitter.fulfilled, (state, action) => {
                state.items = state.items.filter((litter) => litter.id !== action.payload);
                delete state.details[action.payload];
            })
            .addCase(deleteLitter.rejected, (state, action) => {
                state.error = action.error.message;
            })
            .addCase(fetchPuppiesByLitterId.fulfilled, (state, action) => {
                state.puppies[action.payload.litterId] = action.payload.puppies;
            })
            .addCase(fetchPuppiesByLitterId.rejected, (state, action) => {
                state.error = action.error.message;
            });
    },
});

export const { setPagination } = littersSlice.actions;

// Selectors
export const selectLitters = (state: RootState) => state.litters.items;
export const selectLitterDetails = (state: RootState, litterId: number) => state.litters.details[litterId];

export const selectLitterById = createSelector(
    (state: RootState) => state.litters.details,
    (_: RootState, litterId: number) => litterId,
    (details: Record<number, Litter>, litterId: number) => details[litterId],
);

export const selectPuppiesByLitterId = createSelector(
    (state: RootState) => state.litters.puppies,
    (_: RootState, litterId: number) => litterId,
    (puppies: Record<number, Dog[]>, litterId: number) => puppies[litterId],
);

export default littersSlice.reducer;