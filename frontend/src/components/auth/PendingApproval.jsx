import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authThunks"
export default function PendingApproval() {
    const navigate = useNavigate();
    const dispatch = useDispatch();


    const logOut = () => {
        // Dispatch logout action
        dispatch(logout());
        navigate("/auth/login");
    }

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-md mx-auto">
                <Card className="shadow-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                    <CardHeader className="bg-emerald-600 dark:bg-slate-800 text-white rounded-t-lg">
                        <CardTitle className="py-4 text-lg">Pending Approval</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <p>Your mechanic account is pending approval by an admin. You will be notified once approved.</p>
                        <button
                            onClick={logOut}
                            className="mt-4 text-emerald-600 hover:underline"
                        >
                            Logout
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}