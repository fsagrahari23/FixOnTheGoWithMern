import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch, useSelector } from "react-redux";
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
import { login } from "../../store/slices/authThunks";

const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function Login() {
    const [dark, setDark] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { status, error, user, role } = useSelector((state) => state.auth);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const root = document.documentElement;
            if (dark) root.classList.add("dark");
            else root.classList.remove("dark");
        }
    }, [dark]);

    useEffect(() => {
        if (user) {
            console.log("User data:", user);
            const redirectUrl = `/${user.role}/dashboard`;
            if (user.role === "mechanic" && !user.isApproved) {
                navigate("/auth/pending-approval");
                return;
            }
            navigate(redirectUrl, { replace: true });
        }
    }, [user, navigate]);

    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleSubmit = async (data) => {
        try {
            await dispatch(login(data)).unwrap();
        } catch (err) {
            console.error("Login error:", err);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-md mx-auto">
                <Card className="shadow-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    <CardHeader className="flex items-center justify-between bg-emerald-600 dark:bg-slate-800 text-white rounded-t-lg">
                        <CardTitle className="py-4 text-lg flex items-center gap-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                            </svg>
                            Login
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6">
                        {status === "loading" && <p className="text-center">Loading...</p>}
                        {error && <p className="text-red-500 text-center">{error}</p>}

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)}>
                                <FormField
                                    control={form.control}
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

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem className="mt-4">
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="password" placeholder="Enter your password" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700"
                                    disabled={status === "loading"}
                                >
                                    Login
                                </Button>
                            </form>
                        </Form>
                    </CardContent>

                    <CardFooter className="bg-slate-50 dark:bg-slate-800">
                        <div className="w-full text-center text-sm">
                            Don't have an account?{" "}
                            <a href="/auth/register" className="text-emerald-600">
                                Register as User
                            </a>
                            <br />
                            Want to register as a mechanic?{" "}
                            <a href="/auth/register-mechanic" className="text-emerald-600">
                                Register as Mechanic
                            </a>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}