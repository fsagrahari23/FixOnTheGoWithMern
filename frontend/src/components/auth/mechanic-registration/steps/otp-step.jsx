"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setOtp, setOtpVerified, setError, setLoading } from "../../../../store/slices/authSlice"
import { verifyOtp, sendOtp } from "../../../../store/slices/authThunks"
import { Lock, Loader, RotateCcw } from "lucide-react"

export default function OtpStep({ onNext, onPrev }) {
    const dispatch = useDispatch()
    const { email, otp, loading, error } = useSelector((state) => state.auth)
    const [localOtp, setLocalOtp] = useState(otp)
    const [timeLeft, setTimeLeft] = useState(300)
    const [validationError, setValidationError] = useState("")

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const handleResendOtp = async () => {
        setTimeLeft(300)
        dispatch(setLoading(true))
        try {
            await dispatch(sendOtp(email))
            dispatch(setLoading(false))
        } catch (err) {
            dispatch(setError(err.message))
            dispatch(setLoading(false))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setValidationError("")

        if (!localOtp.trim()) {
            setValidationError("OTP is required")
            return
        }

        if (localOtp.length !== 6) {
            setValidationError("OTP must be 6 digits")
            return
        }

        dispatch(setOtp(localOtp))
        dispatch(setLoading(true))

        try {
            await dispatch(verifyOtp({ email, otp: localOtp }))
            dispatch(setOtpVerified(true))
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verify OTP</h2>
                <p className="text-gray-600 dark:text-gray-400">Enter the 6-digit code sent to {email}</p>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">OTP Code</label>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        value={localOtp}
                        onChange={(e) => {
                            setLocalOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                            setValidationError("")
                        }}
                        placeholder="000000"
                        maxLength="6"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors text-center text-2xl tracking-widest"
                    />
                </div>
                {validationError && <p className="text-sm text-red-600 dark:text-red-400">{validationError}</p>}
                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            </div>

            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Time remaining: {formatTime(timeLeft)}</span>
                <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={timeLeft > 0 || loading}
                    className="text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                    <RotateCcw className="w-4 h-4" />
                    Resend OTP
                </button>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onPrev}
                    className="flex-1 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                    Back
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Verifying...
                        </>
                    ) : (
                        "Verify OTP"
                    )}
                </button>
            </div>
        </form>
    )
}
