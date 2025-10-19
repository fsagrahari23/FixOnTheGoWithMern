"use client"

import { useState } from "react"
import { Moon, Sun, LogOut, Settings, User } from "lucide-react"
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


export function Navbar({ onThemeToggle, isDark = false }) {
    const [isOpen, setIsOpen] = useState(false)

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

    return (
        <nav className="h-16 bg-background border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
            {/* Left side - could add logo or title here */}
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold text-foreground">FixOnTheGo</h2>
            </div>

            {/* Right side - Theme toggle and User profile */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onThemeToggle} className="rounded-full" aria-label="Toggle theme">
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>

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
