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
            console.log('start loading');
            state.requestCount += 1;
        },
        stopLoading: (state) => {
            console.log('stop loading');
            if (state.requestCount > 0) {
                state.requestCount -= 1;
            }
            console.log(state.requestCount);
        },
    },
});

export const { startLoading, stopLoading } = loadingSlice.actions;
export const selectIsLoading = (state: RootState) => state.loading.requestCount > 0;
export default loadingSlice.reducer;