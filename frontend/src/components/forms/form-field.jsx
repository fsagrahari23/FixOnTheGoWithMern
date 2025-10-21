"use client"

export default function FormField({ field, value, onChange, error }) {
    const baseInputClasses =
        "w-full px-4 py-2 bg-white dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"

    const errorClasses = error
        ? "border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400"
        : "border-slate-300 dark:border-slate-600"

    const renderField = () => {
        switch (field.type) {
            case "textarea":
                return (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        rows="4"
                        className={`${baseInputClasses} ${errorClasses} resize-none`}
                    />
                )

            case "select":
                return (
                    <select
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        required={field.required}
                        className={`${baseInputClasses} ${errorClasses} appearance-none`}
                    >
                        <option value="">Select an option</option>
                        {field.options.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                )

            case "checkbox":
                return (
                    <div className="space-y-3">
                        {field.options.map((option) => (
                            <label key={option} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    value={option}
                                    checked={Array.isArray(value) ? value.includes(option) : false}
                                    onChange={(e) => {
                                        const newValue = Array.isArray(value) ? [...value] : []
                                        if (e.target.checked) {
                                            newValue.push(option)
                                        } else {
                                            newValue.splice(newValue.indexOf(option), 1)
                                        }
                                        onChange(newValue)
                                    }}
                                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                                />
                                <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                    {option}
                                </span>
                            </label>
                        ))}
                    </div>
                )

            case "radio":
                return (
                    <div className="space-y-3">
                        {field.options.map((option) => (
                            <label key={option} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="radio"
                                    name={field.name}
                                    value={option}
                                    checked={value === option}
                                    onChange={(e) => onChange(e.target.value)}
                                    required={field.required}
                                    className="w-4 h-4 border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 cursor-pointer"
                                />
                                <span className="text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                    {option}
                                </span>
                            </label>
                        ))}
                    </div>
                )

            default:
                return (
                    <input
                        type={field.type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        required={field.required}
                        className={`${baseInputClasses} ${errorClasses}`}
                    />
                )
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderField()}
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400 animate-in fade-in duration-200">{error}</p>}
        </div>
    )
}
