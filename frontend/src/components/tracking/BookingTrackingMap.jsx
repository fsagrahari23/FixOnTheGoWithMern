import { useEffect } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function FitBounds({ points = [] }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }

    map.fitBounds(points, { padding: [40, 40] });
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
  const userLatLng = toLatLng(userCoordinates);
  const mechanicLatLng = toLatLng(mechanicCoordinates);

  const pathLatLng = pathCoordinates
    .map((point) => toLatLng(point))
    .filter(Boolean);

  const linePoints =
    pathLatLng.length > 1
      ? pathLatLng
      : [mechanicLatLng, userLatLng].filter(Boolean);

  const fitPoints = [userLatLng, mechanicLatLng, ...pathLatLng].filter(Boolean);

  if (!userLatLng) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
        User location not available for tracking.
      </div>
    );
  }

  return (
    <div className={className || 'h-80 w-full overflow-hidden rounded-xl border border-border'}>
      <MapContainer center={userLatLng} zoom={14} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds points={fitPoints} />

        <Marker position={userLatLng}>
          <Popup>User Location</Popup>
        </Marker>

        {mechanicLatLng && (
          <Marker position={mechanicLatLng}>
            <Popup>Mechanic Live Location</Popup>
          </Marker>
        )}

        {linePoints.length > 1 && (
          <Polyline positions={linePoints} pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.8 }} />
        )}
      </MapContainer>
    </div>
  );
}
