import { createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export const sendOtp = createAsyncThunk(
    "auth/sendOtp",
    async ({ email }, { rejectWithValue }) => {
        try {
            console.log(email)
            const response = await fetch(`${API_BASE}/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to send OTP");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const verifyOtp = createAsyncThunk(
    "auth/verifyOtp",
    async ({ otp }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ otp }),
                credentials: "include",
            });

            const data = await response.json();

            console.log("verifyOtp response", data)

            if (!response.ok) {
                throw new Error(data.message || "OTP verification failed");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE}/auth/register-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "User registration failed");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const registerMechanic = createAsyncThunk(
    "auth/registerMechanic",
    async (mechanicData, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            Object.keys(mechanicData).forEach((key) => {
                if (key !== "documents" && key !== "confirmPassword") {
                    if (Array.isArray(mechanicData[key])) {
                        mechanicData[key].forEach((item) => formData.append(key, item));
                    } else {
                        formData.append(key, mechanicData[key]);
                    }
                }
            });

            if (mechanicData.documents && mechanicData.documents.length > 0) {
                Array.from(mechanicData.documents).forEach((file) =>
                    formData.append("documents", file)
                );
            }
            console.log("FormData entries:");
            console.log(mechanicData.documents);
            console.log(mechanicData);

            const response = await fetch(`${API_BASE}/auth/register-mechanic`, {
                method: "POST",
                body: formData,
                credentials: "include",
            });


            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Mechanic registration failed");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const login = createAsyncThunk(
    "auth/login",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const logout = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE}/auth/logout`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Logout failed");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const getMe = createAsyncThunk(
    "auth/getMe",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE}/auth/me`, {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch user data");
            }

            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);