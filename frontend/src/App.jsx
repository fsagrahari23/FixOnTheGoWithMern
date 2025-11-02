
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "../src/store/slices/authThunks";
import store from "./store/store";
import { LocationProvider } from "./contexts/LocationContext";
import ProtectedRoute from "../src/components/ProtectedRoute";

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
import MechanicRegister from "./pages/auth/MechaicRegisterPage";
import Login from "./pages/auth/Login";
import PendingApproval from "./components/auth/PendingApproval";

export const userRoutes = {
  dashboard: Dashboard,
  booking_details: Booking_details,
  booking_form: BookingFormPage,
  emergency: Emergency,
  history: History,
  maintenance: Maintainance,
  premium: Premium,
  profile: Profile,
};

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe()).finally(() => {
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    });
  }, [dispatch]);

  if (isLoading || status === "loading") return <Loader />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<UserRegister />} />
        <Route path="/auth/register-mechanic" element={<MechanicRegister />} />
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
        <Route path="/auth/pending-approval" element={<PendingApproval />} />
      </Routes>
    </BrowserRouter>
  );
}

// Outer component that wraps AppContent with Provider
export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}