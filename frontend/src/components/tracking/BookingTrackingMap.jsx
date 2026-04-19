import { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const ROUTE_CACHE_KEY = 'booking-tracking-route-cache-v1';
const ROUTE_CACHE_TTL_MS = 5 * 60 * 1000;
const ROUTE_REFRESH_MIN_DISTANCE_M = 20;
const routeMemoryCache = new Map();

const getRouteCacheKey = (start, end) => {
  if (!start || !end) return null;
  return `${start[0].toFixed(5)},${start[1].toFixed(5)}|${end[0].toFixed(5)},${end[1].toFixed(5)}`;
};

const getCachedRoute = (key) => {
  if (!key) return null;

  const now = Date.now();
  const memoryHit = routeMemoryCache.get(key);
  if (memoryHit && now - memoryHit.ts < ROUTE_CACHE_TTL_MS) {
    return memoryHit.points;
  }

  try {
    const raw = sessionStorage.getItem(ROUTE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const storageHit = parsed?.[key];
    if (!storageHit || now - storageHit.ts >= ROUTE_CACHE_TTL_MS) {
      return null;
    }
    routeMemoryCache.set(key, storageHit);
    return storageHit.points;
  } catch {
    return null;
  }
};

const setCachedRoute = (key, points) => {
  if (!key || !Array.isArray(points) || points.length === 0) return;

  const entry = { points, ts: Date.now() };
  routeMemoryCache.set(key, entry);

  try {
    const raw = sessionStorage.getItem(ROUTE_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const next = { ...parsed, [key]: entry };

    // Keep storage bounded by evicting expired entries and limiting total size.
    const keys = Object.keys(next);
    const now = Date.now();
    const freshKeys = keys.filter((cacheKey) => now - next[cacheKey].ts < ROUTE_CACHE_TTL_MS);
    const boundedKeys = freshKeys.slice(-50);
    const bounded = {};
    boundedKeys.forEach((cacheKey) => {
      bounded[cacheKey] = next[cacheKey];
    });

    sessionStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(bounded));
  } catch {
    // Ignore storage failures and keep memory cache functional.
  }
};

const distanceMeters = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return Number.POSITIVE_INFINITY;
  const [lat1, lng1] = a;
  const [lat2, lng2] = b;
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const aHarv = s1 * s1 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * s2 * s2;
  const c = 2 * Math.atan2(Math.sqrt(aHarv), Math.sqrt(1 - aHarv));
  return earthRadius * c;
};

// Fix Leaflet marker icons which skip loading in some build environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function FitBounds({ points = [] }) {
  const map = useMap();
  const didInitialFitRef = useRef(false);

  useEffect(() => {
    if (!points.length || didInitialFitRef.current) return;

    if (points.length === 1) {
      if (points[0]) {
        map.setView(points[0], 15);
        didInitialFitRef.current = true;
      }
      return;
    }

    const validPoints = points.filter(p => p && Array.isArray(p) && p.length === 2 && !isNaN(p[0]) && !isNaN(p[1]));
    if (validPoints.length > 0) {
      map.fitBounds(validPoints, { padding: [40, 40] });
      didInitialFitRef.current = true;
    }
  }, [map, points]);

  return null;
}

const toLatLng = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return null;
  const [lng, lat] = coordinates;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
};

export default function BookingTrackingMap({
  userCoordinates,
  mechanicCoordinates,
  pathCoordinates = [],
  className,
}) {
  const [routePoints, setRoutePoints] = useState([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const lastRouteEndpointsRef = useRef(null);
  const activeRouteRequestRef = useRef(null);

  const userLatLng = toLatLng(userCoordinates);
  const mechanicLatLng = toLatLng(mechanicCoordinates);

  const shouldRefreshRoute = useCallback((start, end) => {
    const previous = lastRouteEndpointsRef.current;
    if (!previous) return true;

    const startMoved = distanceMeters(previous.start, start) >= ROUTE_REFRESH_MIN_DISTANCE_M;
    const endMoved = distanceMeters(previous.end, end) >= ROUTE_REFRESH_MIN_DISTANCE_M;
    return startMoved || endMoved;
  }, []);

  const fetchRoute = useCallback(async (start, end) => {
    if (!start || !end) return;

    const cacheKey = getRouteCacheKey(start, end);
    const cachedPoints = getCachedRoute(cacheKey);
    if (cachedPoints) {
      setRoutePoints(cachedPoints);
      lastRouteEndpointsRef.current = {
        start: [...start],
        end: [...end],
      };
      return;
    }

    if (activeRouteRequestRef.current) {
      activeRouteRequestRef.current.abort();
    }

    const controller = new AbortController();
    activeRouteRequestRef.current = controller;
    
    setIsLoadingRoute(true);
    try {
      // OSRM coordinates are in [lng, lat] format
      const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
      const response = await fetch(url, { signal: controller.signal });
      const data = await response.json();
      
      if (data.routes && data.routes[0]) {
        // Convert GeoJSON coordinates [lng, lat] to Leaflet [lat, lng]
        const points = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRoutePoints(points);
        setCachedRoute(cacheKey, points);
        lastRouteEndpointsRef.current = {
          start: [...start],
          end: [...end],
        };
      }
    } catch (error) {
      if (error?.name === 'AbortError') {
        return;
      }
      console.error("Failed to fetch route:", error);
    } finally {
      if (activeRouteRequestRef.current === controller) {
        activeRouteRequestRef.current = null;
      }
      setIsLoadingRoute(false);
    }
  }, []);

  const livePathPoints = pathCoordinates.map(p => toLatLng(p)).filter(Boolean);

  useEffect(() => {
    // During live tracking, prefer server-provided path to avoid polyline flicker.
    if (livePathPoints.length > 1) {
      return;
    }

    if (userLatLng && mechanicLatLng) {
      if (!shouldRefreshRoute(userLatLng, mechanicLatLng) && routePoints.length > 1) {
        return;
      }
      fetchRoute(userLatLng, mechanicLatLng);
    } else {
      setRoutePoints([]);
      lastRouteEndpointsRef.current = null;
      if (activeRouteRequestRef.current) {
        activeRouteRequestRef.current.abort();
        activeRouteRequestRef.current = null;
      }
    }
  }, [
    userLatLng?.[0],
    userLatLng?.[1],
    mechanicLatLng?.[0],
    mechanicLatLng?.[1],
    livePathPoints.length,
    routePoints.length,
    shouldRefreshRoute,
    fetchRoute,
  ]);

  useEffect(() => {
    return () => {
      if (activeRouteRequestRef.current) {
        activeRouteRequestRef.current.abort();
        activeRouteRequestRef.current = null;
      }
    };
  }, []);

  // Keep a stable priority: live path -> cached/fetched route -> direct line.
  const linePoints = livePathPoints.length > 1
    ? livePathPoints
    : (routePoints.length > 1
      ? routePoints
      : [mechanicLatLng, userLatLng].filter(Boolean));

  const fitPoints = [userLatLng, mechanicLatLng, ...linePoints].filter(Boolean);

  if (!userLatLng) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
        Location not available for tracking.
      </div>
    );
  }

  return (
    <div className={className || 'h-80 w-full overflow-hidden rounded-xl border border-border bg-slate-100 dark:bg-slate-900 shadow-inner'}>
      <MapContainer center={userLatLng} zoom={14} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds points={fitPoints} />

        <Marker position={userLatLng}>
          <Popup>Customer Location</Popup>
        </Marker>

        {mechanicLatLng && (
          <Marker position={mechanicLatLng}>
            <Popup>Mechanic Live Location</Popup>
          </Marker>
        )}

        {linePoints.length > 1 && (
          <Polyline 
            positions={linePoints} 
            pathOptions={{ 
              color: '#3b82f6', 
              weight: 5, 
              opacity: 0.8,
              lineJoin: 'round',
              lineCap: 'round'
            }} 
          />
        )}
      </MapContainer>
      
      {isLoadingRoute && livePathPoints.length <= 1 && (
        <div className="absolute bottom-2 left-2 z-1000 px-2 py-1 bg-white/80 dark:bg-slate-800/80 rounded text-[10px] font-medium animate-pulse">
          Calculating route...
        </div>
      )}
    </div>
  );
}
