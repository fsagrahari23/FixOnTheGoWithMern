import { createSlice } from '@reduxjs/toolkit';
import {
    fetchMechanicDashboard,
    fetchMechanicBooking,
    acceptBooking,
    updateBookingStatus
} from './mechanicThunks';

const initialState = {
    // Dashboard data
    profile: null,
    bookings: [],
    stats: {
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0
    },
    earnings: {
        today: 0,
        total: 0
    },
    nearbyBookings: [],
    userRequestedJob: [],
    
    // Current booking details
    currentBooking: null,
    
    // Loading states
    loading: false,
    bookingLoading: false,
    
    // Error states
    error: null,
    bookingError: null
};

const mechanicSlice = createSlice({
    name: 'mechanic',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
            state.bookingError = null;
        },
        clearCurrentBooking: (state) => {
            state.currentBooking = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Dashboard
            .addCase(fetchMechanicDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMechanicDashboard.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload.profile || null;
                state.bookings = action.payload.bookings || [];
                state.stats = action.payload.stats || initialState.stats;
                state.earnings = {
                    today: action.payload.todayEarnings || 0,
                    total: action.payload.totalEarnings || 0
                };
                state.nearbyBookings = action.payload.nearbyBookings || [];
                state.userRequestedJob = action.payload.userRequestedJob || [];
            })
            .addCase(fetchMechanicDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to load dashboard';
            })
            
            // Fetch Booking Details
            .addCase(fetchMechanicBooking.pending, (state) => {
                state.bookingLoading = true;
                state.bookingError = null;
            })
            .addCase(fetchMechanicBooking.fulfilled, (state, action) => {
                state.bookingLoading = false;
                state.currentBooking = action.payload.booking || null;
            })
            .addCase(fetchMechanicBooking.rejected, (state, action) => {
                state.bookingLoading = false;
                state.bookingError = action.payload || 'Failed to load booking';
            })
            
            // Accept Booking
            .addCase(acceptBooking.pending, (state) => {
                state.loading = true;
            })
            .addCase(acceptBooking.fulfilled, (state, action) => {
                state.loading = false;
                // Update the booking in the list
                const index = state.bookings.findIndex(b => b._id === action.payload.booking?._id);
                if (index !== -1) {
                    state.bookings[index] = action.payload.booking;
                }
                // Remove from nearby bookings
                state.nearbyBookings = state.nearbyBookings.filter(
                    b => b._id !== action.payload.booking?._id
                );
            })
            .addCase(acceptBooking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to accept booking';
            })
            
            // Update Booking Status
            .addCase(updateBookingStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateBookingStatus.fulfilled, (state, action) => {
                state.loading = false;
                // Update the booking in the list
                const index = state.bookings.findIndex(b => b._id === action.payload.booking?._id);
                if (index !== -1) {
                    state.bookings[index] = action.payload.booking;
                }
                // Update current booking if it matches
                if (state.currentBooking?._id === action.payload.booking?._id) {
                    state.currentBooking = action.payload.booking;
                }
                // Update stats
                if (action.payload.stats) {
                    state.stats = action.payload.stats;
                }
            })
            .addCase(updateBookingStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Failed to update booking';
            });
    }
});

export const { clearError, clearCurrentBooking } = mechanicSlice.actions;
export default mechanicSlice.reducer;
