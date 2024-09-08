import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchResources } from '../api/searchApi';
import { SearchResponse } from '../types';

interface SearchState {
    results: object[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: SearchState = {
    results: [],
    status: 'idle',
    error: null,
};

export const performSearch = createAsyncThunk('search/performSearch', async ({ query, resources, limit }: { query: string, resources: string[], limit?: number }) => {
    const response = await searchResources(query, resources, limit ?? 100);
    return response;
});

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(performSearch.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(performSearch.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.results = action.payload;
            })
            .addCase(performSearch.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || null;
            });
    },
});

export default searchSlice.reducer;