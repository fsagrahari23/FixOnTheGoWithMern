import { createSlice } from '@reduxjs/toolkit';
import {
    fetchBookings,
    createBooking,
    fetchBookingDetails,
    selectMechanic,
    cancelBooking,
    rateBooking,
    fetchBookingHistory,
    fetchMaintenanceData,
    scheduleMaintenance,
    fetchEmergencyData,
    requestEmergency,
    processPayment,
} from './bookingThunks';

const bookingSlice = createSlice({
    name: 'booking',
    initialState: {
        bookings: [],
        currentBooking: null,
        bookingHistory: [],
        stats: {},
        categories: {},
        isPremium: false,
        remainingBookings: 0,
        nearbyMechanics: [],
        subscription: null,
        freeTowingRemaining: 0,
        // Maintenance state
        maintenance: {
            recentMaintenance: [],
            loading: false,
            error: null,
        },
        // Emergency state
        emergency: {
            recentEmergency: [],
            loading: false,
            error: null,
        },
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentBooking: (state, action) => {
            state.currentBooking = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBookings.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.bookings = action.payload.bookings;
                state.stats = action.payload.stats;
                state.categories = action.payload.categories;
                state.isPremium = action.payload.isPremium;
                state.remainingBookings = action.payload.remainingBookings;
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createBooking.pending, (state) => {
                state.loading = true;
            })
            .addCase(createBooking.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchBookingDetails.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBookingDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBooking = action.payload.booking;
                state.nearbyMechanics = action.payload.nearbyMechanics || [];
                state.subscription = action.payload.subscription || null;
                state.freeTowingRemaining = action.payload.freeTowingRemaining || 0;
                state.isPremium = action.payload.isPremium || false;
            })
            .addCase(fetchBookingDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(selectMechanic.pending, (state) => {
                state.loading = true;
            })
            .addCase(selectMechanic.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(selectMechanic.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(cancelBooking.pending, (state) => {
                state.loading = true;
            })
            .addCase(cancelBooking.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(cancelBooking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(rateBooking.pending, (state) => {
                state.loading = true;
            })
            .addCase(rateBooking.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(rateBooking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchBookingHistory.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchBookingHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.bookingHistory = action.payload.bookings;
            })
            .addCase(fetchBookingHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Maintenance cases
            .addCase(fetchMaintenanceData.pending, (state) => {
                state.maintenance.loading = true;
            })
            .addCase(fetchMaintenanceData.fulfilled, (state, action) => {
                state.maintenance.loading = false;
                state.maintenance.recentMaintenance = action.payload.recentMaintenance || [];
                state.subscription = action.payload.subscription || null;
                state.maintenance.error = null;
            })
            .addCase(fetchMaintenanceData.rejected, (state, action) => {
                state.maintenance.loading = false;
                state.maintenance.error = action.payload;
            })
            .addCase(scheduleMaintenance.pending, (state) => {
                state.loading = true;
            })
            .addCase(scheduleMaintenance.fulfilled, (state) => {
                state.loading = false;
                // Optionally update maintenance data
            })
            .addCase(scheduleMaintenance.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Emergency cases
            .addCase(fetchEmergencyData.pending, (state) => {
                state.emergency.loading = true;
            })
            .addCase(fetchEmergencyData.fulfilled, (state, action) => {
                state.emergency.loading = false;
                state.subscription = action.payload.subscription || null;
                // Assuming the API returns recent emergency bookings
                state.emergency.recentEmergency = action.payload.recentEmergency || [];
                state.emergency.error = null;
            })
            .addCase(fetchEmergencyData.rejected, (state, action) => {
                state.emergency.loading = false;
                state.emergency.error = action.payload;
            })
            .addCase(requestEmergency.pending, (state) => {
                state.loading = true;
            })
            .addCase(requestEmergency.fulfilled, (state) => {
                state.loading = false;
                // Optionally update emergency data or redirect
            })
            .addCase(requestEmergency.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Payment cases
            .addCase(processPayment.pending, (state) => {
                state.loading = true;
            })
            .addCase(processPayment.fulfilled, (state, action) => {
                state.loading = false;
                // Update current booking payment status
                if (state.currentBooking) {
                    state.currentBooking.payment.status = 'completed';
                    if (action.payload.transactionId) {
                        state.currentBooking.payment.transactionId = action.payload.transactionId;
                    }
                }
            })
            .addCase(processPayment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, setCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
