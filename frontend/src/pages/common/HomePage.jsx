"use client"

import { useEffect, useState } from "react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import Loader from "../../components/HomeComponents/loader"
import Navbar from "../../components/HomeComponents/navbar"
import Hero from "../../components/HomeComponents/hero"
import Features from "../../components/HomeComponents/features"
import HowItWorks from "../../components/HomeComponents/how-it-works"
import Journey from "../../components/HomeComponents/journey"
import Testimonials from "../../components/HomeComponents/testimonials"
import CTA from "../../components/HomeComponents/cta"
import Footer from "../../components/HomeComponents/footer"

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
    const [isDark, setIsDark] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains("dark")
        setIsDark(isDarkMode)

        const timer = setTimeout(() => setIsLoading(false), 2000)
        return () => clearTimeout(timer)
    }, [])

    if (isLoading) return <Loader />

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
