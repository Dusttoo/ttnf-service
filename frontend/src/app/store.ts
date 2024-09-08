import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import dogReducer from '../features/dogSlice';
import pageReducer from '../features/pageSlice';
import loadingReducer from '../features/loadingSlice'
import breedingReducer from '../features/breedingSlice'
import litterReducer from '../features/litterSlice'
import productionReducer from '../features/productionSlice';
import searchReducer from '../features/searchSlice';
import navigationReducer from '../features/navigationSlice';
import editModeReducer from '../features/editModeSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        dogs: dogReducer,
        pages: pageReducer,
        loading: loadingReducer,
        breedings: breedingReducer,
        litters: litterReducer,
        productions: productionReducer,
        search: searchReducer,
        navigation: navigationReducer,
        editMode: editModeReducer
    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;