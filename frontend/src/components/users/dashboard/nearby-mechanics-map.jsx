"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Button } from "../../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { 
  MapPin, 
  Navigation, 
  Loader2, 
  User, 
  Star, 
  Clock,
  Wrench,
  Phone,
  RefreshCw,
  Circle
} from "lucide-react"
import { useSelector } from "react-redux"
import { toast } from "sonner"
import io from "socket.io-client"

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"

export function NearbyMechanicsMap({ 
  onMechanicSelect, 
  selectedMechanic, 
  showSelection = false,
  height = 400 
}) {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef({})
  const userMarkerRef = useRef(null)
  const socketRef = useRef(null)

  const [mechanics, setMechanics] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [connected, setConnected] = useState(false)

  const { coordinates } = useSelector((state) => state.location)
  const { user } = useSelector((state) => state.auth)

  // Initialize socket connection for real-time updates
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
    })

    socketRef.current.on("connect", () => {
      setConnected(true)
      if (user?._id) {
        socketRef.current.emit("authenticate", user._id)
      }
    })

    socketRef.current.on("disconnect", () => {
      setConnected(false)
    })

    // Listen for mechanic location updates
    socketRef.current.on("mechanic-location-changed", (data) => {
      updateMechanicMarker(data)
    })

    socketRef.current.on("nearby-mechanics-list", (data) => {
      if (data.mechanics) {
        // Transform the nested data structure to match what the component expects
        const mappedMechanics = data.mechanics.map(m => ({
          _id: m.mechanicId,
          name: m.name,
          profileImage: m.profileImage,
          location: { coordinates: m.coordinates },
          isOnline: m.isOnline,
          distanceKm: m.distanceKm,
          lastSeen: m.lastSeen,
          profile: m.profile
        }));
        setMechanics(mappedMechanics);
        setLoading(false);
      }
    })

    socketRef.current.on("mechanic-offline", (data) => {
      setMechanics(prev => 
        prev.map(m => m._id === data.mechanicId ? { ...m, isOnline: false } : m)
      )
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("stop-watching-mechanics")
        socketRef.current.disconnect()
      }
    }
  }, [user])

  // Load Leaflet CSS
  useEffect(() => {
    if (typeof window === "undefined") return
    if (document.querySelector('link[data-mechanic-map-css]')) return

    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    link.setAttribute("data-mechanic-map-css", "true")
    document.head.appendChild(link)
  }, [])

  // Get user's current location
  useEffect(() => {
    if (coordinates?.lat && coordinates?.lng) {
      setUserLocation({ lat: coordinates.lat, lng: coordinates.lng })
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        },
        (err) => {
          console.warn("Geolocation error:", err)
          // Default to Delhi
          setUserLocation({ lat: 28.6139, lng: 77.209 })
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    }
  }, [coordinates])

  // Fetch nearby mechanics via Socket
  const fetchNearbyMechanics = useCallback(() => {
    if (!userLocation || !socketRef.current?.connected) return

    setRefreshing(true)
    socketRef.current.emit("watch-nearby-mechanics", {
      lat: userLocation.lat,
      lng: userLocation.lng,
      radius: 10000,
    })
    
    // Set a timeout to stop the refreshing state if socket doesn't respond quickly
    setTimeout(() => {
      setRefreshing(false)
      setLoading(false)
    }, 2000)
  }, [userLocation])

  useEffect(() => {
    if (userLocation && connected) {
      fetchNearbyMechanics()
    }
  }, [userLocation, connected, fetchNearbyMechanics])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !userLocation) return

    import("leaflet").then((L) => {
      if (mapRef.current) return

      mapRef.current = L.map(mapContainer.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 14,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current)

      // User marker (blue)
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="
            width: 24px; 
            height: 24px; 
            background: #3b82f6; 
            border-radius: 50%; 
            border: 3px solid white; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapRef.current)
        .bindPopup("📍 Your Location")

      // Add 10km radius circle
      L.circle([userLocation.lat, userLocation.lng], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        radius: 10000, // 10km
        weight: 1,
        dashArray: '5, 5'
      }).addTo(mapRef.current)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [userLocation])

  // Update mechanic markers
  const updateMechanicMarker = useCallback((mechanicData) => {
    if (!mapRef.current) return

    import("leaflet").then((L) => {
      const { mechanicId, name, coordinates, isOnline } = mechanicData
      const [lng, lat] = coordinates || []
      
      if (!lat || !lng) return

      // Remove old marker if exists
      if (markersRef.current[mechanicId]) {
        mapRef.current.removeLayer(markersRef.current[mechanicId])
      }

      const isSelected = selectedMechanic === mechanicId
      const bgColor = isOnline ? '#22c55e' : '#f59e0b'
      const borderColor = isSelected ? '#3b82f6' : 'white'
      const borderWidth = isSelected ? '4px' : '3px'

      const mechanicIcon = L.divIcon({
        className: 'custom-mechanic-marker',
        html: `
          <div style="
            width: 32px; 
            height: 32px; 
            background: ${bgColor}; 
            border-radius: 50%; 
            border: ${borderWidth} solid ${borderColor}; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          ">
            <span style="font-size: 14px;">🔧</span>
            ${isOnline ? `
              <div style="
                position: absolute;
                bottom: -2px;
                right: -2px;
                width: 10px;
                height: 10px;
                background: #22c55e;
                border-radius: 50%;
                border: 2px solid white;
              "></div>
            ` : ''}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = L.marker([lat, lng], { icon: mechanicIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="min-width: 150px;">
            <strong>🔧 ${name || 'Mechanic'}</strong><br/>
            <span style="color: ${isOnline ? 'green' : 'orange'}; font-size: 12px;">
              ${isOnline ? '● Online' : '○ Offline'}
            </span>
          </div>
        `)

      if (showSelection) {
        marker.on('click', () => {
          if (onMechanicSelect) {
            onMechanicSelect(mechanicId)
          }
        })
      }

      markersRef.current[mechanicId] = marker

      // Update mechanics state
      setMechanics(prev => 
        prev.map(m => 
          m._id === mechanicId 
            ? { ...m, location: { coordinates: [lng, lat] }, isOnline } 
            : m
        )
      )
    })
  }, [selectedMechanic, showSelection, onMechanicSelect])

  // Add markers for all mechanics
  useEffect(() => {
    if (!mapRef.current || mechanics.length === 0) return

    import("leaflet").then((L) => {
      // Clear old markers
      Object.values(markersRef.current).forEach(marker => {
        if (mapRef.current) {
          mapRef.current.removeLayer(marker)
        }
      })
      markersRef.current = {}

      // Add new markers
      mechanics.forEach((mechanic) => {
        const coords = mechanic.location?.coordinates
        if (!coords || coords.length !== 2) return

        const [lng, lat] = coords
        const isOnline = mechanic.isOnline
        const isSelected = selectedMechanic === mechanic._id
        const bgColor = isOnline ? '#22c55e' : '#f59e0b'
        const borderColor = isSelected ? '#3b82f6' : 'white'
        const borderWidth = isSelected ? '4px' : '3px'

        const mechanicIcon = L.divIcon({
          className: 'custom-mechanic-marker',
          html: `
            <div style="
              width: 32px; 
              height: 32px; 
              background: ${bgColor}; 
              border-radius: 50%; 
              border: ${borderWidth} solid ${borderColor}; 
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            ">
              <span style="font-size: 14px;">🔧</span>
              ${isOnline ? `
                <div style="
                  position: absolute;
                  bottom: -2px;
                  right: -2px;
                  width: 10px;
                  height: 10px;
                  background: #22c55e;
                  border-radius: 50%;
                  border: 2px solid white;
                "></div>
              ` : ''}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        const marker = L.marker([lat, lng], { icon: mechanicIcon })
          .addTo(mapRef.current)
          .bindPopup(`
            <div style="min-width: 180px; padding: 5px;">
              <strong>🔧 ${mechanic.name || 'Mechanic'}</strong><br/>
              <span style="color: ${isOnline ? 'green' : 'orange'}; font-size: 12px;">
                ${isOnline ? '● Online' : '○ Offline'}
              </span><br/>
              ${mechanic.distanceKm ? `<span style="font-size: 12px;">📍 ${mechanic.distanceKm} km away</span><br/>` : ''}
              ${mechanic.profile?.rating ? `<span style="font-size: 12px;">⭐ ${mechanic.profile.rating.toFixed(1)} rating</span>` : ''}
            </div>
          `)

        if (showSelection) {
          marker.on('click', () => {
            if (onMechanicSelect) {
              onMechanicSelect(mechanic._id)
            }
          })
        }

        markersRef.current[mechanic._id] = marker
      })
    })
  }, [mechanics, selectedMechanic, showSelection, onMechanicSelect])

  const getInitials = (name) => {
    if (!name) return "M"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                Nearby Mechanics
              </CardTitle>
              <CardDescription>
                Real-time view of mechanics within 10km
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={connected ? "default" : "secondary"} 
                className={`flex items-center gap-1 ${connected ? 'bg-green-100 text-green-700' : ''}`}
              >
                <Circle className={`h-2 w-2 ${connected ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
                {connected ? 'Live' : 'Offline'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchNearbyMechanics}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Map Container */}
          <div 
            ref={mapContainer} 
            style={{ height: `${height}px` }} 
            className="w-full rounded-b-lg relative"
          >
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Loading map...</span>
                </div>
              </div>
            )}
          </div>

          {/* Mechanics List (Horizontal Scroll) */}
          {mechanics.length > 0 && (
            <div className="p-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{mechanics.length} mechanics nearby</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                {mechanics.slice(0, 10).map((mechanic) => (
                  <motion.div
                    key={mechanic._id}
                    whileHover={{ scale: 1.02 }}
                    className={`flex-shrink-0 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedMechanic === mechanic._id 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary' 
                        : 'hover:border-primary/50 hover:bg-accent/50'
                    }`}
                    onClick={() => showSelection && onMechanicSelect?.(mechanic._id)}
                  >
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={mechanic.profileImage} />
                          <AvatarFallback className="bg-green-100 text-green-600 text-sm">
                            {getInitials(mechanic.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          mechanic.isOnline ? 'bg-green-500' : 'bg-orange-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{mechanic.name || 'Mechanic'}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {mechanic.distanceKm || '?'} km
                          </span>
                          {mechanic.profile?.rating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {mechanic.profile.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {mechanic.profile?.specialization && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {mechanic.profile.specialization.slice(0, 2).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                Your Location
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                Online Mechanic
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-orange-400" />
                Offline Mechanic
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default NearbyMechanicsMap
