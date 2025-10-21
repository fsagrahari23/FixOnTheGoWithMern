import { configureStore } from '@reduxjs/toolkit';
import locationReducer from './slices/locationSlice';
import themeReducer from './slices/themeSlice';

const store = configureStore({
    reducer: {
        location: locationReducer,
        theme: themeReducer,
    },
});

export default store
