"use client"

import { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

export const userRoutes = {
  dashboard: Dashboard,
  booking_details: Booking_details,
  booking_form: BookingFormPage,
  emergency: Emergency,
  history: History,
  maintenance: Maintainance,
  premium: Premium,
  profile: Profile,
}


export default function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) return <Loader />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/user" element={<UserLayout />}>
          {Object.entries(userRoutes).map(([key, Component]) => (
            <Route key={key} path={key} element={<Component />} />
          ))}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
