"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../../components/ui/form"
import { Checkbox } from "../../components/ui/checkbox"
import { sendOtp, verifyOtp } from "../../store/slices/authThunks"
import { registerMechanic } from "../../store/slices/authThunks"
import MapPicker from "../../components/MapPicker"
import { CheckCircle } from "lucide-react"

/**
 * Zod schemas
 * - note: for numbers and arrays we accept the raw types and coerce in submit handler,
 *   because form values often come as strings. We still validate basic constraints here.
 */
const emailSchema = z.object({
    email: z.string().email("Invalid email"),
})

const otpSchema = z.object({
    otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
})

const registrationSchema = z
    .object({
        name: z.string().min(2, "Enter your full name").regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
        email: z.string().email("Invalid email"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6),
        phone: z.string().min(7, "Enter a valid phone number").optional(),
        address: z.string().optional(),
        // specialization will be an array of strings (selected specializations)
        specialization: z.array(z.string()).min(1, "Select at least one specialization"),
        experience: z.preprocess((v) => (v === "" ? NaN : Number(v)), z.number().nonnegative("Experience must be >= 0")),
        hourlyRate: z.preprocess((v) => (v === "" ? NaN : Number(v)), z.number().nonnegative("Hourly rate must be >= 0")),
        latitude: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().optional()),
        longitude: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().optional()),
        // documents will be handled separately (file input) — keep optional here to avoid resolver issues
        documents: z.any().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

export default function RegisterMechanic() {
    const [dark, setDark] = useState(false)
    const [step, setStep] = useState("email") // email | otp | registration
    const [otpVerified, setOtpVerified] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState([]) // for file uploads
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { status, error, authData } = useSelector((state) => state.auth)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const root = document.documentElement
            if (dark) root.classList.add("dark")
            else root.classList.remove("dark")
        }
    }, [dark])

    useEffect(() => {
        // react to auth thunk messages like OTP sent / verified / registration success
        if (status === "succeeded" && authData?.message) {
            if (authData.message.includes("OTP sent")) {
                setStep("otp")
            } else if (authData.message.includes("OTP verified")) {
                setOtpVerified(true)
                setStep("registration")
                // copy email from emailForm to registration form
                registrationForm.setValue("email", emailForm.getValues("email"))
            } else if (authData.message.includes("registration successful") || authData.message.includes("Mechanic registered")) {
                navigate("/auth/login")
            }
        }
    }, [status, authData, navigate])

    const emailForm = useForm({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
    })

    const otpForm = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
    })

    const registrationForm = useForm({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phone: "",
            address: "",
            specialization: [],
            experience: "",
            hourlyRate: "",
            latitude: 28.6139,
            longitude: 77.209,
            documents: undefined,
        },
    })

    const handleEmailSubmit = async (data, e) => {
        e.preventDefault()
        try {
            await dispatch(sendOtp(data)).unwrap()
        } catch (err) {
            console.error("Send OTP error:", err)
            emailForm.setError("email", { message: String(err) })
        }
    }

    const handleOtpSubmit = async (data, e) => {
        e.preventDefault()
        try {
            await dispatch(verifyOtp(data)).unwrap()
        } catch (err) {
            console.error("OTP verification error:", err)
            otpForm.setError("otp", { message: String(err) })
        }
    }

    const handleRegistrationSubmit = async (data, e) => {
        e.preventDefault()
        try {
            // data comes from react-hook-form — coerce/normalize values before dispatching
            const payload = {
                ...data,
                // ensure specialization is array of strings
                specialization: Array.isArray(data.specialization) ? data.specialization : (data.specialization ? [data.specialization] : []),
                experience: Number(data.experience),
                hourlyRate: Number(data.hourlyRate),
                latitude: data.latitude !== undefined ? Number(data.latitude) : undefined,
                longitude: data.longitude !== undefined ? Number(data.longitude) : undefined,
                documents: selectedFiles && selectedFiles.length ? selectedFiles : undefined,
            }

            // dispatch mechanic registration thunk
            await dispatch(registerMechanic(payload)).unwrap()
        } catch (err) {
            console.error("Mechanic registration error:", err)
            registrationForm.setError("root", { message: String(err) })
        }
    }

    const onMapChange = ({ lat, lng }) => {
        registrationForm.setValue("latitude", Number(lat))
        registrationForm.setValue("longitude", Number(lng))
    }

    const specializationOptions = [
        "Engine Repair",
        "Brake Systems",
        "Electrical Systems",
        "Transmission",
        "Tire Services",
        "Battery Services",
        "General Maintenance",
    ]

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-3xl mx-auto">
                <Card className="shadow-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    <CardHeader className="flex items-center justify-between bg-emerald-600 dark:bg-slate-800 text-white rounded-t-lg">
                        <CardTitle className="py-4 text-lg flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8v-10h-8v10zm0-18v6h8V3h-8z" />
                            </svg>
                            Register as Mechanic
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6">
                        {status === "loading" && <p className="text-center">Loading...</p>}
                        {error && <p className="text-red-500 text-center">{error}</p>}

                        {/* EMAIL STEP */}
                        {step === "email" && (
                            <Form {...emailForm}>
                                <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)}>
                                    <FormField
                                        control={emailForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl>
                                                    <Input {...field} type="email" placeholder="you@example.com" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700" disabled={status === "loading"}>
                                        Send OTP
                                    </Button>
                                </form>
                            </Form>
                        )}

                        {/* OTP STEP */}
                        {step === "otp" && (
                            <Form {...otpForm}>
                                <form onSubmit={otpForm.handleSubmit(handleOtpSubmit)}>
                                    <FormField
                                        control={otpForm.control}
                                        name="otp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Enter OTP</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Enter 6-digit OTP" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700" disabled={status === "loading"}>
                                        Verify OTP
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-2 w-full bg-transparent"
                                        onClick={() => emailForm.handleSubmit(handleEmailSubmit)()}
                                        disabled={status === "loading"}
                                    >
                                        Resend OTP
                                    </Button>
                                </form>
                            </Form>
                        )}

                        {/* REGISTRATION STEP */}
                        {step === "registration" && (
                            <Form {...registrationForm}>
                                <form onSubmit={registrationForm.handleSubmit(handleRegistrationSubmit)}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={registrationForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Enter your full name" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={registrationForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        Email Address
                                                        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                                            <CheckCircle className="w-3 h-3" /> Verified
                                                        </span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            {...field} 
                                                            type="email" 
                                                            placeholder="you@example.com" 
                                                            readOnly 
                                                            disabled
                                                            className="bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={registrationForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="password" placeholder="Create a password" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={registrationForm.control}
                                            name="confirmPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Confirm Password</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="password" placeholder="Confirm your password" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={registrationForm.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="+91-XXXXXXXXXX" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={registrationForm.control}
                                            name="address"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Address</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="Enter your address" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Specialization (checkbox-based multi-select) */}
                                        <FormField
                                            control={registrationForm.control}
                                            name="specialization"
                                            render={({ field }) => (
                                                <FormItem className="md:col-span-2">
                                                    <FormLabel>Specialization (Select all that apply)</FormLabel>
                                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                                                        {specializationOptions.map((option) => {
                                                            const isChecked = field.value?.includes(option) || false
                                                            return (
                                                                <label
                                                                    key={option}
                                                                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                                                                        isChecked
                                                                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                                                                            : "border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                                                                    }`}
                                                                >
                                                                    <Checkbox
                                                                        checked={isChecked}
                                                                        onCheckedChange={(checked) => {
                                                                            const currentValues = field.value || []
                                                                            if (checked) {
                                                                                field.onChange([...currentValues, option])
                                                                            } else {
                                                                                field.onChange(currentValues.filter((v) => v !== option))
                                                                            }
                                                                        }}
                                                                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                                                    />
                                                                    <span className="text-sm">{option}</span>
                                                                </label>
                                                            )
                                                        })}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={registrationForm.control}
                                            name="experience"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Experience (Years)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="number" min="0" placeholder="e.g. 5" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={registrationForm.control}
                                            name="hourlyRate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Hourly Rate (₹)</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="number" min="0" step="0.01" placeholder="e.g. 250" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Documents upload (multiple) */}
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Certification Documents</FormLabel>
                                            <FormControl>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*,application/pdf"
                                                    onChange={(e) => {
                                                        const files = e.target.files ? Array.from(e.target.files) : []
                                                        setSelectedFiles(files)
                                                        // set value in RHF as well so resolver / state can see it if needed
                                                        registrationForm.setValue("documents", files)
                                                    }}
                                                    className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-800"
                                                />
                                            </FormControl>
                                            <p className="text-sm text-muted-foreground mt-1">Upload licenses, certificates, etc.</p>
                                            <FormMessage />
                                        </FormItem>

                                        {/* Map / Location */}
                                        <div className="md:col-span-2">
                                            <FormLabel className="m-4 text-xl">Location (Optional)</FormLabel>
                                            <div className="flex gap-2 items-center mb-2">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        if (navigator.geolocation) {
                                                            navigator.geolocation.getCurrentPosition(
                                                                (pos) => {
                                                                    registrationForm.setValue("latitude", Number(pos.coords.latitude))
                                                                    registrationForm.setValue("longitude", Number(pos.coords.longitude))
                                                                },
                                                                (err) => {
                                                                    console.error(err)
                                                                    alert("Unable to retrieve location. Please select manually.")
                                                                },
                                                            )
                                                        } else {
                                                            alert("Geolocation not supported by this browser.")
                                                        }
                                                    }}
                                                >
                                                    Get Current Location
                                                </Button>
                                            </div>

                                            <div className="border rounded-lg overflow-hidden">
                                                <MapPicker
                                                    onChange={onMapChange}
                                                    defaultLat={registrationForm.watch("latitude")}
                                                    defaultLng={registrationForm.watch("longitude")}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={status === "loading"}>
                                            Register as Mechanic
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        )}
                    </CardContent>

                    <CardFooter className="bg-slate-50 dark:bg-slate-800">
                        <div className="w-full text-center text-sm">
                            Already have an account?{" "}
                            <Link to="/auth/login" className="text-emerald-600">
                                Login
                            </Link>
                            <br />
                            Want to register as a user?{" "}
                            <Link to="/auth/register" className="text-emerald-600">
                                Register as User
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
