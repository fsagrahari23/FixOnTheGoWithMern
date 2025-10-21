"use client"

import { useState } from "react"
import { Plus, Trash2, ChevronDown } from "lucide-react"
import FormField from "./form-field"

const INPUT_TYPES = [
    { value: "text", label: "Text Input" },
    { value: "email", label: "Email" },
    { value: "number", label: "Number" },
    { value: "password", label: "Password" },
    { value: "textarea", label: "Textarea" },
    { value: "select", label: "Select Dropdown" },
    { value: "checkbox", label: "Checkbox" },
    { value: "radio", label: "Radio Button" },
    { value: "date", label: "Date" },
    { value: "tel", label: "Phone" },
]

export default function DynamicForm({ onSubmit }) {
    const [fields, setFields] = useState([
        {
            id: 1,
            name: "fullName",
            label: "Full Name",
            type: "text",
            required: true,
            placeholder: "Enter your full name",
            options: [],
        },
    ])

    const [formValues, setFormValues] = useState({})
    const [errors, setErrors] = useState({})
    const [nextId, setNextId] = useState(2)

    const addField = () => {
        const newField = {
            id: nextId,
            name: `field_${nextId}`,
            label: `Field ${nextId}`,
            type: "text",
            required: false,
            placeholder: "",
            options: [],
        }
        setFields([...fields, newField])
        setNextId(nextId + 1)
    }

    const removeField = (id) => {
        if (fields.length > 1) {
            setFields(fields.filter((field) => field.id !== id))
            const newValues = { ...formValues }
            delete newValues[fields.find((f) => f.id === id).name]
            setFormValues(newValues)
        }
    }

    const updateField = (id, updates) => {
        setFields(fields.map((field) => (field.id === id ? { ...field, ...updates } : field)))
    }

    const handleFieldChange = (fieldName, value) => {
        setFormValues((prev) => ({
            ...prev,
            [fieldName]: value,
        }))
        if (errors[fieldName]) {
            setErrors((prev) => ({
                ...prev,
                [fieldName]: "",
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}
        fields.forEach((field) => {
            if (field.required && !formValues[field.name]) {
                newErrors[field.name] = `${field.label} is required`
            }
        })
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateForm()) {
            onSubmit(formValues)
        }
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-6">
                    {fields.map((field, index) => (
                        <div key={field.id} className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-colors">
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Field Label
                                            </label>
                                            <input
                                                type="text"
                                                value={field.label}
                                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                                                placeholder="e.g., Email Address"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Field Name
                                            </label>
                                            <input
                                                type="text"
                                                value={field.name}
                                                onChange={(e) => updateField(field.id, { name: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                                                placeholder="e.g., email"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Input Type
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={field.type}
                                                    onChange={(e) => updateField(field.id, { type: e.target.value })}
                                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 appearance-none transition-all"
                                                >
                                                    {INPUT_TYPES.map((type) => (
                                                        <option key={type.value} value={type.value}>
                                                            {type.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="flex items-end gap-2">
                                            <label className="flex items-center gap-2 cursor-pointer flex-1">
                                                <input
                                                    type="checkbox"
                                                    checked={field.required}
                                                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                                                />
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Required</span>
                                            </label>
                                        </div>
                                    </div>

                                    {field.type === "select" || field.type === "radio" || field.type === "checkbox" ? (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Options (comma-separated)
                                            </label>
                                            <input
                                                type="text"
                                                value={field.options.join(", ")}
                                                onChange={(e) =>
                                                    updateField(field.id, {
                                                        options: e.target.value
                                                            .split(",")
                                                            .map((opt) => opt.trim())
                                                            .filter(Boolean),
                                                    })
                                                }
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                                                placeholder="e.g., Option 1, Option 2, Option 3"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                Placeholder
                                            </label>
                                            <input
                                                type="text"
                                                value={field.placeholder}
                                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                                                placeholder="Enter placeholder text"
                                            />
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeField(field.id)}
                                    disabled={fields.length === 1}
                                    className="mt-4 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Remove field"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={addField}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add Field
                </button>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Form Preview</h3>

                    <div className="space-y-6 mb-6">
                        {fields.map((field) => (
                            <FormField
                                key={field.id}
                                field={field}
                                value={formValues[field.name] || ""}
                                onChange={(value) => handleFieldChange(field.name, value)}
                                error={errors[field.name]}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95"
                    >
                        Submit Form
                    </button>
                </div>
            </form>
        </div>
    )
}
