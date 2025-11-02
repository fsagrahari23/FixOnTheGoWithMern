import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUser } from '../../store/slices/authSlice';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth/login');
            return;
        }

        // If authenticated but no user data, fetch it
        if (isAuthenticated && !user) {
            dispatch(fetchUser());
        }
    }, [isAuthenticated, user, dispatch, navigate]);

    useEffect(() => {
        if (user && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            // Redirect based on user role if not allowed
            if (user.role === 'user') {
                navigate('/user/dashboard');
            } else if (user.role === 'mechanic') {
                if (user.isApproved) {
                    navigate('/mechanic/dashboard');
                } else {
                    navigate('/auth/pending-approval');
                }
            } else if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/');
            }
        }
    }, [user, allowedRoles, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        return null; // Will redirect in useEffect
    }

    return children;
};

export default ProtectedRoute;
