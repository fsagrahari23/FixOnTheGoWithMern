import { createSlice } from "@reduxjs/toolkit"
import { sendOtp, verifyOtp, registerUser, registerMechanic, login, logout, getMe } from "./authThunks"

const authSlice = createSlice({
    name: "auth",
    initialState: {
        status: "idle",
        error: null,
        authData: null,
        user: null,
        email: "",
        otp: "",
        otpSent: false,
        otpVerified: false,
        loading: false,
        registrationData: {
            fullName: "",
            phone: "",
            password: "",
            confirmPassword: "",
            specializations: [],
            yearsOfExperience: "",
            hourlyRate: "",
            city: "",
            state: "",
        },
        registrationComplete: false,
        role: ""
    },
    reducers: {
        setEmail: (state, action) => {
            state.email = action.payload
        },
        setOtp: (state, action) => {
            state.otp = action.payload
        },
        setOtpSent: (state, action) => {
            state.otpSent = action.payload
        },
        setOtpVerified: (state, action) => {
            state.otpVerified = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
        setRegistrationData: (state, action) => {
            state.registrationData = action.payload
        },
        resetAuthState: (state) => {
            state.status = "idle"
            state.error = null
            state.authData = null
            state.user = null
            state.email = ""
            state.otp = ""
            state.otpSent = false
            state.otpVerified = false
            state.loading = false
            state.registrationData = {
                fullName: "",
                phone: "",
                password: "",
                confirmPassword: "",
                specializations: [],
                yearsOfExperience: "",
                hourlyRate: "",
                city: "",
                state: "",
            }
            state.registrationComplete = false
            state.role = ""

        },
    },
    extraReducers: (builder) => {
        builder
            // sendOtp thunk handlers
            .addCase(sendOtp.pending, (state) => {
                state.status = "loading"
                state.error = null
            })
            .addCase(sendOtp.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.authData = action.payload
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
            // verifyOtp thunk handlers
            .addCase(verifyOtp.pending, (state) => {
                state.status = "loading"
                state.error = null
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.authData = action.payload
                state.otpVerified = true
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
            // registerUser thunk handlers
            .addCase(registerUser.pending, (state) => {
                state.status = "loading"
                state.error = null
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.authData = action.payload
                state.registrationComplete = true
                state.role = "user"
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
            // registerMechanic thunk handlers
            .addCase(registerMechanic.pending, (state) => {
                state.status = "loading"
                state.error = null
            })
            .addCase(registerMechanic.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.authData = action.payload
                state.registrationComplete = true
                state.role = "mechanic"
            })
            .addCase(registerMechanic.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
            // login thunk handlers
            .addCase(login.pending, (state) => {
                state.status = "loading"
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.user = action.payload.user
                state.authData = action.payload
            })
            .addCase(login.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
            // logout thunk handlers
            .addCase(logout.pending, (state) => {
                state.status = "loading"
                state.error = null
            })
            .addCase(logout.fulfilled, (state) => {
                state.status = "succeeded"
                state.user = null
                state.authData = null
            })
            .addCase(logout.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
            })
            // getMe thunk handlers
            .addCase(getMe.pending, (state) => {
                state.status = "loading"
                state.error = null
            })
            .addCase(getMe.fulfilled, (state, action) => {
                state.status = "succeeded"
                state.user = action.payload.user
                state.authData = null
            })
            .addCase(getMe.rejected, (state, action) => {
                state.status = "failed"
                state.error = action.payload
                state.user = null
            })
    },
})

export const {
    setEmail,
    setOtp,
    setOtpSent,
    setOtpVerified,
    setLoading,
    setError,
    setRegistrationData,
    resetAuthState,
} = authSlice.actions
export default authSlice.reducer
