import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles, skipPasswordCheck = false }) {
    const { user } = useSelector((state) => state.auth);

    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

    if (user.role === "mechanic" && !user.isApproved) {
        return <Navigate to="/auth/pending-approval" replace />;
    }

    // Check if staff user needs to change password
    if (user.role === "staff" && user.mustChangePassword && !skipPasswordCheck) {
        return <Navigate to="/staff/change-password" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}