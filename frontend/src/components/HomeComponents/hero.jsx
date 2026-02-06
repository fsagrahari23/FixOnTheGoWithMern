"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ArrowRight } from "lucide-react"

export default function Hero() {
  const containerRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-title", {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: "power3.out",
      })

      gsap.from(".hero-subtitle", {
        duration: 1,
        y: 50,
        opacity: 0,
        delay: 0.2,
        ease: "power3.out",
      })

      gsap.from(".hero-buttons", {
        duration: 1,
        y: 50,
        opacity: 0,
        delay: 0.4,
        ease: "power3.out",
      })

      gsap.from(".hero-image", {
        duration: 1.2,
        x: 100,
        opacity: 0,
        delay: 0.3,
        ease: "power3.out",
      })

      // Keep image visible after animation
      gsap.to(".hero-image", {
        opacity: 1,
        delay: 1.5,
        duration: 0
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="min-h-screen flex items-center justify-center pt-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <div className="hero-title">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-balance">
                Your Vehicle Breaks,{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  We Fix It
                </span>
              </h1>
            </div>

            <div className="hero-subtitle mt-6">
              <p className="text-lg sm:text-xl text-foreground/70 text-balance">
                Connect with certified mechanics instantly. Get professional repairs for any vehicle—bikes, cars,
                motorcycles, scooters—wherever you are, whenever you need them.
              </p>
            </div>

            <div className="hero-buttons flex flex-col sm:flex-row gap-4 mt-8">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-full font-semibold flex items-center justify-center gap-2 transition-all"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary/10 transition-all"
              >
                Join as Mechanic
              </motion.button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-12">
              {[
                { number: "50K+", label: "Users" },
                { number: "2K+", label: "Mechanics" },
                { number: "4.9★", label: "Rating" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="glass p-4 rounded-lg text-center"
                >
                  <div className="font-bold text-xl text-primary">{stat.number}</div>
                  <div className="text-sm text-foreground/60">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="hero-image lg:flex justify-center"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="relative w-full max-w-md">
              <img src="HeroImage.png" alt="Hero Dashboard" className="w-full h-auto object-contain" style={{ opacity: 1 }} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
