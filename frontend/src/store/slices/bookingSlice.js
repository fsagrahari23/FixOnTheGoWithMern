import { createSlice } from '@reduxjs/toolkit';
import {
    fetchBookings,
    createBooking,
    fetchBookingDetails,
    selectMechanic,
    cancelBooking,
    rateBooking,
    fetchBookingHistory,
    fetchChat,
    sendMessage,
    fetchMessages,
    fetchUnreadCount,
    fetchMaintenanceData,
    scheduleMaintenance,
    fetchEmergencyData,
    requestEmergency,
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
        // Chat state
        chat: {
            messages: [],
            unreadCount: 0,
            loading: false,
            error: null,
        },
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
            .addCase(createBooking.fulfilled, (state, action) => {
                state.loading = false;
                // Optionally add the new booking to the list
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
            .addCase(selectMechanic.fulfilled, (state, action) => {
                state.loading = false;
                // Update the current booking if needed
            })
            .addCase(selectMechanic.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(cancelBooking.pending, (state) => {
                state.loading = true;
            })
            .addCase(cancelBooking.fulfilled, (state, action) => {
                state.loading = false;
                // Update booking status
            })
            .addCase(cancelBooking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(rateBooking.pending, (state) => {
                state.loading = true;
            })
            .addCase(rateBooking.fulfilled, (state, action) => {
                state.loading = false;
                // Update rating
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
            // Chat cases
            .addCase(fetchChat.pending, (state) => {
                state.chat.loading = true;
            })
            .addCase(fetchChat.fulfilled, (state, action) => {
                state.chat.loading = false;
                state.chat.messages = action.payload.chat?.messages || [];
                state.chat.error = null;
            })
            .addCase(fetchChat.rejected, (state, action) => {
                state.chat.loading = false;
                state.chat.error = action.payload;
            })
            .addCase(sendMessage.pending, (state) => {
                state.chat.loading = true;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.chat.loading = false;
                // Add the new message to the messages array
                if (action.payload.message) {
                    state.chat.messages.push(action.payload.message);
                }
                state.chat.error = null;
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.chat.loading = false;
                state.chat.error = action.payload;
            })
            .addCase(fetchMessages.pending, (state) => {
                state.chat.loading = true;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.chat.loading = false;
                state.chat.messages = action.payload.messages || [];
                state.chat.error = null;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.chat.loading = false;
                state.chat.error = action.payload;
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.chat.unreadCount = action.payload.unreadCount || 0;
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
            .addCase(scheduleMaintenance.fulfilled, (state, action) => {
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
            .addCase(requestEmergency.fulfilled, (state, action) => {
                state.loading = false;
                // Optionally update emergency data or redirect
            })
            .addCase(requestEmergency.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, setCurrentBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
