"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"

export default function Loader() {
  const containerRef = useRef(null)
  const circlesRef = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      circlesRef.current.forEach((circle, index) => {
        gsap.to(circle, {
          rotation: 360,
          transformOrigin: "50% 50%",
          duration: 3 + index * 0.5,
          repeat: -1,
          ease: "none",
        })
      })

      gsap.to(".loader-pulse", {
        scale: 1.2,
        opacity: 0.5,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="relative w-32 h-32">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120">
          <circle
            ref={(el) => {
              if (el) circlesRef.current[0] = el
            }}
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="2"
            strokeDasharray="314"
            strokeDashoffset="0"
            opacity="0.6"
          />

          <circle
            ref={(el) => {
              if (el) circlesRef.current[1] = el
            }}
            cx="60"
            cy="60"
            r="35"
            fill="none"
            stroke="url(#gradient2)"
            strokeWidth="2"
            strokeDasharray="220"
            strokeDashoffset="0"
            opacity="0.8"
          />

          <circle
            ref={(el) => {
              if (el) circlesRef.current[2] = el
            }}
            cx="60"
            cy="60"
            r="20"
            fill="none"
            stroke="url(#gradient3)"
            strokeWidth="2"
            strokeDasharray="126"
            strokeDashoffset="0"
          />

          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--secondary)" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--secondary)" />
              <stop offset="100%" stopColor="var(--primary)" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--secondary)" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="loader-pulse text-4xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          >
            🔧
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-20 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-foreground/70 font-medium">Loading your service</p>
        <motion.div className="flex gap-1 justify-center mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, delay: i * 0.1 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
