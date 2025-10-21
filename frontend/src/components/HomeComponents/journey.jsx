"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { gsap } from "gsap"

export default function Journey() {
    // Refs
    const carRef = useRef(null)
    const hoodRef = useRef(null)
    const wheel1Ref = useRef(null)
    const wheel2Ref = useRef(null)
    const roadRef = useRef(null)
    const manRef = useRef(null)
    const helperRef = useRef(null)
    const mechanicRef = useRef(null)
    const speechBubbleRef = useRef(null)
    const helperBubbleRef = useRef(null)
    const phoneRef = useRef(null)
    const mechanicBubbleRef = useRef(null)
    const smokeRef = useRef(null)
    const toolsRef = useRef(null)
    const miniMapRef = useRef(null)
    const mechanicDotRef = useRef(null)
    const chatRef = useRef(null)
    const paymentRef = useRef(null)
    const successRef = useRef(null)

    // Timeline refs
    const mainTlRef = useRef(null)
    const wheelTlRef = useRef(null)
    const bounceTlRef = useRef(null)
    const roadTlRef = useRef(null)

    // State
    const [isPlaying, setIsPlaying] = useState(true)
    const [speed, setSpeed] = useState(1)
    const [currentScene, setCurrentScene] = useState("driving")
    const [mechanicETA, setMechanicETA] = useState(120)
    const [mechanicDistance, setMechanicDistance] = useState(2.5)
    const [visibleMessages, setVisibleMessages] = useState(0)
    const [showTyping, setShowTyping] = useState(false)
    const [repairStep, setRepairStep] = useState("")

    const [size, setSize] = useState({
        width: typeof window !== "undefined" ? window.innerWidth : 1200,
        height: typeof window !== "undefined" ? window.innerHeight : 800,
    })
    const scale = Math.max(0.55, Math.min(1, size.width / 1200))

    const chatMessages = [
        { sender: "customer", message: "Hi! My car broke down on Main Street", time: "2:34 PM", delay: 0.5 },
        {
            sender: "mechanic",
            message: "Hello! I'm Mike, your mechanic. I can see your location 👍",
            time: "2:34 PM",
            delay: 1.5,
        },
        { sender: "mechanic", message: "What seems to be the problem?", time: "2:35 PM", delay: 2.2 },
        { sender: "customer", message: "Engine started smoking and making weird noises", time: "2:35 PM", delay: 3.0 },
        { sender: "mechanic", message: "Got it! I'm on my way. ETA 2 minutes 🚗", time: "2:36 PM", delay: 4.0 },
        { sender: "customer", message: "Thank you so much! I'll wait by the car", time: "2:36 PM", delay: 4.8 },
        { sender: "mechanic", message: "Almost there! I can see you on the map 📍", time: "2:37 PM", delay: 6.0 },
    ]

    const repairSteps = [
        "Opening hood...",
        "Inspecting engine...",
        "Checking coolant system...",
        "Replacing damaged hose...",
        "Refilling coolant...",
        "Testing engine...",
        "Repair complete! ✅",
    ]

    useEffect(() => {
        const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
        onResize()
        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, [])

    useEffect(() => {
        const car = carRef.current
        const hood = hoodRef.current
        const wheel1 = wheel1Ref.current
        const wheel2 = wheel2Ref.current
        const road = roadRef.current
        const man = manRef.current
        const helper = helperRef.current
        const mechanic = mechanicRef.current
        const speechBubble = speechBubbleRef.current
        const helperBubble = helperBubbleRef.current
        const phone = phoneRef.current
        const mechanicBubble = mechanicBubbleRef.current
        const smoke = smokeRef.current
        const tools = toolsRef.current
        const miniMap = miniMapRef.current
        const mechanicDot = mechanicDotRef.current
        const chat = chatRef.current
        const payment = paymentRef.current
        const success = successRef.current

        if (
            !car ||
            !hood ||
            !wheel1 ||
            !wheel2 ||
            !road ||
            !man ||
            !helper ||
            !mechanic ||
            !speechBubble ||
            !helperBubble ||
            !phone ||
            !mechanicBubble ||
            !smoke ||
            !tools ||
            !miniMap ||
            !mechanicDot ||
            !chat ||
            !payment ||
            !success
        ) {
            return
        }

        mainTlRef.current?.kill()
        wheelTlRef.current?.kill()
        bounceTlRef.current?.kill()
        roadTlRef.current?.kill()

        const mainTl = gsap.timeline({
            repeat: -1,
            paused: false,
            defaults: { clearProps: "transform" },
            onUpdate() {
                const progress = this.progress()
                if (progress < 0.08) setCurrentScene("driving")
                else if (progress < 0.14) setCurrentScene("breakdown")
                else if (progress < 0.22) setCurrentScene("helper-arrives")
                else if (progress < 0.26) setCurrentScene("booking-mechanic")
                else if (progress < 0.28) setCurrentScene("tracking-mechanic")
                else if (progress < 0.4) setCurrentScene("chatting")
                else if (progress < 0.42) setCurrentScene("mechanic-arrives")
                else if (progress < 0.65) setCurrentScene("detailed-repair")
                else if (progress < 0.75) setCurrentScene("payment")
                else if (progress < 0.82) setCurrentScene("success")
                else setCurrentScene("driving-away")

                if (progress >= 0.28 && progress < 0.4) {
                    const trackingProgress = (progress - 0.28) / 0.12
                    const newETA = Math.max(5, Math.round(120 * (1 - trackingProgress)))
                    const newDistance = Math.max(0.1, 2.5 * (1 - trackingProgress))
                    setMechanicETA(newETA)
                    setMechanicDistance(Number.parseFloat(newDistance.toFixed(1)))
                }

                if (progress >= 0.28 && progress < 0.4) {
                    const chatProgress = (progress - 0.28) / 0.12
                    const messageIndex = Math.floor(chatProgress * chatMessages.length)
                    setVisibleMessages(Math.min(messageIndex, chatMessages.length))
                    const shouldShowTyping = chatProgress > 0.1 && chatProgress < 0.9 && Math.floor(chatProgress * 20) % 4 === 0
                    setShowTyping(shouldShowTyping)
                } else {
                    setVisibleMessages(0)
                    setShowTyping(false)
                }

                if (progress >= 0.42 && progress < 0.65) {
                    const repairProgress = (progress - 0.42) / 0.23
                    const stepIndex = Math.floor(repairProgress * repairSteps.length)
                    setRepairStep(repairSteps[Math.min(stepIndex, repairSteps.length - 1)] || "")
                } else {
                    setRepairStep("")
                }
            },
        })

        mainTlRef.current = mainTl

        gsap.set(man, { opacity: 0, x: -50, y: 0 })
        gsap.set(helper, { opacity: 0, x: -100, y: 0 })
        gsap.set(mechanic, { opacity: 0, x: 200, y: 0 })
        gsap.set([speechBubble, helperBubble, mechanicBubble], { opacity: 0, scale: 0 })
        gsap.set(phone, { opacity: 0, scale: 0 })
        gsap.set(miniMap, { opacity: 0, scale: 0 })
        gsap.set(chat, { opacity: 0, scale: 0 })
        gsap.set(payment, { opacity: 0, scale: 0 })
        gsap.set(success, { opacity: 0, scale: 0 })
        gsap.set(smoke, { opacity: 0 })
        gsap.set(tools, { opacity: 0 })
        gsap.set(mechanicDot, { x: 0, y: 0 })
        gsap.set(hood, { transformOrigin: "bottom center", rotation: 0 })

        mainTl.fromTo(car, { x: -300 }, { x: 0, duration: 1.5, ease: "power2.out" })
        mainTl.to(smoke, { opacity: 1, duration: 0.5 }, "-=0.5")
        mainTl.to(car, { x: "+=5", duration: 0.1, repeat: 5, yoyo: true, ease: "power2.inOut" })
        mainTl.to(man, { opacity: 1, x: 0, duration: 0.6, ease: "back.out(1.7)" })
        mainTl.to(
            man.querySelector(".man-arm"),
            { rotation: -30, duration: 0.3, repeat: 2, yoyo: true, transformOrigin: "bottom center" },
            "-=0.3",
        )
        mainTl.to(speechBubble, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }, "-=0.6")
        mainTl.to({}, { duration: 0.6 })
        mainTl.to(speechBubble, { opacity: 0, scale: 0, duration: 0.2 })
        mainTl.to(helper, { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }, "-=0.1")
        mainTl.to(helperBubble, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" })
        mainTl.to({}, { duration: 1 })
        mainTl.to(helperBubble, { opacity: 0, scale: 0, duration: 0.2 })
        mainTl.to(phone, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" })
        mainTl.to({}, { duration: 0.4 })
        mainTl.to(phone, { opacity: 0, scale: 0, duration: 0.2 })
        mainTl.to(miniMap, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" })
        mainTl.to(chat, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }, "-=0.1")
        mainTl.fromTo(
            mechanicDot,
            { x: 0, y: 0 },
            { x: 80 * scale, y: 60 * scale, duration: 2.2, ease: "power2.out" },
            "-=0.2",
        )
        mainTl.to([miniMap, chat], { opacity: 0, scale: 0, duration: 0.2, stagger: 0.05 })
        mainTl.to(mechanic, { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" })
        mainTl.to(mechanicBubble, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.7)" }, "-=0.3")
        mainTl.to({}, { duration: 0.3 })
        mainTl.to(mechanicBubble, { opacity: 0, scale: 0, duration: 0.2 })
        mainTl.to(hood, { rotation: -60, duration: 0.8, ease: "power2.out" })
        mainTl.to(mechanic, { x: -20, duration: 0.6, ease: "power2.out" }, "-=0.6")
        mainTl.to(mechanic, { y: -15, duration: 0.3, ease: "power2.out" })
        mainTl.to({}, { duration: 0.3 })
        mainTl.to(tools, { opacity: 1, duration: 0.3 })
        mainTl.to(mechanic, { y: -10, duration: 0.2, repeat: 4, yoyo: true, ease: "power2.inOut" })
        mainTl.to(mechanic, { x: -25, duration: 0.3, ease: "power2.inOut" })
        mainTl.to(mechanic, { y: -20, duration: 0.15, repeat: 6, yoyo: true, ease: "power2.inOut" })
        mainTl.to(smoke, { opacity: 0, duration: 0.6 }, "-=0.2")
        mainTl.to(mechanic, { y: 0, x: 0, duration: 0.4, ease: "power2.out" })
        mainTl.to(hood, { rotation: 0, duration: 0.5, ease: "power2.out" })
        mainTl.to(tools, { opacity: 0, duration: 0.3 }, "-=0.3")
        mainTl.to(payment, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" })
        mainTl.to({}, { duration: 1.5 })
        mainTl.to(payment, { opacity: 0, scale: 0, duration: 0.3 })
        mainTl.to(success, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" })
        mainTl.to({}, { duration: 1 })
        mainTl.to(success, { opacity: 0, scale: 0, duration: 0.3 })
        mainTl.to([helper, mechanic], { opacity: 0, x: -200, duration: 1, ease: "power2.in", stagger: 0.1 })
        mainTl.to(man, { opacity: 0, x: -50, duration: 0.8, ease: "power2.in" }, "-=0.5")

        const driveAwayDistance = size.width + 400
        mainTl.to(car, { x: driveAwayDistance, duration: 2, ease: "power2.in" })

        const wheelTl = gsap.timeline({ repeat: -1 })
        wheelTl.to([wheel1, wheel2], { rotation: 360, duration: 0.5, ease: "none", transformOrigin: "center" })

        const bounceTl = gsap.timeline({ repeat: -1 })
        bounceTl.to(car, { y: -3 * scale, duration: 0.4, repeat: -1, yoyo: true, ease: "power2.inOut" })

        const roadDashes = road.querySelectorAll(".road-dash")
        const roadTl = gsap.timeline({ repeat: -1 })
        roadTl.to(roadDashes, { x: -100, duration: 1, ease: "none", stagger: 0.1 })

        wheelTlRef.current = wheelTl
        bounceTlRef.current = bounceTl
        roadTlRef.current = roadTl

        mainTl.timeScale(speed)
        wheelTl.timeScale(speed)
        bounceTl.timeScale(speed)
        roadTl.timeScale(speed)

        if (isPlaying) {
            mainTl.play()
            wheelTl.play()
            bounceTl.play()
            roadTl.play()
        } else {
            mainTl.pause()
            wheelTl.pause()
            bounceTl.pause()
            roadTl.pause()
        }

        return () => {
            mainTl.kill()
            wheelTl.kill()
            bounceTl.kill()
            roadTl.kill()
            mainTlRef.current = null
            wheelTlRef.current = null
            bounceTlRef.current = null
            roadTlRef.current = null
        }
    }, [size.width, speed, isPlaying])

    useEffect(() => {
        if (mainTlRef.current) mainTlRef.current.timeScale(speed)
        if (wheelTlRef.current) wheelTlRef.current.timeScale(speed)
        if (bounceTlRef.current) bounceTlRef.current.timeScale(speed)
        if (roadTlRef.current) roadTlRef.current.timeScale(speed)
    }, [speed])

    const togglePlayPause = useCallback(() => setIsPlaying((p) => !p), [])
    const handleSpeedChange = useCallback((value) => setSpeed(value), [])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
    }

    const offsets = {
        car: -100,
        man: 120,
        helper: 200,
        mechanic: 160,
        speech: 80,
        helperBubble: 160,
        mechanicBubble: 120,
        phone: 100,
        miniMap: -120,
        chat: 140,
        payment: -100,
        success: -80,
        smoke: 20,
        tools: 180,
    }

    return (
        <section className="w-full py-20 bg-gradient-to-b from-background to-secondary/20 dark:from-slate-950 dark:to-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground dark:text-white mb-4">
                        Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Journey</span>{" "}
                        with FixOnTheGo
                    </h2>
                    <p className="text-lg text-muted-foreground dark:text-slate-300 max-w-2xl mx-auto">
                        Watch how we transform your vehicle emergency into a seamless, stress-free experience
                    </p>
                </div>

                {/* Animation Container */}
                <div className="relative w-full min-h-[70vh] bg-gradient-to-b from-blue-400 to-blue-600 dark:from-blue-900 dark:to-blue-800 overflow-hidden rounded-2xl shadow-2xl">
                    {/* Controls */}
                    <div className="absolute top-4 left-4 z-40 flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded p-2">
                        <button
                            onClick={togglePlayPause}
                            className="px-3 py-1 rounded bg-white dark:bg-slate-700 shadow text-sm font-medium"
                        >
                            {isPlaying ? "Pause" : "Play"}
                        </button>
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-foreground dark:text-white">Speed</label>
                            <input
                                aria-label="animation-speed"
                                type="range"
                                min={0.25}
                                max={2}
                                step={0.25}
                                value={speed}
                                onChange={(e) => handleSpeedChange(Number(e.target.value))}
                                className="w-20"
                            />
                        </div>
                    </div>

                    {/* Sky elements */}
                    <div className="absolute top-[4%] left-[6%] w-12 h-6 bg-white rounded-full opacity-80"></div>
                    <div className="absolute top-[8%] left-[12%] w-10 h-5 bg-white rounded-full opacity-60"></div>
                    <div className="absolute top-[3%] right-[12%] w-16 h-8 bg-white rounded-full opacity-70"></div>
                    <div className="absolute top-[10%] right-[6%] w-12 h-6 bg-white rounded-full opacity-50"></div>
                    <div className="absolute top-6 right-6 w-12 h-12 bg-yellow-300 rounded-full shadow-lg" />

                    {/* Road */}
                    <div
                        ref={roadRef}
                        className="absolute bottom-0 w-full h-28 md:h-32 bg-gray-700 flex items-center justify-center"
                    >
                        {Array.from({ length: Math.ceil(size.width / 80) }).map((_, i) => (
                            <div
                                key={i}
                                className="road-dash absolute w-10 md:w-12 h-1 md:h-2 bg-yellow-300 rounded"
                                style={{ left: `${i * 90}px`, top: "50%" }}
                            />
                        ))}
                    </div>

                    {/* Grass */}
                    <div className="absolute bottom-28 md:bottom-32 w-full h-16 bg-green-400"></div>

                    {/* Smoke */}
                    <div
                        ref={smokeRef}
                        className="absolute bottom-36 md:bottom-40 opacity-0"
                        style={{ left: `calc(50% + ${offsets.smoke}px)` }}
                    >
                        <div className="w-6 h-6 bg-gray-400 rounded-full opacity-60 animate-pulse"></div>
                        <div className="w-4 h-4 bg-gray-300 rounded-full opacity-40 animate-pulse -mt-3 ml-3"></div>
                        <div className="w-3 h-3 bg-gray-200 rounded-full opacity-30 animate-pulse -mt-2 ml-1"></div>
                    </div>

                    {/* Tools */}
                    <div
                        ref={toolsRef}
                        className="absolute bottom-32 md:bottom-36 opacity-0"
                        style={{ left: `calc(50% + ${offsets.tools}px)` }}
                    >
                        <div className="flex gap-2">
                            <div className="w-2 h-6 md:w-3 md:h-8 bg-gray-600 rounded animate-bounce" />
                            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                            <div className="w-1 md:w-2 h-5 bg-gray-700 rounded animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                    </div>

                    {/* Car SVG */}
                    <svg
                        ref={carRef}
                        width={200}
                        height={120}
                        viewBox="0 0 200 120"
                        className="absolute z-10"
                        style={{
                            left: `calc(50% + ${offsets.car}px)`,
                            bottom: "32px",
                            transform: `translateY(-20px) scale(${scale})`,
                            transformOrigin: "center bottom",
                        }}
                    >
                        <rect x="20" y="60" width="140" height="40" rx="8" fill="#e74c3c" stroke="#c0392b" strokeWidth="2" />
                        <rect x="40" y="40" width="100" height="25" rx="12" fill="#e74c3c" stroke="#c0392b" strokeWidth="2" />
                        <rect x="45" y="45" width="35" height="15" rx="3" fill="#87ceeb" opacity="0.8" />
                        <rect x="100" y="45" width="35" height="15" rx="3" fill="#87ceeb" opacity="0.8" />
                        <circle cx="165" cy="70" r="8" fill="#fff" stroke="#ddd" strokeWidth="1" />
                        <circle cx="165" cy="70" r="5" fill="#ffeb3b" />
                        <circle cx="25" cy="70" r="6" fill="#ff5722" />
                        <rect
                            ref={hoodRef}
                            x="100"
                            y="40"
                            width="60"
                            height="25"
                            rx="8"
                            fill="#e74c3c"
                            stroke="#c0392b"
                            strokeWidth="2"
                        />
                        <g opacity="0.8">
                            <rect x="110" y="45" width="40" height="15" rx="3" fill="#2c3e50" />
                            <rect x="115" y="48" width="8" height="8" rx="2" fill="#34495e" />
                            <rect x="127" y="48" width="8" height="8" rx="2" fill="#34495e" />
                            <rect x="139" y="48" width="8" height="8" rx="2" fill="#34495e" />
                        </g>
                        <circle ref={wheel1Ref} cx="50" cy="100" r="15" fill="#2c3e50" stroke="#34495e" strokeWidth="3" />
                        <circle cx="50" cy="100" r="8" fill="#7f8c8d" />
                        <circle cx="50" cy="100" r="3" fill="#bdc3c7" />
                        <circle ref={wheel2Ref} cx="130" cy="100" r="15" fill="#2c3e50" stroke="#34495e" strokeWidth="3" />
                        <circle cx="130" cy="100" r="8" fill="#7f8c8d" />
                        <circle cx="130" cy="100" r="3" fill="#bdc3c7" />
                        <g transform="translate(50,100)">
                            <line x1="-6" y1="0" x2="6" y2="0" stroke="#34495e" strokeWidth="2" />
                            <line x1="0" y1="-6" x2="0" y2="6" stroke="#34495e" strokeWidth="2" />
                        </g>
                        <g transform="translate(130,100)">
                            <line x1="-6" y1="0" x2="6" y2="0" stroke="#34495e" strokeWidth="2" />
                            <line x1="0" y1="-6" x2="0" y2="6" stroke="#34495e" strokeWidth="2" />
                        </g>
                        <circle cx="120" cy="75" r="2" fill="#c0392b" />
                        <rect x="15" y="85" width="150" height="5" rx="2" fill="#c0392b" />
                    </svg>

                    {/* Man SVG */}
                    <svg
                        ref={manRef}
                        width={60}
                        height={80}
                        viewBox="0 0 60 80"
                        className="absolute z-20 opacity-0"
                        style={{
                            left: `calc(50% + ${offsets.man}px)`,
                            bottom: "32px",
                            transform: `translateY(-20px) scale(${scale})`,
                            transformOrigin: "center bottom",
                        }}
                    >
                        <g className="man-head">
                            <circle cx="30" cy="18" r="11" fill="#f7c6b7" />
                            <path d="M21 15 Q30 8 39 15 Q36 12 30 12 Q24 12 21 15" fill="#6b4226" />
                            <circle cx="26" cy="18" r="1.2" fill="#111827" />
                            <circle cx="34" cy="18" r="1.2" fill="#111827" />
                            <path d="M24 15 Q26 13 28 15" stroke="#5b4a3c" strokeWidth="0.8" fill="none" />
                            <path d="M36 15 Q34 13 32 15" stroke="#5b4a3c" strokeWidth="0.8" fill="none" />
                            <path d="M26 23 Q30 25 34 23" stroke="#5b4a3c" strokeWidth="0.9" fill="none" strokeLinecap="round" />
                        </g>
                        <rect x="27" y="29" width="6" height="4" rx="1" fill="#f7c6b7" />
                        <g className="man-torso">
                            <rect x="16" y="34" width="28" height="30" rx="6" fill="#4a5568" />
                            <rect x="22" y="38" width="16" height="10" rx="2" fill="#94a3b8" />
                            <rect x="36" y="44" width="6" height="6" rx="1" fill="#374151" />
                        </g>
                        <g className="man-arm-left" transform="translate(14,36)">
                            <rect x="0" y="0" width="6" height="18" rx="3" fill="#f7c6b7" />
                            <circle cx="3" cy="20" r="2" fill="#d1d5db" />
                            <g className="man-forearm-left" transform="translate(-1,20)">
                                <rect x="0" y="0" width="6" height="16" rx="3" fill="#f7c6b7" />
                                <g className="man-hand-left" transform="translate(-1,14)">
                                    <ellipse cx="4" cy="4" rx="3.2" ry="2.2" fill="#f7c6b7" />
                                </g>
                            </g>
                        </g>
                        <g className="man-arm-right" transform="translate(40,36)">
                            <rect x="0" y="0" width="6" height="18" rx="3" fill="#f7c6b7" />
                            <circle cx="3" cy="20" r="2" fill="#d1d5db" />
                            <g className="man-forearm-right" transform="translate(0,20)">
                                <rect x="0" y="0" width="6" height="16" rx="3" fill="#f7c6b7" />
                                <g className="man-hand-right" transform="translate(-1,14)">
                                    <ellipse cx="4" cy="4" rx="3.2" ry="2.2" fill="#f7c6b7" />
                                </g>
                            </g>
                        </g>
                        <g className="man-legs">
                            <g transform="translate(22,64)">
                                <rect x="0" y="0" width="6" height="14" rx="2" fill="#2d3748" />
                                <rect x="0" y="12" width="6" height="4" rx="1.5" fill="#0f172a" />
                            </g>
                            <g transform="translate(32,64)">
                                <rect x="0" y="0" width="6" height="14" rx="2" fill="#2d3748" />
                                <rect x="0" y="12" width="6" height="4" rx="1.5" fill="#0f172a" />
                            </g>
                        </g>
                        <g opacity="0.08" fill="#fff">
                            <ellipse cx="34" cy="46" rx="5" ry="2" />
                        </g>
                    </svg>

                    {/* Helper SVG */}
                    <svg
                        ref={helperRef}
                        width={60}
                        height={80}
                        viewBox="0 0 60 80"
                        className="absolute z-20 opacity-0"
                        style={{
                            left: `calc(50% + ${offsets.helper}px)`,
                            bottom: "32px",
                            transform: `translateY(-20px) scale(${scale})`,
                            transformOrigin: "center bottom",
                        }}
                    >
                        <g className="helper-head">
                            <circle cx="30" cy="18" r="11" fill="#f7c6b7" />
                            <path d="M20 14 Q30 6 40 14 Q38 12 30 10 Q22 12 20 14" fill="#2b2f81" />
                            <circle cx="26" cy="18" r="1.1" fill="#111827" />
                            <circle cx="34" cy="18" r="1.1" fill="#111827" />
                            <path d="M26 23 Q30 26 34 23" stroke="#0f172a" strokeWidth="0.8" fill="none" strokeLinecap="round" />
                        </g>
                        <rect x="27" y="29" width="6" height="4" rx="1" fill="#f7c6b7" />
                        <g className="helper-torso">
                            <rect x="16" y="34" width="28" height="30" rx="6" fill="#2563eb" />
                            <rect x="22" y="38" width="16" height="10" rx="2" fill="#bfdbfe" />
                            <rect x="44" y="42" width="4" height="8" rx="1" fill="#1e40af" />
                        </g>
                        <g className="helper-arm-left" transform="translate(38,36)">
                            <rect x="0" y="0" width="6" height="18" rx="3" fill="#f7c6b7" />
                            <circle cx="3" cy="20" r="2" fill="#d1d5db" />
                            <g className="helper-forearm-left" transform="translate(0,20)">
                                <rect x="0" y="0" width="6" height="16" rx="3" fill="#f7c6b7" />
                                <g className="helper-hand-left" transform="translate(-2,12)">
                                    <ellipse cx="6" cy="4" rx="3.2" ry="2.2" fill="#f7c6b7" />
                                    <g className="helper-phone" transform="translate(8,-4)">
                                        <rect x="0" y="0" width="12" height="20" rx="2" fill="#0f172a" />
                                        <rect x="2" y="2" width="8" height="16" rx="1" fill="#fff" opacity="0.06" />
                                    </g>
                                </g>
                            </g>
                        </g>
                        <g className="helper-arm-right" transform="translate(14,36)">
                            <rect x="0" y="0" width="6" height="18" rx="3" fill="#f7c6b7" />
                            <circle cx="3" cy="20" r="2" fill="#d1d5db" />
                            <g className="helper-forearm-right" transform="translate(-1,20)">
                                <rect x="0" y="0" width="6" height="16" rx="3" fill="#f7c6b7" />
                                <g className="helper-hand-right" transform="translate(-1,14)">
                                    <ellipse cx="4" cy="4" rx="3.2" ry="2.2" fill="#f7c6b7" />
                                </g>
                            </g>
                        </g>
                        <g className="helper-legs">
                            <g transform="translate(22,64)">
                                <rect x="0" y="0" width="6" height="14" rx="2" fill="#1e40af" />
                                <rect x="0" y="12" width="6" height="4" rx="1.5" fill="#0f172a" />
                            </g>
                            <g transform="translate(32,64)">
                                <rect x="0" y="0" width="6" height="14" rx="2" fill="#1e40af" />
                                <rect x="0" y="12" width="6" height="4" rx="1.5" fill="#0f172a" />
                            </g>
                        </g>
                        <g opacity="0.08" fill="#fff">
                            <ellipse cx="28" cy="46" rx="5" ry="2" />
                        </g>
                    </svg>

                    {/* Mechanic SVG */}
                    <svg
                        ref={mechanicRef}
                        width={80}
                        height={120}
                        viewBox="0 0 80 120"
                        className="absolute z-20 opacity-0"
                        style={{
                            left: `calc(50% + ${offsets.mechanic}px)`,
                            bottom: "32px",
                            transform: `translateY(-20px) scale(${scale})`,
                            transformOrigin: "center bottom",
                        }}
                    >
                        <g className="mechanic-head">
                            <circle cx="40" cy="22" r="12" fill="#fdbcb4" />
                            <ellipse cx="40" cy="26" rx="6" ry="2" fill="#000" opacity="0.06" />
                            <circle cx="36" cy="20" r="1.2" fill="#000" />
                            <circle cx="44" cy="20" r="1.2" fill="#000" />
                            <path d="M34 25 Q40 29 46 25" fill="none" stroke="#6b7280" strokeWidth="1" strokeLinecap="round" />
                            <path d="M27 15 Q40 8 53 15 L53 18 Q40 12 27 18 Z" fill="#0f172a" />
                            <rect x="26" y="15" width="28" height="4" rx="2" fill="#0f172a" />
                        </g>
                        <rect x="36" y="34" width="8" height="4" rx="1" fill="#fdbcb4" />
                        <g className="mechanic-torso">
                            <rect x="22" y="38" width="36" height="36" rx="8" fill="#059669" stroke="#047857" strokeWidth="1" />
                            <rect x="46" y="46" width="8" height="8" rx="1.2" fill="#047857" />
                            <path d="M32 50 L40 50" stroke="#06b6d4" strokeWidth="1" strokeLinecap="round" />
                            <rect x="18" y="68" width="44" height="8" rx="4" fill="#8b4513" />
                            <rect x="26" y="70" width="6" height="6" rx="1" fill="#6b7280" />
                            <rect x="36" y="70" width="6" height="6" rx="1" fill="#6b7280" />
                            <rect x="46" y="70" width="6" height="6" rx="1" fill="#6b7280" />
                        </g>
                        <g className="arm-left" transform="translate(20,46)">
                            <rect className="upper-arm-left" x="0" y="0" width="8" height="18" rx="4" fill="#fdbcb4" />
                            <circle cx="4" cy="20" r="2" fill="#d1d5db" />
                            <g className="forearm-left" transform="translate(-2,20)">
                                <rect x="0" y="0" width="6" height="18" rx="4" fill="#fdbcb4" />
                                <g className="hand-left" transform="translate(-1,16)">
                                    <ellipse cx="4" cy="5" rx="3.5" ry="2.5" fill="#fdbcb4" />
                                </g>
                            </g>
                        </g>
                        <g className="arm-right" transform="translate(52,46)">
                            <rect className="upper-arm-right" x="0" y="0" width="8" height="18" rx="4" fill="#fdbcb4" />
                            <circle cx="4" cy="20" r="2" fill="#d1d5db" />
                            <g className="forearm-right" transform="translate(0,20)">
                                <rect x="0" y="0" width="6" height="18" rx="4" fill="#fdbcb4" />
                                <g className="hand-right" transform="translate(-2,16)">
                                    <ellipse cx="6" cy="4" rx="3.2" ry="2.2" fill="#fdbcb4" />
                                    <rect x="2" y="0" width="6" height="3" rx="1" fill="#059669" />
                                    <g transform="translate(8,-2) rotate(-25 0 0)">
                                        <rect x="0" y="2" width="14" height="3" rx="1.2" fill="#9ca3af" />
                                        <circle cx="14" cy="3.5" r="3.2" fill="#9ca3af" />
                                        <path d="M14 2 L18 0" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" />
                                    </g>
                                </g>
                            </g>
                        </g>
                        <g className="legs">
                            <g transform="translate(26,84)">
                                <rect x="0" y="0" width="8" height="22" rx="3" fill="#064e3b" />
                                <rect x="0" y="20" width="8" height="6" rx="2" fill="#111827" />
                            </g>
                            <g transform="translate(46,84)">
                                <rect x="0" y="0" width="8" height="22" rx="3" fill="#064e3b" />
                                <rect x="0" y="20" width="8" height="6" rx="2" fill="#111827" />
                            </g>
                        </g>
                        <g opacity="0.12" fill="#fff">
                            <ellipse cx="38" cy="46" rx="6" ry="3" />
                        </g>
                    </svg>

                    {/* Speech bubbles and UI elements */}
                    <div
                        ref={speechBubbleRef}
                        className="absolute bottom-80 bg-white dark:bg-slate-800 rounded-lg p-3 shadow-lg opacity-0 z-30"
                        style={{ left: `calc(50% + ${offsets.speech}px)` }}
                    >
                        <div className="text-sm font-medium text-gray-800 dark:text-white whitespace-nowrap">
                            Help! My car broke down! 🚗💨
                        </div>
                    </div>

                    <div
                        ref={helperBubbleRef}
                        className="absolute bottom-80 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3 shadow-lg opacity-0 z-30"
                        style={{ left: `calc(50% + ${offsets.helperBubble}px)` }}
                    >
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-100 whitespace-nowrap">
                            Try FixOnTheGo app! 📱✨
                        </div>
                    </div>

                    <div
                        ref={mechanicBubbleRef}
                        className="absolute bottom-80 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-3 shadow-lg opacity-0 z-30"
                        style={{ left: `calc(50% + ${offsets.mechanicBubble}px)` }}
                    >
                        <div className="text-sm font-medium text-green-800 dark:text-green-100 whitespace-nowrap">
                            I'll fix it right away! 🔧
                        </div>
                    </div>

                    <div
                        ref={phoneRef}
                        className="absolute bottom-60 bg-gray-900 dark:bg-slate-950 rounded-lg p-4 shadow-xl opacity-0 z-30"
                        style={{ left: `calc(50% + ${offsets.phone}px)` }}
                    >
                        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 w-32">
                            <div className="text-center mb-2">
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">FixOnTheGo</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">🔧 Roadside Assistance</div>
                            </div>
                            <div className="bg-green-500 text-white text-xs text-center py-2 rounded">Mechanic Booked! ✅</div>
                            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 text-center">Connecting to GPS...</div>
                        </div>
                    </div>

                    <div
                        ref={miniMapRef}
                        className="absolute bottom-40 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-2xl opacity-0 z-30 border-2 border-gray-300 dark:border-slate-600"
                        style={{ left: `calc(50% + ${offsets.miniMap}px)` }}
                    >
                        <div className="w-48 h-40">
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-bold text-gray-800 dark:text-white">📍 Live Tracking</div>
                                <div className="text-xs text-green-600 dark:text-green-400 font-medium">● LIVE</div>
                            </div>
                            <div className="relative w-full h-24 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg border overflow-hidden">
                                <div className="absolute top-4 left-0 w-full h-1 bg-gray-400"></div>
                                <div className="absolute top-8 left-0 w-full h-1 bg-gray-400"></div>
                                <div className="absolute top-12 left-0 w-full h-1 bg-gray-400"></div>
                                <div className="absolute top-16 left-0 w-full h-1 bg-gray-400"></div>
                                <div className="absolute top-1 left-2 w-2 h-2 bg-gray-600 rounded-sm"></div>
                                <div className="absolute top-5 left-10 w-3 h-2 bg-gray-600 rounded-sm"></div>
                                <div className="absolute top-1 left-18 w-2 h-3 bg-gray-600 rounded-sm"></div>
                                <div className="absolute top-14 left-4 w-2 h-2 bg-gray-600 rounded-sm"></div>
                                <div className="absolute top-16 left-32 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                </div>
                                <div className="absolute top-20 left-30 text-xs text-red-600 font-bold whitespace-nowrap">You</div>
                                <div
                                    ref={mechanicDotRef}
                                    className="absolute top-2 left-4 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-100"
                                >
                                    <div className="w-1 h-1 bg-white rounded-full" />
                                </div>
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                    <path
                                        d="M 16 8 Q 24 12 Q 32 16 Q 40 20 L 128 64"
                                        stroke="#3b82f6"
                                        strokeWidth="2"
                                        strokeDasharray="4,2"
                                        fill="none"
                                        opacity="0.7"
                                    />
                                </svg>
                            </div>
                            <div className="mt-3 space-y-1">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-600 dark:text-gray-300">🔧 Mechanic</div>
                                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{mechanicDistance} km away</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-600 dark:text-gray-300">⏱️ ETA</div>
                                    <div className="text-xs font-bold text-green-600 dark:text-green-400">{formatTime(mechanicETA)}</div>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5 mt-2">
                                    <div
                                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.max(10, 100 - (mechanicDistance / 2.5) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        ref={chatRef}
                        className="absolute bottom-40 bg-white dark:bg-slate-800 rounded-lg shadow-2xl opacity-0 z-30 border border-gray-300 dark:border-slate-600"
                        style={{ left: `calc(50% + ${offsets.chat}px)` }}
                    >
                        <div className="w-64 md:w-80 h-96">
                            <div className="bg-blue-600 dark:bg-blue-700 text-white p-3 rounded-t-lg flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">M</div>
                                <div>
                                    <div className="font-semibold text-sm">Mike - Mechanic</div>
                                    <div className="text-xs opacity-90">⭐ 4.9 • 127 repairs</div>
                                </div>
                                <div className="ml-auto">
                                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                                </div>
                            </div>
                            <div className="p-3 h-80 overflow-y-auto bg-gray-50 dark:bg-slate-700">
                                <div className="space-y-3">
                                    {chatMessages.slice(0, visibleMessages).map((msg, index) => (
                                        <div key={index} className={`flex ${msg.sender === "customer" ? "justify-end" : "justify-start"}`}>
                                            <div
                                                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${msg.sender === "customer" ? "bg-blue-500 text-white rounded-br-sm" : "bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 text-gray-800 dark:text-white rounded-bl-sm"}`}
                                            >
                                                <div>{msg.message}</div>
                                                <div
                                                    className={`text-xs mt-1 ${msg.sender === "customer" ? "text-blue-100" : "text-gray-500 dark:text-gray-400"}`}
                                                >
                                                    {msg.time}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {showTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 text-gray-800 dark:text-white rounded-lg rounded-bl-sm px-3 py-2 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <div className="flex gap-1">
                                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                                        <div
                                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: "0.1s" }}
                                                        />
                                                        <div
                                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                            style={{ animationDelay: "0.2s" }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Mike is typing...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        ref={paymentRef}
                        className="absolute bottom-40 bg-white dark:bg-slate-800 rounded-lg shadow-2xl opacity-0 z-30 border border-gray-300 dark:border-slate-600"
                        style={{ left: `calc(50% + ${offsets.payment}px)` }}
                    >
                        <div className="w-64 md:w-80 p-6">
                            <div className="text-center mb-6">
                                <div className="text-2xl font-bold text-gray-800 dark:text-white mb-2">💳 Payment</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">Service completed successfully!</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
                                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Service Details</div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Engine Repair</span>
                                        <span className="font-medium text-gray-800 dark:text-white">$85.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Coolant Replacement</span>
                                        <span className="font-medium text-gray-800 dark:text-white">$25.00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                                        <span className="font-medium text-gray-800 dark:text-white">$15.00</span>
                                    </div>
                                    <div className="border-t border-gray-300 dark:border-slate-600 pt-2 mt-2">
                                        <div className="flex justify-between font-bold">
                                            <span className="text-gray-800 dark:text-white">Total</span>
                                            <span className="text-green-600 dark:text-green-400">$125.00</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-4">
                                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Payment Method</div>
                                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">💳</span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-800 dark:text-white">•••• •••• •••• 4242</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Expires 12/25</div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-lg">
                                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">✓</div>
                                    <span className="text-sm font-medium">Payment Successful</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        ref={successRef}
                        className="absolute bottom-40 bg-white dark:bg-slate-800 rounded-lg shadow-2xl opacity-0 z-30 border border-green-300 dark:border-green-700"
                        style={{ left: `calc(50% + ${offsets.success}px)` }}
                    >
                        <div className="w-64 md:w-72 p-6 text-center">
                            <div className="text-6xl mb-4">🎉</div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">All Done!</div>
                            <div className="text-gray-600 dark:text-gray-300 mb-4">
                                Your car has been successfully repaired and is ready to drive.
                            </div>
                            <div className="mb-4">
                                <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Rate your experience</div>
                                <div className="flex justify-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star} className="text-2xl text-yellow-400">
                                            ⭐
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900 rounded-lg p-3 border border-green-200 dark:border-green-700">
                                <div className="text-sm text-green-800 dark:text-green-100">
                                    <div className="font-semibold">Thank you for using FixOnTheGo!</div>
                                    <div>Drive safely and have a great day! 🚗✨</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {repairStep && (
                        <div
                            className="absolute bottom-80 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 shadow-lg z-30"
                            style={{ left: `calc(50% + ${offsets.speech}px)` }}
                        >
                            <div className="text-sm font-medium text-yellow-800 dark:text-yellow-100 flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                                {repairStep}
                            </div>
                        </div>
                    )}

                    {/* Trees */}
                    <div className="absolute bottom-44 left-6">
                        <div className="w-3 h-14 bg-amber-800"></div>
                        <div className="w-10 h-10 bg-green-600 rounded-full -mt-6 -ml-4" />
                    </div>
                    <div className="absolute bottom-44 right-20">
                        <div className="w-3 h-16 bg-amber-800"></div>
                        <div className="w-12 h-12 bg-green-600 rounded-full -mt-8 -ml-5" />
                    </div>
                </div>
            </div>
        </section>
    )
}
