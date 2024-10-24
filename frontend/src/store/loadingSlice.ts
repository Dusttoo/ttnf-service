import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

const initialState = {
    isLoading: true,
};

const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        startLoading: (state) => {
            state.isLoading = true;
        },
        stopLoading: (state) => {
            state.isLoading = false;
        },
    },
});

export const { startLoading, stopLoading } = loadingSlice.actions;
export const selectIsLoading = (state: RootState) => state.loading.isLoading;
export default loadingSlice.reducer;
