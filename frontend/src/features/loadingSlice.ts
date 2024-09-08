import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../app/store';

const initialState = {
    isLoading: false,
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
