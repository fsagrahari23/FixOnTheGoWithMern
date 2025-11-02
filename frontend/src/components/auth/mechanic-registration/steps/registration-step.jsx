"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setRegistrationData, setLoading, setError } from "../../../../store/slices/authSlice"
import { registerMechanic } from "../../../../store/slices/authThunks"
import { User, Phone, Lock, Briefcase, DollarSign, MapPin, Loader } from "lucide-react"

export default function RegistrationStep({ onNext, onPrev }) {
    const dispatch = useDispatch()
    const { registrationData, loading, error } = useSelector((state) => state.auth)
    const [formData, setFormData] = useState(registrationData)
    const [validationErrors, setValidationErrors] = useState({})

    const specializations = [
        "Engine Repair",
        "Transmission",
        "Brake System",
        "Electrical",
        "Suspension",
        "Air Conditioning",
        "Welding",
        "Diagnostics",
    ]

    const validateForm = () => {
        const errors = {}

        if (!formData.fullName.trim()) errors.fullName = "Full name is required"
        if (!formData.phone.trim()) errors.phone = "Phone number is required"
        if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) errors.phone = "Phone must be 10 digits"
        if (!formData.password) errors.password = "Password is required"
        if (formData.password.length < 8) errors.password = "Password must be at least 8 characters"
        if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords do not match"
        if (formData.specializations.length === 0) errors.specializations = "Select at least one specialization"
        if (!formData.yearsOfExperience) errors.yearsOfExperience = "Years of experience is required"
        if (!formData.hourlyRate) errors.hourlyRate = "Hourly rate is required"
        if (!formData.city.trim()) errors.city = "City is required"
        if (!formData.state.trim()) errors.state = "State is required"

        return errors
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (validationErrors[name]) {
            setValidationErrors((prev) => ({ ...prev, [name]: "" }))
        }
    }

    const handleSpecializationChange = (spec) => {
        setFormData((prev) => ({
            ...prev,
            specializations: prev.specializations.includes(spec)
                ? prev.specializations.filter((s) => s !== spec)
                : [...prev.specializations, spec],
        }))
        if (validationErrors.specializations) {
            setValidationErrors((prev) => ({ ...prev, specializations: "" }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errors = validateForm()

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            return
        }

        dispatch(setRegistrationData(formData))
        dispatch(setLoading(true))

        try {
            await dispatch(registerMechanic(formData))
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
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Profile</h2>
                <p className="text-gray-600 dark:text-gray-400">Provide your professional details</p>
            </div>

            {/* Full Name */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                    />
                </div>
                {validationErrors.fullName && (
                    <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.fullName}</p>
                )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                            setFormData((prev) => ({ ...prev, phone: value }))
                            if (validationErrors.phone) {
                                setValidationErrors((prev) => ({ ...prev, phone: "" }))
                            }
                        }}
                        placeholder="1234567890"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                    />
                </div>
                {validationErrors.phone && <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.phone}</p>}
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                        />
                    </div>
                    {validationErrors.password && (
                        <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.password}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                        />
                    </div>
                    {validationErrors.confirmPassword && (
                        <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.confirmPassword}</p>
                    )}
                </div>
            </div>

            {/* Specializations */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Specializations</label>
                <div className="grid grid-cols-2 gap-3">
                    {specializations.map((spec) => (
                        <label
                            key={spec}
                            className="flex items-center gap-2 p-2 rounded-lg border border-gray-300 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={formData.specializations.includes(spec)}
                                onChange={() => handleSpecializationChange(spec)}
                                className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{spec}</span>
                        </label>
                    ))}
                </div>
                {validationErrors.specializations && (
                    <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.specializations}</p>
                )}
            </div>

            {/* Experience and Rate */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Years of Experience</label>
                    <div className="relative">
                        <Briefcase className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="number"
                            name="yearsOfExperience"
                            value={formData.yearsOfExperience}
                            onChange={handleInputChange}
                            placeholder="5"
                            min="0"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                        />
                    </div>
                    {validationErrors.yearsOfExperience && (
                        <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.yearsOfExperience}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hourly Rate ($)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="number"
                            name="hourlyRate"
                            value={formData.hourlyRate}
                            onChange={handleInputChange}
                            placeholder="50"
                            min="0"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                        />
                    </div>
                    {validationErrors.hourlyRate && (
                        <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.hourlyRate}</p>
                    )}
                </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="New York"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                        />
                    </div>
                    {validationErrors.city && <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.city}</p>}
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="NY"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                        />
                    </div>
                    {validationErrors.state && <p className="text-sm text-red-600 dark:text-red-400">{validationErrors.state}</p>}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
            )}

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
                            Registering...
                        </>
                    ) : (
                        "Complete Registration"
                    )}
                </button>
            </div>
        </form>
    )
}
