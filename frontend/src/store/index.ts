import { configureStore } from '@reduxjs/toolkit';
import dogReducer from './dogSlice';
import pageReducer from './pageSlice';
import loadingReducer from './loadingSlice';
import breedingReducer from './breedingSlice';
import litterReducer from './litterSlice';
import productionReducer from './productionSlice';
import searchReducer from './searchSlice';
import navigationReducer from './navigationSlice';
import editModeReducer from './editModeSlice';
import authReducer from './authSlice';

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
        editMode: editModeReducer,
    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;