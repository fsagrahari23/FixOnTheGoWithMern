"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { Star } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const testimonials = [
  {
    name: "John Smith",
    role: "Regular User",
    content:
      "I was stranded on a highway when my bike broke down. Within 30 minutes, a mechanic arrived and fixed my bike. Excellent service!",
    rating: 5,
    avatar: "👨‍💼",
  },
  {
    name: "Mike Johnson",
    role: "Mechanic",
    content:
      "As a mechanic, this platform has helped me connect with customers easily. The real-time chat and location tracking are game-changers!",
    rating: 5,
    avatar: "👨‍🔧",
  },
  {
    name: "Sarah Williams",
    role: "Regular User",
    content:
      "The app is super easy to use. I love how I can track the mechanic in real-time and communicate directly. Saved me a lot of hassle!",
    rating: 5,
    avatar: "👩‍💼",
  },
]

export default function Testimonials() {
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
          rotation: -5 + index * 5,
          duration: 0.8,
        })
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={containerRef} id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>
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
            What Our{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Users Say</span>
          </h2>
          <p className="text-lg text-foreground/60">Trusted by thousands of vehicle owners</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              ref={(el) => {
                if (el) cardsRef.current[index] = el
              }}
              whileHover={{ y: -10 }}
              className="glass p-8 rounded-2xl border border-primary/10 hover:border-primary/30 transition-all"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                ))}
              </div>

              <p className="text-foreground/70 mb-6 italic">"{testimonial.content}"</p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-foreground/60">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
