import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import * as dogService from '../api/dogApi';
import { Dog, DogCreate, DogUpdate, SelectedFilters } from '../api/types/dog';
import { RootState } from '../store';

interface DogsState {
    items: Dog[];
    details: Record<number, Dog>;
    filters: SelectedFilters;
    pagination: {
        page: number;
        pageSize: number;
        totalCount: number;
    };
    error: string | null | undefined;
}

const initialState: DogsState = {
    items: [],
    details: {},
    filters: {},
    pagination: {
        page: 1,
        pageSize: 10,
        totalCount: 0,
    },
    error: null,
};

export const fetchDogs = createAsyncThunk(
    'dogs/fetchDogs',
    async ({ page, pageSize, filters }: { page?: number; pageSize?: number; filters: SelectedFilters }, { getState }) => {
        const state = getState() as RootState;
        const dogs = state.dogs.items;
        const pagination = state.dogs.pagination;

        if (dogs.length && pagination.page === page && pagination.pageSize === pageSize && JSON.stringify(filters) === JSON.stringify(state.dogs.filters)) {
            return { items: dogs, total: pagination.totalCount };
        }
        const response = await dogService.getDogsFiltered(filters, page, pageSize);
        return response;
    }
);

export const fetchDogById = createAsyncThunk(
    'dogs/fetchDogById',
    async (dogId: number, { getState }) => {
        const state = getState() as RootState;
        const dogDetails = state.dogs.details[dogId];

        if (dogDetails) {
            return dogDetails;
        }

        const response = await dogService.getDogById(dogId);
        return response;
    }
);

export const createDog = createAsyncThunk(
    'dogs/createDog',
    async (dogData: DogCreate) => {
        const response = await dogService.createDog(dogData);
        return response;
    }
);

export const updateDog = createAsyncThunk(
    'dogs/updateDog',
    async ({ dogId, dogData }: { dogId: number; dogData: DogUpdate }) => {
        const response = await dogService.updateDog(dogId, dogData);
        return response;
    }
);

export const deleteDog = createAsyncThunk(
    'dogs/deleteDog',
    async (dogId: number) => {
        await dogService.deleteDog(dogId);
        return dogId;
    }
);

const dogsSlice = createSlice({
    name: 'dogs',
    initialState,
    reducers: {
        setFilters(state, action) {
            state.filters = action.payload;
        },
        setPagination(state, action) {
            state.pagination = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDogs.pending, (state) => {
                
            })
            .addCase(fetchDogs.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.pagination.totalCount = action.payload.total;
            })
            .addCase(fetchDogs.rejected, (state, action) => {
                state.error = action.error.message;
            })
            .addCase(fetchDogById.pending, (state) => {
                
            })
            .addCase(fetchDogById.fulfilled, (state, action) => {
                state.details[action.payload.id] = action.payload;
            })
            .addCase(fetchDogById.rejected, (state, action) => {
                state.error = action.error.message;
            })
            .addCase(createDog.pending, (state) => {
                
            })
            .addCase(createDog.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(createDog.rejected, (state, action) => {
                state.error = action.error.message;
            })
            .addCase(updateDog.pending, (state) => {
                
            })
            .addCase(updateDog.fulfilled, (state, action) => {
                const index = state.items.findIndex((dog) => dog.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                state.details[action.payload.id] = action.payload;
            })
            .addCase(updateDog.rejected, (state, action) => {
                state.error = action.error.message;
            })
            .addCase(deleteDog.pending, (state) => {
                
            })
            .addCase(deleteDog.fulfilled, (state, action) => {
                state.items = state.items.filter((dog) => dog.id !== action.payload);
                delete state.details[action.payload];
            })
            .addCase(deleteDog.rejected, (state, action) => {
                state.error = action.error.message;
            });
    },
});

export const { setFilters, setPagination } = dogsSlice.actions;

export const selectDogById = createSelector(
    (state: RootState) => state.dogs.details,
    (_: RootState, dogId: number) => dogId,
    (details: Record<number, Dog>, dogId: number) => details[dogId]
);

export default dogsSlice.reducer;