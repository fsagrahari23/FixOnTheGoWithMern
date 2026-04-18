"use client"

import React, { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "../ui/button"
import { Menu, X, LogOut } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useDispatch } from "react-redux"
import { logout } from "../../store/slices/authThunks"
import { useSelector } from "react-redux"

export function SidebarNav({
    tabs = [],
    defaultActiveId,
    onTabChange,
    className = "",
}) {
    const { pathname } = useLocation()
    const [activeId, setActiveId] = useState(defaultActiveId || tabs[0]?.id)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const { user } = useSelector((state) => state.auth)
    const isAdmin = user?.role === "admin"
    const isStaff = user?.role === "staff"

    const getSidebarTitle = () => {
        if (isAdmin) return 'Admin'
        if (isStaff) return 'Staff'
        return 'User'
    }

    useEffect(() => {
        const matched = tabs.find((t) => t.url && pathname.startsWith(t.url))
        if (matched) setActiveId(matched.id)
    }, [pathname, tabs])

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [mobileOpen])

    const handleTabClick = (tab) => {
        setActiveId(tab.id)
        onTabChange?.(tab.id)
        tab.onClick?.()
        if (mobileOpen) setMobileOpen(false)
    }
    const dispatch = useDispatch()

    const onLogout = () => {
        console.log("Logout clicked")
        dispatch(logout())
    }

    const collapsedWidth = "w-16"
    const expandedWidth = "w-64"

    return (
        <>
            {/* ─── Desktop Sidebar ─────────────────────────────── */}
            <aside
                className={cn(
                    "hidden md:flex flex-col h-[92vh] bg-background border-r border-border transition-all",
                    isCollapsed ? collapsedWidth : expandedWidth,
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-4 border-b border-border">
                  {!isCollapsed && <h2 className="text-lg font-semibold">{getSidebarTitle()}</h2>}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCollapsed((s) => !s)}
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Menu */}
                <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                    {tabs.map((tab) => {
                        const active = pathname === tab.url || activeId === tab.id
                        return (
                            <Link
                                key={tab.id}
                                to={tab.url || "#"}
                                onClick={() => handleTabClick(tab)}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 transition-colors group",
                                    isCollapsed ? "justify-center" : "justify-start",
                                    active
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-foreground dark:hover:bg-gray-500 hover:bg-gray-50"
                                )}
                            >
                                {tab.icon && <tab.icon className="h-5 w-5" />}
                                {!isCollapsed && <span className="truncate">{tab.label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                {/* Logout Button */}
                <div className="border-t border-border px-3 py-3">
                    <Button
                        variant="destructive"
                        className={cn("w-full flex items-center justify-center gap-2", isCollapsed && "px-0")}
                        onClick={onLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        {!isCollapsed && <span>Logout</span>}
                    </Button>
                </div>

              
            </aside>

            {/* ─── Mobile Bottom Bar ───────────────────────────── */}
            <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm z-top">
                <div className={cn(
                    "flex items-center backdrop-blur-2xl rounded-full p-2 shadow-2xl transition-all duration-300",
                    "bg-white/90 dark:bg-zinc-900/95",
                    "border border-slate-200/60 dark:border-white/10",
                    "ring-1 ring-slate-900/5 dark:ring-white/5"
                )}>
                    <div className="flex justify-around items-center flex-1 pr-2">
                        {tabs.map((tab) => {
                            const active = pathname === tab.url || activeId === tab.id
                            return (
                                <Link
                                    key={tab.id}
                                    to={tab.url || "#"}
                                    onClick={() => handleTabClick(tab)}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center p-2.5 transition-all duration-300",
                                        active ? "text-primary scale-110" : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                >
                                    {tab.icon ? (
                                        <tab.icon className={cn("h-5 w-5", active ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
                                    ) : (
                                        <span className="font-bold text-xs">{tab.label?.[0]}</span>
                                    )}
                                    
                                    {active && (
                                        <motion.div
                                            layoutId="activeTabMobile"
                                            className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </Link>
                            )
                        })}
                    </div>

                    <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10 mx-1" />

                    <button
                        onClick={onLogout}
                        className="flex items-center justify-center h-10 w-10 min-w-[40px] rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 transition-all active:scale-90"
                        aria-label="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* ─── Mobile Drawer ─────────────────────────────── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.35 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black z-50"
                        />

                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed inset-y-0 left-0 z-60 w-72 bg-background border-r border-border shadow-lg"
                        >
                            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                                <h3 className="text-lg font-semibold">FixOnTheGo</h3>
                                <Button variant="ghost" onClick={() => setMobileOpen(false)} size="sm">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <nav className="px-3 py-4 space-y-1 overflow-y-auto">
                                {tabs.map((tab) => {
                                    const active = pathname === tab.url || activeId === tab.id
                                    return (
                                        <Link
                                            key={tab.id}
                                            to={tab.url || "#"}
                                            onClick={() => handleTabClick(tab)}
                                            className={cn(
                                                "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                                                active
                                                    ? "bg-primary/10 text-primary font-medium"
                                                    : "text-foreground hover:bg-gray-50"
                                            )}
                                        >
                                            {tab.icon && <tab.icon className="h-5 w-5" />}
                                            <span className="truncate">{tab.label}</span>
                                        </Link>
                                    )
                                })}
                            </nav>

                            <div className="px-4 py-3 border-t border-border flex justify-between items-center">
                                <p className="text-xs text-muted-foreground">© 2025 Your App</p>
                                <Button variant="destructive" size="sm" onClick={onLogout} className="flex items-center gap-2">
                                    <LogOut className="h-4 w-4" /> Logout
                                </Button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
