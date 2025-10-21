"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { MapPin, Wrench, Clock, MessageSquare, Shield, Star } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    icon: MapPin,
    title: "On-Demand Service",
    description: "Get help exactly where you are. Our mechanics come to your location for any vehicle.",
  },
  {
    icon: Wrench,
    title: "Expert Mechanics",
    description: "Certified professionals experienced in all vehicle types and repairs.",
  },
  {
    icon: Clock,
    title: "Quick Response",
    description: "Mechanics respond within minutes and arrive ASAP to fix your vehicle.",
  },
  {
    icon: MessageSquare,
    title: "Real-Time Chat",
    description: "Communicate directly with your mechanic through our app.",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Pay securely with multiple payment options available.",
  },
  {
    icon: Star,
    title: "Rate & Review",
    description: "Rate mechanics and help us improve our service quality.",
  },
]

export default function Features() {
  const containerRef = useRef(null)
  const cardsRef = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            end: "top 20%",
            scrub: 1,
          },
          y: 100,
          opacity: 0,
          duration: 0.8,
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-balance">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FixOnTheGo?
            </span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            We provide the best vehicle assistance service with certified mechanics and instant support for all vehicle
            types.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el
                }}
                whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.2)" }}
                className="group glass p-8 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-foreground/60">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
