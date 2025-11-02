"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setEmail, setOtpSent, setError, setLoading } from "../../../../store/slices/authSlice"
import { sendOtp } from "../../../../store/slices/authThunks"
import { Mail, Loader } from "lucide-react"

export default function EmailStep({ onNext }) {
    const dispatch = useDispatch()
    const { email, loading, error } = useSelector((state) => state.auth)
    const [localEmail, setLocalEmail] = useState("")
    const [validationError, setValidationError] = useState("")

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(email)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setValidationError("")

        if (!localEmail.trim()) {
            setValidationError("Email is required")
            return
        }

        if (!validateEmail(localEmail)) {
            setValidationError("Please enter a valid email address")
            return
        }
        console.log(localEmail)

        dispatch(setEmail(localEmail))
        dispatch(setLoading(true))

        try {
            dispatch(sendOtp({ email: localEmail }))
            dispatch(setOtpSent(true))
            dispatch(setLoading(false))
            onNext()
        } catch (err) {
            dispatch(setError(err.message))
            dispatch(setLoading(false))
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Enter Your Email</h2>
                <p className="text-gray-600 dark:text-gray-400">We'll send you an OTP to verify your email address</p>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                        type="email"
                        value={localEmail}
                        onChange={(e) => {
                            setLocalEmail(e.target.value)
                            setValidationError("")
                        }}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                    />
                </div>
                {validationError && <p className="text-sm text-red-600 dark:text-red-400">{validationError}</p>}
                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Sending OTP...
                    </>
                ) : (
                    "Send OTP"
                )}
            </button>
        </form>
    )
}
