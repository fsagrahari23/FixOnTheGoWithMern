import { createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// Fetch Admin Dashboard Data
export const fetchAdminDashboard = createAsyncThunk(
    "admin/fetchDashboard",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/api/dashboard`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch dashboard data");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Fetch All Users
export const fetchAllUsers = createAsyncThunk(
    "admin/fetchAllUsers",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/api/users`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch users");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Fetch All Mechanics
export const fetchAllMechanics = createAsyncThunk(
    "admin/fetchAllMechanics",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/api/mechanics`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch mechanics");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Approve Mechanic
export const approveMechanic = createAsyncThunk(
    "admin/approveMechanic",
    async (mechanicId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/mechanic/${mechanicId}/approve`, {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to approve mechanic");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Reject Mechanic
export const rejectMechanic = createAsyncThunk(
    "admin/rejectMechanic",
    async (mechanicId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/mechanic/${mechanicId}/reject`, {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to reject mechanic");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Fetch All Bookings
export const fetchAllBookings = createAsyncThunk(
    "admin/fetchAllBookings",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/api/bookings`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch bookings");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Fetch Booking Details
export const fetchBookingDetails = createAsyncThunk(
    "admin/fetchBookingDetails",
    async (bookingId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/api/booking/${bookingId}`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch booking details");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Fetch All Payments
export const fetchAllPayments = createAsyncThunk(
    "admin/fetchAllPayments",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/api/payments`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch payments");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Fetch All Subscriptions
export const fetchAllSubscriptions = createAsyncThunk(
    "admin/fetchAllSubscriptions",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/api/subscriptions`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch subscriptions");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Delete User
export const deleteUser = createAsyncThunk(
    "admin/deleteUser",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/user/${userId}/delete`, {
                method: "DELETE",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete user");
            }

            return { userId, ...data };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Toggle User Premium Status
export const toggleUserPremium = createAsyncThunk(
    "admin/toggleUserPremium",
    async (userId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/user/${userId}/toggle-premium`, {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to toggle premium status");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
