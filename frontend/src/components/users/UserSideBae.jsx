"use client"

import React, { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "../ui/button"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * Props:
 *  - tabs: [{ id, label, url, icon }]
 *  - defaultActiveId
 *  - onTabChange
 */
export function SidebarNav({
    tabs = [],
    defaultActiveId,
    onTabChange,
    className = "",
}) {
    const { pathname } = useLocation()
    const [activeId, setActiveId] = useState(defaultActiveId || tabs[0]?.id)
    const [isCollapsed, setIsCollapsed] = useState(false) // desktop collapse
    const [mobileOpen, setMobileOpen] = useState(false) // mobile drawer

    useEffect(() => {
        // set activeId from path if possible
        const matched = tabs.find((t) => t.url && pathname.startsWith(t.url))
        if (matched) setActiveId(matched.id)
    }, [pathname, tabs])

    useEffect(() => {
        // prevent background scroll when mobile drawer open
        document.body.style.overflow = mobileOpen ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [mobileOpen])

    const handleTabClick = (tab) => {
        setActiveId(tab.id)
        onTabChange?.(tab.id)
        tab.onClick?.()
        // If mobile, close drawer after navigation
        if (mobileOpen) setMobileOpen(false)
    }

    // UI sizes
    const collapsedWidth = "w-16"
    const expandedWidth = "w-64"

    return (
        <>
            {/* Desktop / Tablet Sidebar (collapsible) */}
            <aside
                className={cn(
                    "hidden md:flex flex-col h-screen bg-background border-r border-border transition-all",
                    isCollapsed ? collapsedWidth : expandedWidth,
                    className
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-4 border-b border-border">
                    {!isCollapsed ? (
                        <h2 className="text-lg font-semibold">User</h2>
                    ) : (
                        <div className="text-sm font-semibold">F</div>
                    )}

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
                                <span className="flex-shrink-0">
                                    {tab.icon ? <tab.icon className="h-5 w-5" /> : null}
                                </span>

                                {/* label hidden when collapsed */}
                                {!isCollapsed && (
                                    <span className="truncate">{tab.label}</span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="px-3 py-3 border-t border-border">
                    {!isCollapsed ? (
                        <p className="text-xs text-muted-foreground">© 2025 Your App</p>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center">©</p>
                    )}
                </div>
            </aside>

            {/* Mobile: icons-only bar (always visible on small screens) */}
            {/* Mobile: icons-only bar (always visible on small screens) */}
            <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 bg-background/80 backdrop-blur rounded-full px-2 py-2 shadow-sm border border-border w-full">
                    <div className="flex justify-evenly gap-1 flex-1 overflow-x-auto">
                        {tabs.map((tab) => {
                            const active = pathname === tab.url || activeId === tab.id
                            return (
                                <Link
                                    key={tab.id}
                                    to={tab.url || "#"}
                                    onClick={() => handleTabClick(tab)} // ONLY change tab
                                    className={cn(
                                        "flex items-center justify-center p-2 rounded-md",
                                        active ? "bg-primary/10 text-primary" : "text-foreground/80"
                                    )}
                                >
                                    {tab.icon ? <tab.icon className="h-5 w-5" /> : <span>{tab.label?.[0]}</span>}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Hamburger button opens full drawer */}
                    {/* <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu className="h-5 w-5" />
                    </Button> */}
                </div>
            </div>


            {/* Mobile sliding drawer (AnimatePresence) */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.35 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black z-50"
                        />

                        {/* drawer */}
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
                                                active ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-gray-50"
                                            )}
                                        >
                                            {tab.icon && <tab.icon className="h-5 w-5" />}
                                            <span className="truncate">{tab.label}</span>
                                        </Link>
                                    )
                                })}
                            </nav>

                            <div className="px-4 py-3 border-t border-border">
                                <p className="text-xs text-muted-foreground">© 2025 Your App</p>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
