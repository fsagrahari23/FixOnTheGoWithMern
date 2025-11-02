import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user } = useSelector((state) => state.auth);

    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

    if (user.role === "mechanic" && !user.isApproved) {
        return <Navigate to="/auth/pending-approval" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}