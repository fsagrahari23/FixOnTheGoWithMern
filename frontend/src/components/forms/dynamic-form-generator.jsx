"use client"


import { useState } from "react"
import FormField from "./form-field"
import SubmitButton from "./submit-button"


export default function DynamicFormGenerator({ fields, onSubmit, title, description }) {
    const [formData, setFormData] = useState({})
    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleChange = (id, value) => {
        setFormData((prev) => ({
            ...prev,
            [id]: value,
        }))
        // Clear error when user starts typing
        if (errors[id]) {
            setErrors((prev) => ({
                ...prev,
                [id]: "",
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        fields.forEach((field) => {
            if (field.required && !formData[field.id]) {
                newErrors[field.id] = `${field.label} is required`
            }

            if (field.type === "email" && formData[field.id]) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(formData[field.id])) {
                    newErrors[field.id] = "Please enter a valid email address"
                }
            }

            if (field.type === "tel" && formData[field.id]) {
                const phoneRegex = /^[\d\s\-+$$$$]+$/
                if (!phoneRegex.test(formData[field.id])) {
                    newErrors[field.id] = "Please enter a valid phone number"
                }
            }
        })

        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const newErrors = validateForm()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setIsSubmitting(true)
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500))
            onSubmit(formData)
            setFormData({})
            setErrors({})
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full animate-slide-up">
            <form
                onSubmit={handleSubmit}
                className="bg-card border border-border rounded-2xl shadow-lg p-8 space-y-6 transition-all duration-300 hover:shadow-xl"
            >
                {title && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-card-foreground mb-2">{title}</h2>
                        {description && <p className="text-muted-foreground">{description}</p>}
                    </div>
                )}

                <div className="space-y-5">
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className="animate-fade-in"
                            style={{
                                animationDelay: `${index * 50}ms`,
                            }}
                        >
                            <FormField
                                field={field}
                                value={formData[field.id] || ""}
                                onChange={(value) => handleChange(field.id, value)}
                                error={errors[field.id]}
                            />
                        </div>
                    ))}
                </div>

                <SubmitButton isLoading={isSubmitting} />
            </form>
        </div>
    )
}
