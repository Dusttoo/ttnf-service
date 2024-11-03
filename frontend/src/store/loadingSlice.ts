import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

const initialState = {
    requestCount: 0,
};

const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        startLoading: (state) => {
            state.requestCount += 1;
        },
        stopLoading: (state) => {
            if (state.requestCount > 0) {
                state.requestCount -= 1;
            }
        },
    },
});

export const { startLoading, stopLoading } = loadingSlice.actions;
export const selectIsLoading = (state: RootState) => state.loading.requestCount > 0;
export default loadingSlice.reducer;