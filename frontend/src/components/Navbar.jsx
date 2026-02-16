"use client";

import React, { useState } from "react";
import { Moon, Sun, LogOut, Settings, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../store/slices/themeSlice";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authThunks";
import { NotificationCenter } from "./notifications";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useSelector((state) => state.theme.mode);
  const { address } = useSelector((state) => state.location);
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSettings = () => {
    navigate("/settings");
  };

  const handleProfile = () => {
    if (user?.role === "mechanic") {
      navigate("/mechanic/profile");
    } else if (user?.role === "admin") {
      navigate("/admin/profile");
    } else {
      navigate("/user/profile");
    }
  };

  const handleLogin = () => navigate("/auth/login");
  const handleRegister = () => navigate("/auth/register");

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    const nameParts = user.name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="h-16 border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 backdrop-blur-md bg-background/80 dark:bg-background/90 dark:shadow-lg dark:shadow-primary/5">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
          FixOnTheGo
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Location display */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Location"
          >
            <MapPin className="w-5 h-5" />
          </Button>
          <span className="hidden sm:inline px-3 py-1 rounded-full bg-muted text-sm text-foreground/90 max-w-xs truncate">
            {address || "Fetching location..."}
          </span>
        </div>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleTheme())}
          className="rounded-full"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* Notification Center - only show for logged in users */}
        {user && <NotificationCenter />}

        {/* Conditional rendering: Login/Register buttons or User dropdown */}
        {!user ? (
          <>
            <Button
              variant="outline"
              onClick={handleLogin}
              className="rounded-full"
            >
              Login
            </Button>
            <Button
              onClick={handleRegister}
              className="rounded-full"
            >
              Register
            </Button>
          </>
        ) : (
          /* User dropdown */
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profilePicture || user?.avatar} alt={user?.name || "User"} />
                  <AvatarFallback className="bg-linear-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || ""}</p>
                {user?.role && (
                  <p className="text-xs leading-none text-primary font-medium capitalize">{user.role}</p>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfile}>
                <User className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSettings}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
