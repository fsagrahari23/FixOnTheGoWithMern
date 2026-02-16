import { configureStore } from '@reduxjs/toolkit';
import locationReducer from './slices/locationSlice';
import themeReducer from './slices/themeSlice';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import bookingReducer from './slices/bookingSlice';
import chatReducer from "./slices/chatSlice";
import mechanicReducer from './slices/mechanicSlice';
import notificationReducer from './slices/notificationSlice';


const store = configureStore({
    reducer: {
        location: locationReducer,
        theme: themeReducer,
        auth: authReducer,
        admin: adminReducer,
        booking: bookingReducer,
        chat: chatReducer,
        mechanic: mechanicReducer,
        notifications: notificationReducer,
    },
});

export default store
