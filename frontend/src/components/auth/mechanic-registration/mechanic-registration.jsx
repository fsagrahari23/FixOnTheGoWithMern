"use client"

import { useState } from "react"
import { useSelector } from "react-redux"
import EmailStep from "./steps/email-step"
import OtpStep from "./steps/otp-step"
import RegistrationStep from "./steps/registration-step"
import SuccessStep from "./steps/success-step"
import { Moon, Sun } from "lucide-react"

export default function MechanicRegistration() {
    const [currentStep, setCurrentStep] = useState(1)

    const { otpVerified, registrationComplete } = useSelector((state) => state.auth)

    const handleNextStep = () => {
        setCurrentStep((prev) => prev + 1)
    }

    const handlePrevStep = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1))
    }

    const steps = [
        { number: 1, title: "Email", description: "Enter your email" },
        { number: 2, title: "OTP", description: "Verify OTP" },
        { number: 3, title: "Details", description: "Complete registration" },
        { number: 4, title: "Success", description: "All done!" },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header with Theme Toggle */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mechanic Registration</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Professional registration system</p>
                    </div>

                </div>

                {/* Step Indicator */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center flex-1">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep >= step.number
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-300 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
                                        }`}
                                >
                                    {step.number}
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 transition-all ${currentStep > step.number ? "bg-blue-600" : "bg-gray-300 dark:bg-slate-700"
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2">
                        {steps.map((step) => (
                            <div key={step.number} className="text-center flex-1">
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{step.title}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Container */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-slate-800 transition-colors">
                    {currentStep === 1 && <EmailStep onNext={handleNextStep} />}
                    {currentStep === 2 && <OtpStep onNext={handleNextStep} onPrev={handlePrevStep} />}
                    {currentStep === 3 && <RegistrationStep onNext={handleNextStep} onPrev={handlePrevStep} />}
                    {currentStep === 4 && <SuccessStep />}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    <p>
                        Need help?{" "}
                        <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                            Contact support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
