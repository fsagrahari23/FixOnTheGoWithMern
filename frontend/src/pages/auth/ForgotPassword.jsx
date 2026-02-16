import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "../../components/ui/form";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { ArrowLeft, Mail, Lock, KeyRound } from "lucide-react";
import axios from "axios";

const emailSchema = z.object({
    email: z.string().email("Invalid email address"),
});

const otpSchema = z.object({
    otp: z.string().length(6, "OTP must be 6 digits"),
});

const resetPasswordSchema = z.object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: email, 2: otp, 3: reset password
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const emailForm = useForm({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
    });

    const otpForm = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
    });

    const resetForm = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    const handleSendOtp = async (data) => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const response = await axios.post("http://localhost:3000/auth/forgot-password/send-otp", {
                email: data.email,
            }, { withCredentials: true });
            
            setEmail(data.email);
            setSuccess(response.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (data) => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const response = await axios.post("http://localhost:3000/auth/forgot-password/verify-otp", {
                email: email,
                otp: data.otp,
            }, { withCredentials: true });
            
            setSuccess(response.data.message);
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (data) => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const response = await axios.post("http://localhost:3000/auth/forgot-password/reset", {
                email: email,
                newPassword: data.newPassword,
            }, { withCredentials: true });
            
            setSuccess(response.data.message);
            setTimeout(() => {
                navigate("/auth/login");
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const response = await axios.post("http://localhost:3000/auth/forgot-password/send-otp", {
                email: email,
            }, { withCredentials: true });
            
            setSuccess("OTP resent successfully!");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to resend OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-md mx-auto">
                <Card className="shadow-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    <CardHeader className="flex items-center justify-between bg-emerald-600 dark:bg-slate-800 text-white rounded-t-lg">
                        <CardTitle className="py-4 text-lg flex items-center gap-2">
                            <KeyRound className="w-5 h-5" />
                            Reset Password
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6">
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {success && (
                            <Alert className="mb-4 bg-green-50 text-green-900 border-green-200">
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}

                        {/* Step 1: Enter Email */}
                        {step === 1 && (
                            <Form {...emailForm}>
                                <form onSubmit={emailForm.handleSubmit(handleSendOtp)}>
                                    <div className="mb-4 text-center text-sm text-muted-foreground">
                                        Enter your email address and we'll send you an OTP to reset your password.
                                    </div>
                                    <FormField
                                        control={emailForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                                        <Input 
                                                            {...field} 
                                                            type="email" 
                                                            placeholder="you@example.com"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700"
                                        disabled={loading}
                                    >
                                        {loading ? "Sending..." : "Send OTP"}
                                    </Button>
                                </form>
                            </Form>
                        )}

                        {/* Step 2: Enter OTP */}
                        {step === 2 && (
                            <Form {...otpForm}>
                                <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)}>
                                    <div className="mb-4 text-center text-sm text-muted-foreground">
                                        Enter the 6-digit OTP sent to <strong>{email}</strong>
                                    </div>
                                    <FormField
                                        control={otpForm.control}
                                        name="otp"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>OTP Code</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field} 
                                                        type="text" 
                                                        placeholder="123456"
                                                        maxLength={6}
                                                        className="text-center text-2xl tracking-widest"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700"
                                        disabled={loading}
                                    >
                                        {loading ? "Verifying..." : "Verify OTP"}
                                    </Button>

                                    <div className="mt-4 text-center">
                                        <Button
                                            type="button"
                                            variant="link"
                                            onClick={handleResendOtp}
                                            disabled={loading}
                                            className="text-emerald-600"
                                        >
                                            Resend OTP
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        )}

                        {/* Step 3: Reset Password */}
                        {step === 3 && (
                            <Form {...resetForm}>
                                <form onSubmit={resetForm.handleSubmit(handleResetPassword)}>
                                    <div className="mb-4 text-center text-sm text-muted-foreground">
                                        Create a new password for your account
                                    </div>
                                    <FormField
                                        control={resetForm.control}
                                        name="newPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>New Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                                        <Input 
                                                            {...field} 
                                                            type="password" 
                                                            placeholder="Enter new password"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={resetForm.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem className="mt-4">
                                                <FormLabel>Confirm Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                                        <Input 
                                                            {...field} 
                                                            type="password" 
                                                            placeholder="Confirm new password"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700"
                                        disabled={loading}
                                    >
                                        {loading ? "Resetting..." : "Reset Password"}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </CardContent>

                    <CardFooter className="bg-slate-50 dark:bg-slate-800">
                        <div className="w-full text-center">
                            <Button
                                variant="link"
                                onClick={() => navigate("/auth/login")}
                                className="text-emerald-600 flex items-center gap-2 mx-auto"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
