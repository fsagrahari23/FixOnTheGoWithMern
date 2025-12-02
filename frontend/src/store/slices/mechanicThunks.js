import { createAsyncThunk } from '@reduxjs/toolkit';
import { apiGet } from '../../lib/api';

// Fetch mechanic dashboard data (stats, earnings, bookings)
export const fetchMechanicDashboard = createAsyncThunk(
    'mechanic/fetchDashboard',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiGet('/mechanic/api/dashboard');
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch dashboard data');
        }
    }
);

// Fetch specific booking details
export const fetchMechanicBooking = createAsyncThunk(
    'mechanic/fetchBooking',
    async (bookingId, { rejectWithValue }) => {
        try {
            const response = await apiGet(`/mechanic/api/booking/${bookingId}`);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch booking details');
        }
    }
);

// Accept a booking request
export const acceptBooking = createAsyncThunk(
    'mechanic/acceptBooking',
    async (bookingId, { rejectWithValue }) => {
        try {
            const response = await apiGet(`/mechanic/booking/${bookingId}/accept`);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to accept booking');
        }
    }
);

// Update booking status (start, complete, etc.)
export const updateBookingStatus = createAsyncThunk(
    'mechanic/updateBookingStatus',
    async ({ bookingId, status }, { rejectWithValue }) => {
        try {
            const response = await apiGet(`/mechanic/booking/${bookingId}/${status}`);
            return response;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to update booking status');
        }
    }
);
