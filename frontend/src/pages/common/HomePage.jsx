"use client"

import { useEffect, useState } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import Navbar from "../../components/common/Navbar"
import Hero from "../../components/common/Hero"
import Features from "../../components/common/features"
import HowItWorks from "../../components/common/how-it-works"
import Testimonials from "../../components/common/testimonial"
import CTA from "../../components/common/cta"
import Footer from "../../components/common/Footer"
import Loader from "../../components/common/loader"
import Journey from "../../components/common/jounery"


gsap.registerPlugin(ScrollTrigger)

export default function Home() {
    const [isDark, setIsDark] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check for dark mode preference
        const isDarkMode = document.documentElement.classList.contains("dark")
        setIsDark(isDarkMode)

        // Simulate loading time
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
        return <Loader />
    }

    return (
        <div className={isDark ? "dark" : ""}>
            <Navbar isDark={isDark} setIsDark={setIsDark} />
            <main className="overflow-hidden">
                <Hero />
                <Features />
                <HowItWorks />
                <Journey />
                <Testimonials />
                <CTA />
            </main>
            <Footer />
        </div>
    )
}
