import { configureStore } from '@reduxjs/toolkit';
import locationReducer from './slices/locationSlice';
import themeReducer from './slices/themeSlice';
import authReducer from './slices/authSlice';

const store = configureStore({
    reducer: {
        location: locationReducer,
        theme: themeReducer,
        auth: authReducer,
    },
});

export default store
