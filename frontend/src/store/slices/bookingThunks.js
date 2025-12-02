import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiGet, apiPost } from '../../lib/api';

// Async thunks for booking operations
export const fetchBookings = createAsyncThunk(
    'booking/fetchBookings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGet('/user/api/dashboard');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const createBooking = createAsyncThunk(
    'booking/createBooking',
    async (bookingData, { rejectWithValue }) => {
        try {
            const response = await apiPost('/user/book', bookingData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchBookingDetails = createAsyncThunk(
    'booking/fetchBookingDetails',
    async (id, { rejectWithValue }) => {
        try {
            console.log("Fetching booking details for ID:", id);
            const response = await apiGet(`/user/api/booking/${id}`);
            console.log("Fetched booking details:", response);
            return response;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const selectMechanic = createAsyncThunk(
    'booking/selectMechanic',
    async ({ id, mechanicId }, { rejectWithValue }) => {
        console.log(id)
        try {
            const response = await apiPost(`/user/booking/${id}/select-mechanic`, { mechanicId });
            return response; // apiPost already returns parsed JSON
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to select mechanic');
        }
    }
);

export const cancelBooking = createAsyncThunk(
    'booking/cancelBooking',
    async (id, { rejectWithValue }) => {
        try {
            const response = await apiPost(`/user/booking/${id}/cancel`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const rateBooking = createAsyncThunk(
    'booking/rateBooking',
    async ({ id, ratingData }, { rejectWithValue }) => {
        try {
            const response = await apiPost(`/user/booking/${id}/rate`, ratingData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

export const fetchBookingHistory = createAsyncThunk(
    'booking/fetchBookingHistory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGet('/user/api/history');
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Chat thunks

export const fetchChat = createAsyncThunk(
    "booking/fetchChat",
    async (bookingId, { rejectWithValue }) => {
        try {
            const response = await apiGet(`/chat/${bookingId}/messages`);

            return {
                chatId: response.chatId,
                booking: response.booking,
                chat: response.chat,
                user: response.user,
            };
        } catch (error) {
            return rejectWithValue(error?.response?.data || { message: error.message });
        }
    }
);

export const sendMessage = createAsyncThunk(
    "booking/sendMessage",
    async ({ chatId, message }, { rejectWithValue }) => {
        try {
            const response = await apiPost(`/chat/${chatId}/send`, { message });

            return {
                success: response.success,
                message: message,
            };
        } catch (error) {
            return rejectWithValue(error?.response?.data || { message: error.message });
        }
    }
);

export const fetchMessages = createAsyncThunk(
    "booking/fetchMessages",
    async (chatId, { rejectWithValue }) => {
        try {
            const response = await apiGet(`/chat/${chatId}/messages`);

            return {
                messages: response.messages,
                chatId: chatId,
            };
        } catch (error) {
            return rejectWithValue(error?.response?.data || { message: error.message });
        }
    }
);

export const fetchUnreadCount = createAsyncThunk(
    "booking/fetchUnreadCount",
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGet(`/chat/unread/count`);

            return {
                unreadCount: response.unreadCount,
            };
        } catch (error) {
            return rejectWithValue(error?.response?.data || { message: error.message });
        }
    }
);

// Maintenance thunks
export const fetchMaintenanceData = createAsyncThunk(
    'booking/fetchMaintenanceData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGet('/user/api/maintenance');
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const scheduleMaintenance = createAsyncThunk(
    'booking/scheduleMaintenance',
    async (maintenanceData, { rejectWithValue }) => {
        try {
            const response = await apiPost('/user/maintenance', maintenanceData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Emergency thunks
export const fetchEmergencyData = createAsyncThunk(
    'booking/fetchEmergencyData',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGet('/user/api/emergency');
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const requestEmergency = createAsyncThunk(
    'booking/requestEmergency',
    async (emergencyData, { rejectWithValue }) => {
        try {
            const response = await apiPost('/user/emergency', emergencyData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Payment thunk
export const processPayment = createAsyncThunk(
    'booking/processPayment',
    async ({ bookingId, paymentMethodId }, { rejectWithValue }) => {
        try {
            const response = await apiPost(`/payment/${bookingId}/process`, { paymentMethodId });
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);
