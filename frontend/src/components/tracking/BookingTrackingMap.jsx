import { useEffect, useState, useCallback } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons which skip loading in some build environments
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function FitBounds({ points = [] }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    if (points.length === 1) {
      if (points[0]) map.setView(points[0], 15);
      return;
    }

    const validPoints = points.filter(p => p && Array.isArray(p) && p.length === 2 && !isNaN(p[0]) && !isNaN(p[1]));
    if (validPoints.length > 0) {
      map.fitBounds(validPoints, { padding: [40, 40] });
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

  const userLatLng = toLatLng(userCoordinates);
  const mechanicLatLng = toLatLng(mechanicCoordinates);

  const fetchRoute = useCallback(async (start, end) => {
    if (!start || !end) return;
    
    setIsLoadingRoute(true);
    try {
      // OSRM coordinates are in [lng, lat] format
      const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.routes && data.routes[0]) {
        // Convert GeoJSON coordinates [lng, lat] to Leaflet [lat, lng]
        const points = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
        setRoutePoints(points);
      }
    } catch (error) {
      console.error("Failed to fetch route:", error);
    } finally {
      setIsLoadingRoute(false);
    }
  }, []);

  useEffect(() => {
    if (userLatLng && mechanicLatLng) {
      fetchRoute(userLatLng, mechanicLatLng);
    } else {
      setRoutePoints([]);
    }
  }, [userLatLng?.[0], userLatLng?.[1], mechanicLatLng?.[0], mechanicLatLng?.[1], fetchRoute]);

  // Use historical path if provided, else use live route, else use direct line
  const linePoints = routePoints.length > 0 
    ? routePoints 
    : (pathCoordinates.length > 0 
        ? pathCoordinates.map(p => toLatLng(p)).filter(Boolean)
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
      
      {isLoadingRoute && (
        <div className="absolute bottom-2 left-2 z-[1000] px-2 py-1 bg-white/80 dark:bg-slate-800/80 rounded text-[10px] font-medium animate-pulse">
          Calculating route...
        </div>
      )}
    </div>
  );
}
