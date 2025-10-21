"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    number: "01",
    title: "Book a Mechanic",
    description: "Select your vehicle type, describe the issue, and upload photos for quick diagnosis.",
    emoji: "📱",
  },
  {
    number: "02",
    title: "Get Connected",
    description: "Choose from nearby certified mechanics and connect through real-time chat.",
    emoji: "🔗",
  },
  {
    number: "03",
    title: "Get Fixed & Pay",
    description: "Once your vehicle is repaired, pay securely and rate your mechanic.",
    emoji: "✅",
  },
]

export default function HowItWorks() {
  const containerRef = useRef(null)
  const stepsRef = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      stepsRef.current.forEach((step, index) => {
        gsap.from(step, {
          scrollTrigger: {
            trigger: step,
            start: "top 80%",
            end: "top 20%",
            scrub: 1,
          },
          x: index % 2 === 0 ? -100 : 100,
          opacity: 0,
          duration: 0.8,
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      id="how-it-works"
      className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            How It{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-lg text-foreground/60">Get your vehicle fixed in 3 simple steps</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-1/3 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 -z-10"></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              ref={(el) => {
                if (el) stepsRef.current[index] = el
              }}
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {step.number}
                </div>
              </div>

              <div className="glass p-8 rounded-2xl text-center border border-primary/10 hover:border-primary/30 transition-all">
                <div className="text-5xl mb-4">{step.emoji}</div>
                <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                <p className="text-foreground/60">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
