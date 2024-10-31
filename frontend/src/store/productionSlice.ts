import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as productionService from '../api/productionApi';
import {
    Production,
    ProductionCreate,
    ProductionUpdate,
    SelectedFilters,
} from '../api/types/dog';
import { GenderEnum } from '../api/types/core';
import { RootState } from '../store';

interface ProductionsState {
    items: Production[];
    details: Record<number, Production>;
    pagination: {
        page: number;
        pageSize: number;
        totalCount: number;
    };
    filters: SelectedFilters;
    error: string | null;
}

const initialState: ProductionsState = {
    items: [],
    details: {},
    pagination: {
        page: 1,
        pageSize: 10,
        totalCount: 0,
    },
    filters: {
        gender: undefined,
        sire: undefined,
        dam: undefined,
    },
    error: null,
};

export const fetchProductions = createAsyncThunk(
    'productions/fetchProductions',
    async (
        {
            page,
            pageSize,
            gender,
            sire,
            dam,
        }: {
            page: number;
            pageSize: number;
            gender?: GenderEnum;
            sire?: number;
            dam?: number;
        },
        { getState },
    ) => {
        const state = getState() as RootState;
        const { items, pagination, filters } = state.productions;

        const startIndex = (page - 1) * pageSize;
        const endIndex = page * pageSize;
        const cachedProductions = items.slice(startIndex, endIndex);

        if (
            cachedProductions.length === pageSize ||
            cachedProductions.length === pagination.totalCount
        ) {
            return { items: cachedProductions, totalCount: pagination.totalCount };
        }

        const response = await productionService.getProductionsFiltered(
            {
                gender: filters.gender || gender,
                sire: filters.sire || (sire ? { id: sire } : undefined),
                dam: filters.dam || (dam ? { id: dam } : undefined),
            },
            page,
            pageSize,
        );
        return response;
    },
);

export const fetchProductionById = createAsyncThunk(
    'productions/fetchProductionById',
    async (productionId: number, { getState }) => {
        const state = getState() as RootState;
        const production = state.productions.details[productionId];

        if (production) {
            return production;
        }

        const response = await productionService.getProductionById(productionId);
        return response;
    },
);

export const createProduction = createAsyncThunk(
    'productions/createProduction',
    async (productionData: ProductionCreate) => {
        const response = await productionService.createProduction(productionData);
        return response;
    },
);

export const updateProduction = createAsyncThunk(
    'productions/updateProduction',
    async ({
               productionId,
               productionData,
           }: {
        productionId: number;
        productionData: ProductionUpdate;
    }) => {
        const response = await productionService.updateProduction(
            productionId,
            productionData,
        );
        return response;
    },
);

export const deleteProduction = createAsyncThunk(
    'productions/deleteProduction',
    async (productionId: number) => {
        await productionService.deleteProduction(productionId);
        return productionId;
    },
);

const productionsSlice = createSlice({
    name: 'productions',
    initialState,
    reducers: {
        setPagination(state, action) {
            state.pagination = action.payload;
        },
        setFilters(state, action) {
            state.filters = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProductions.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.pagination.totalCount = action.payload.totalCount;
            })
            .addCase(fetchProductions.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(fetchProductionById.fulfilled, (state, action) => {
                state.details[action.payload.id] = action.payload;
            })
            .addCase(fetchProductionById.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(createProduction.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(createProduction.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(updateProduction.fulfilled, (state, action) => {
                const index = state.items.findIndex(
                    (item) => item.id === action.payload.id,
                );
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                state.details[action.payload.id] = action.payload;
            })
            .addCase(updateProduction.rejected, (state, action) => {
                state.error = action.error.message || null;
            })
            .addCase(deleteProduction.fulfilled, (state, action) => {
                state.items = state.items.filter((item) => item.id !== action.payload);
                delete state.details[action.payload];
            })
            .addCase(deleteProduction.rejected, (state, action) => {
                state.error = action.error.message || null;
            });
    },
});

// Selectors
export const selectProductions = (state: RootState) => state.productions.items;
export const selectProductionById = (state: RootState, id: number) =>
    state.productions.details[id];
export const selectProductionsTotal = (state: RootState) =>
    state.productions.pagination.totalCount;
export const selectFilters = (state: RootState) => state.productions.filters;

// Export actions and reducer
export const { setPagination, setFilters } = productionsSlice.actions;
export default productionsSlice.reducer;