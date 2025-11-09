import { configureStore } from '@reduxjs/toolkit';
import locationReducer from './slices/locationSlice';
import themeReducer from './slices/themeSlice';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';

const store = configureStore({
    reducer: {
        location: locationReducer,
        theme: themeReducer,
        auth: authReducer,
        admin: adminReducer,
    },
});

export default store
