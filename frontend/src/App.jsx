import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import store from "./store/store";

import { getMe } from "./store/slices/authThunks";

import { LocationProvider } from "./contexts/LocationContext";
import { NotificationProvider } from "./contexts/NotificationContext";

import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import { NotificationPopup, ServiceRequestPopup } from "./components/notifications";

// Pages
import Dashboard from "./pages/users/Dashboard";
import HomePage from "./pages/common/HomePage";
import Booking_details from "./pages/users/Booking_details";
import BookingFormPage from "./pages/users/BookingFormPage";
import Emergency from "./pages/users/Emergency";
import History from "./pages/users/History";
import Maintainance from "./pages/users/Maintainance";
import Premium from "./pages/users/Premium";
import Profile from "./pages/users/Profile";
import UserLayout from "./pages/users/UserLayOut";
import Loader from "./components/HomeComponents/loader";

import UserRegister from "./pages/auth/UserRegister";
import MechanicRegister from "./pages/auth/MechanicRegisterPage";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import PendingApproval from "./components/auth/PendingApproval";

// Mechanic
import MechanicDashboard from "./pages/mechanic/Dashboard";
import { MechanicLayout } from "./components/layouts/MechanicLayout";
import MechanicBookingDetails from "./pages/mechanic/BookingDetails";
import MechanicHistory from "./pages/mechanic/History";
import MechanicProfile from "./pages/mechanic/Profile";

// Admin
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLayout from "./pages/admin/adminLayout";
import Booking from "./pages/admin/Booking";
import BookingDetails from "./pages/admin/BookingDetails";
import User from "./pages/admin/User";
import UserProfile from "./pages/admin/UserProfile";
import Mechanic from "./pages/admin/Mechanic";
import Payment from "./pages/admin/Payment";
import Subscription from "./pages/admin/Subscription";
import AdminProfile from "./pages/admin/AdminProfile";

// Staff
import StaffLayout from "./pages/staff/StaffLayout";
import StaffDashboard from "./pages/staff/Dashboard";
import StaffChangePassword from "./pages/staff/ChangePassword";

// Chat
import SupportChat from "./pages/users/SupportChat";


// ROUTES CONFIG
const userRoutes = {
  dashboard: Dashboard,
  "booking/:id": Booking_details,
  booking_form: BookingFormPage,
  emergency: Emergency,
  history: History,
  maintenance: Maintainance,
  premium: Premium,
  profile: Profile,
  "chat/:chatId": SupportChat,
};

const adminRoutes = {
  dashboard: AdminDashboard,
  bookings: Booking,
  "booking/:id": BookingDetails,
  users: User,
  "user/:id": UserProfile,
  mechanics: Mechanic,
  payments: Payment,
  subscriptions: Subscription,
  profile: AdminProfile,
};

const mechanicRoutes = {
  dashboard: MechanicDashboard,
  "booking/:id": MechanicBookingDetails,
  history: MechanicHistory,
  profile: MechanicProfile,
};

const staffRoutes = {
  dashboard: StaffDashboard,
};


// MAIN CONTENT
function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe()).finally(() => {
      setTimeout(() => setIsLoading(false), 1000);
    });
  }, [dispatch]);

  if (isLoading || status === "loading") return <Loader />;

  return (
    <BrowserRouter>
      <NotificationProvider>
        <NotificationPopup />
        <ServiceRequestPopup />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<UserRegister />} />
          <Route path="/auth/register-mechanic" element={<MechanicRegister />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

          {/* USER */}
          <Route
            path="/user/*"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <LocationProvider>
                  <UserLayout />
                </LocationProvider>
              </ProtectedRoute>
            }
          >
            {Object.entries(userRoutes).map(([key, Component]) => (
              <Route key={key} path={key} element={<Component />} />
            ))}
          </Route>

          {/* ADMIN */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <LocationProvider>
                  <AdminLayout />
                </LocationProvider>
              </ProtectedRoute>
            }
          >
            {Object.entries(adminRoutes).map(([key, Component]) => (
              <Route key={key} path={key} element={<Component />} />
            ))}
          </Route>

          {/* MECHANIC */}
          <Route
            path="/mechanic/*"
            element={
              <ProtectedRoute allowedRoles={["mechanic"]}>
                <LocationProvider>
                  <MechanicLayout />
                </LocationProvider>
              </ProtectedRoute>
            }
          >
            {Object.entries(mechanicRoutes).map(([key, Component]) => (
              <Route key={key} path={key} element={<Component />} />
            ))}
          </Route>

          {/* STAFF */}
          <Route
            path="/staff/change-password"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <StaffChangePassword />
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/*"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <LocationProvider>
                  <StaffLayout />
                </LocationProvider>
              </ProtectedRoute>
            }
          >
            {Object.entries(staffRoutes).map(([key, Component]) => (
              <Route key={key} path={key} element={<Component />} />
            ))}
          </Route>

          <Route path="/auth/pending-approval" element={<PendingApproval />} />
        </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
}


// ROOT APP
export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
      <Toaster />
    </Provider>
  );
}