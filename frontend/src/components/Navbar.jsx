"use client"

import { useState } from "react"
import { Moon, Sun, LogOut, Settings, User, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../store/slices/themeSlice';
import { setCoordinates, setAddress } from '../store/slices/locationSlice';


export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme.mode);
    const location = useSelector((state) => state.location); // { coordinates, address }


    const handleLogout = () => {
        console.log("User logged out")
        setIsOpen(false)
    }

    const handleSettings = () => {
        console.log("Opening settings")
        setIsOpen(false)
    }

    const handleProfile = () => {
        console.log("Opening profile")
        setIsOpen(false)
    }

    const handleLocationClick = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    dispatch(setCoordinates({ lat: latitude, lng: longitude }));

                    try {
                        // Fetch address from OpenStreetMap Nominatim API
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );
                        const data = await response.json();

                        // Construct address
                        const address = data.display_name || "Address not available";
                        dispatch(setAddress(address));
                    } catch (error) {
                        console.error('Error fetching address:', error);
                        dispatch(setAddress('Address not available'));
                    }
                },
                (error) => {
                    console.error('Error getting location:', error);
                    dispatch(setAddress('Unable to get location'));
                }
            );
        } else {
            dispatch(setAddress('Geolocation not supported'));
        }
    };


    return (
        <nav className="h-16 bg-background border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
            {/* Left side - Logo */}
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold text-foreground">FixOnTheGo</h2>
            </div>

            {/* Right side - Location display, Theme toggle, User profile */}
            <div className="flex items-center gap-4">

                {/* Location button + display */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLocationClick}
                        className="rounded-full"
                        aria-label="Set location"
                    >
                        <MapPin className="w-5 h-5" />
                    </Button>

                    {/* Styled location badge */}
                    <span className="hidden sm:inline px-3 py-1 rounded-full bg-muted text-sm text-foreground/90 max-w-xs truncate">
                        {location.address || "Set location"}
                    </span>
                </div>

                {/* Theme toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => dispatch(toggleTheme())}
                    className="rounded-full"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>

                {/* User dropdown */}
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">John Doe</p>
                            <p className="text-xs leading-none text-muted-foreground">john@example.com</p>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </nav>
    )
}
