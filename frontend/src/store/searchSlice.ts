import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchResources } from '../api/searchApi';

interface SearchState {
    results: object[];
    error: string | null;
}

const initialState: SearchState = {
    results: [],
    error: null,
};

export const performSearch = createAsyncThunk(
    'search/performSearch',
    async ({ query, resources, limit }: { query: string; resources: string[]; limit?: number }) => {
        const response = await searchResources(query, resources, limit ?? 100);
        return response;
    },
);

const searchSlice = createSlice({
    name: 'search',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(performSearch.fulfilled, (state, action) => {
                state.results = action.payload;
                state.error = null;
            })
            .addCase(performSearch.rejected, (state, action) => {
                state.error = action.error.message || 'An error occurred';
            });
    },
});

export default searchSlice.reducer;