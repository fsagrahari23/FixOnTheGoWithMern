import { createSlice } from "@reduxjs/toolkit";
import {
    fetchAdminDashboard,
    fetchAllUsers,
    fetchAllMechanics,
    approveMechanic,
    rejectMechanic,
    fetchAllBookings,
    fetchBookingDetails,
    fetchAllPayments,
    fetchAllSubscriptions,
    deleteUser,
    toggleUserPremium,
} from "./adminThunks";

const adminSlice = createSlice({
    name: "admin",
    initialState: {
        // Dashboard
        dashboard: {
            userCount: 0,
            mechanicCount: 0,
            pendingMechanicCount: 0,
            bookingCount: 0,
            premiumUserCount: 0,
            subscriptionStats: { monthly: 0, yearly: 0, active: 0 },
            paymentStats: {
                totalRevenue: 0,
                completed: 0,
                pending: 0,
                subscriptionRevenue: 0,
                bookingRevenue: 0,
            },
            bookingStats: {
                pending: 0,
                accepted: 0,
                inProgress: 0,
                completed: 0,
                cancelled: 0,
                emergency: 0,
            },
            recentBookings: [],
            recentSubscriptions: [],
            monthlyRevenueStats: [],
        },
        
        // Users
        users: [],
        
        // Mechanics
        mechanics: [],
        
        // Bookings
        bookings: [],
        currentBooking: null,
        
        // Payments
        payments: [],
        
        // Subscriptions
        subscriptions: [],
        
        // Loading states
        loading: {
            dashboard: false,
            users: false,
            mechanics: false,
            bookings: false,
            payments: false,
            subscriptions: false,
        },
        
        // Error handling
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentBooking: (state) => {
            state.currentBooking = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Admin Dashboard
        builder
            .addCase(fetchAdminDashboard.pending, (state) => {
                state.loading.dashboard = true;
                state.error = null;
            })
            .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
                state.loading.dashboard = false;
                state.dashboard = action.payload;
            })
            .addCase(fetchAdminDashboard.rejected, (state, action) => {
                state.loading.dashboard = false;
                state.error = action.payload;
            });

        // Fetch All Users
        builder
            .addCase(fetchAllUsers.pending, (state) => {
                state.loading.users = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.loading.users = false;
                state.users = action.payload.users || action.payload;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.loading.users = false;
                state.error = action.payload;
            });

        // Fetch All Mechanics
        builder
            .addCase(fetchAllMechanics.pending, (state) => {
                state.loading.mechanics = true;
                state.error = null;
            })
            .addCase(fetchAllMechanics.fulfilled, (state, action) => {
                state.loading.mechanics = false;
                state.mechanics = action.payload.mechanics || action.payload;
            })
            .addCase(fetchAllMechanics.rejected, (state, action) => {
                state.loading.mechanics = false;
                state.error = action.payload;
            });

        // Approve Mechanic
        builder
            .addCase(approveMechanic.fulfilled, (state, action) => {
                const index = state.mechanics.findIndex(
                    (m) => m._id === action.payload.mechanic._id
                );
                if (index !== -1) {
                    state.mechanics[index] = action.payload.mechanic;
                }
            })
            .addCase(approveMechanic.rejected, (state, action) => {
                state.error = action.payload;
            });

        // Reject Mechanic
        builder
            .addCase(rejectMechanic.fulfilled, (state, action) => {
                state.mechanics = state.mechanics.filter(
                    (m) => m._id !== action.payload.mechanicId
                );
            })
            .addCase(rejectMechanic.rejected, (state, action) => {
                state.error = action.payload;
            });

        // Fetch All Bookings
        builder
            .addCase(fetchAllBookings.pending, (state) => {
                state.loading.bookings = true;
                state.error = null;
            })
            .addCase(fetchAllBookings.fulfilled, (state, action) => {
                state.loading.bookings = false;
                state.bookings = action.payload.bookings || action.payload;
            })
            .addCase(fetchAllBookings.rejected, (state, action) => {
                state.loading.bookings = false;
                state.error = action.payload;
            });

        // Fetch Booking Details
        builder
            .addCase(fetchBookingDetails.pending, (state) => {
                state.loading.bookings = true;
                state.error = null;
            })
            .addCase(fetchBookingDetails.fulfilled, (state, action) => {
                state.loading.bookings = false;
                state.currentBooking = action.payload.booking || action.payload;
            })
            .addCase(fetchBookingDetails.rejected, (state, action) => {
                state.loading.bookings = false;
                state.error = action.payload;
            });

        // Fetch All Payments
        builder
            .addCase(fetchAllPayments.pending, (state) => {
                state.loading.payments = true;
                state.error = null;
            })
            .addCase(fetchAllPayments.fulfilled, (state, action) => {
                state.loading.payments = false;
                state.payments = action.payload.payments || action.payload;
            })
            .addCase(fetchAllPayments.rejected, (state, action) => {
                state.loading.payments = false;
                state.error = action.payload;
            });

        // Fetch All Subscriptions
        builder
            .addCase(fetchAllSubscriptions.pending, (state) => {
                state.loading.subscriptions = true;
                state.error = null;
            })
            .addCase(fetchAllSubscriptions.fulfilled, (state, action) => {
                state.loading.subscriptions = false;
                state.subscriptions = action.payload.subscriptions || action.payload;
            })
            .addCase(fetchAllSubscriptions.rejected, (state, action) => {
                state.loading.subscriptions = false;
                state.error = action.payload;
            });

        // Delete User
        builder
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.users = state.users.filter((u) => u._id !== action.payload.userId);
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.error = action.payload;
            });

        // Toggle User Premium
        builder
            .addCase(toggleUserPremium.fulfilled, (state, action) => {
                const index = state.users.findIndex((u) => u._id === action.payload.user._id);
                if (index !== -1) {
                    state.users[index] = action.payload.user;
                }
            })
            .addCase(toggleUserPremium.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearError, clearCurrentBooking } = adminSlice.actions;
export default adminSlice.reducer;
