import { useEffect, useRef } from "react";
import 'leaflet/dist/leaflet.css';

// Reusable MapPicker used by dashboard and profile pages.
// Props:
// - center: { lat, lng } optional initial center
// - onChange: (coords) called when marker moved or map selection changes
// - className: optional class for the container
export default function MapPicker({ onChange, center, className }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);

    // init map once
    useEffect(() => {
        let mounted = true;
        import('leaflet').then(L => {
            if (!mounted) return;
            // if we have a previous map instance remove it first
            if (mapInstanceRef.current) {
                try { mapInstanceRef.current.remove(); } catch (e) { /* ignore */ }
                mapInstanceRef.current = null;
            }

            const map = L.map(mapRef.current, { center: [0, 0], zoom: 13 });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '' }).addTo(map);
            mapInstanceRef.current = map;

            const addMarker = (lat, lng, draggable = true) => {
                if (markerRef.current) {
                    try { markerRef.current.remove(); } catch (e) { /* ignore */ }
                    markerRef.current = null;
                }
                const marker = L.marker([lat, lng], { draggable }).addTo(map);
                markerRef.current = marker;
                marker.on('dragend', () => {
                    const p = marker.getLatLng();
                    onChange?.({ lat: p.lat, lng: p.lng });
                });
                // notify initial position
                onChange?.({ lat, lng });
            };

            // If center provided, use it; otherwise try geolocation
            if (center && center.lat && center.lng) {
                map.setView([center.lat, center.lng], 15);
                addMarker(center.lat, center.lng, true);
            } else if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const { latitude, longitude } = pos.coords;
                    map.setView([latitude, longitude], 15);
                    addMarker(latitude, longitude, true);
                }, (err) => {
                    // leave default view
                    console.warn('MapPicker geolocation failed', err);
                }, { enableHighAccuracy: true });
            }

            // ensure tiles render correctly
            setTimeout(() => map.invalidateSize(), 200);
        }).catch(err => console.error('Failed to load leaflet', err));

        return () => {
            mounted = false;
            if (mapInstanceRef.current) {
                try { mapInstanceRef.current.remove(); } catch (e) { /* ignore */ }
                mapInstanceRef.current = null;
            }
            markerRef.current = null;
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // update when center changes
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !center) return;
        try {
            map.setView([center.lat, center.lng], 15);
            if (markerRef.current) {
                markerRef.current.setLatLng([center.lat, center.lng]);
            } else {
                // add marker if none
                import('leaflet').then(L => {
                    const marker = L.marker([center.lat, center.lng], { draggable: true }).addTo(map);
                    markerRef.current = marker;
                    marker.on('dragend', () => {
                        const p = marker.getLatLng();
                        onChange?.({ lat: p.lat, lng: p.lng });
                    });
                }).catch(() => {});
            }
            setTimeout(() => map.invalidateSize(), 150);
        } catch (e) {
            console.warn('MapPicker update center failed', e);
        }
    }, [center, onChange]);

    return <div ref={mapRef} className={className || 'w-full h-64 rounded-lg'} />;
}
