"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Loader2, MapPin } from "lucide-react"

export function LocationMap() {
    const mapContainer = useRef(null)
    const mapRef = useRef(null)
    const markerRef = useRef(null)

    const [address, setAddress] = useState("Use the button to fetch your location")
    const [loading, setLoading] = useState(false)
    const [coordinates, setCoordinates] = useState({ lat: 40.7128, lng: -74.006 })

    // Load Leaflet CSS
    useEffect(() => {
        if (typeof window === "undefined") return
        if (document.querySelector('link[data-leaflet-css]')) return

        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        link.setAttribute("data-leaflet-css", "true")
        document.head.appendChild(link)
    }, [])

    // Initialize map (no click handler)
    useEffect(() => {
        if (!mapContainer.current) return

        import("leaflet").then(L => {
            if (mapRef.current) return

            mapRef.current = L.map(mapContainer.current, {
                center: [coordinates.lat, coordinates.lng],
                zoom: 13,
            })

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
            }).addTo(mapRef.current)

            // initial marker
            markerRef.current = L.marker([coordinates.lat, coordinates.lng])
                .addTo(mapRef.current)
                .bindPopup("Use the button to get your location")
        })

        return () => {
            if (mapRef.current) {
                mapRef.current.remove()
                mapRef.current = null
            }
        }
    }, [])

    // Fetch current location via GPS
    const fetchCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported in your browser")
            return
        }

        setLoading(true)
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude
                const lng = pos.coords.longitude
                setCoordinates({ lat, lng })

                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                    )
                    const data = await res.json()
                    const fetchedAddress = data?.display_name || "Address not found"
                    setAddress(fetchedAddress)

                    // Update marker
                    if (mapRef.current) {
                        if (markerRef.current) mapRef.current.removeLayer(markerRef.current)
                        const L = await import("leaflet")
                        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current).bindPopup(fetchedAddress).openPopup()
                        mapRef.current.setView([lat, lng], 15)
                    }
                } catch (err) {
                    setAddress("Error fetching address. Try again.")
                    console.error(err)
                } finally {
                    setLoading(false)
                }
            },
            (err) => {
                alert("Permission denied or unable to fetch location")
                setLoading(false)
            }
        )
    }

    return (
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="relative rounded-xl">
                {/* Glow border */}
                <div
                    className="absolute -inset-[1px] rounded-xl blur-2xl opacity-80 bg-gradient-to-r
          from-blue-400/40 via-purple-400/30 to-pink-400/30
          dark:from-blue-500/30 dark:via-indigo-500/25 dark:to-purple-600/20"
                    style={{ filter: "blur(18px)" }}
                />

                {/* Glass card */}
                <Card className="relative overflow-hidden rounded-xl border bg-white/20 dark:bg-gray-900/25 backdrop-blur-md border-white/10 shadow-lg">
                    <CardHeader className="pb-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Service Location</CardTitle>
                                <CardDescription>Click the button below to fetch your current location</CardDescription>
                            </div>
                            <div className="p-3 rounded-lg bg-white/20 dark:bg-white/10 border border-white/10">
                                <MapPin className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-4">
                        {/* Map */}
                        <div ref={mapContainer} className="w-full h-80 rounded-lg border border-white/10 overflow-hidden" />

                        {/* Button */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={fetchCurrentLocation}
                                className="px-4 py-2 rounded-lg border bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 text-sm font-medium inline-flex items-center gap-2"
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                <span>Use My Location</span>
                            </button>

                            {/* Address */}
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-white/10 border border-white/10">
                                <p className="text-sm break-words">{address}</p>
                            </motion.div>

                            {/* Coordinates */}
                            <div className="flex gap-2">
                                <Badge variant="outline" className="bg-transparent border-white/20">
                                    Lat: {coordinates.lat.toFixed(4)}
                                </Badge>
                                <Badge variant="outline" className="bg-transparent border-white/20">
                                    Lng: {coordinates.lng.toFixed(4)}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    )
}
