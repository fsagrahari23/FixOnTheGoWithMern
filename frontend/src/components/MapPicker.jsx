import { useEffect, useRef } from "react";
import 'leaflet/dist/leaflet.css';

export default function MapPicker({ onChange }) {
    const mapRef = useRef(null);

    useEffect(() => {
        import("leaflet").then(L => {
            const map = L.map(mapRef.current).setView([0, 0], 13);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "" }).addTo(map);

            let marker;

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    const { latitude, longitude } = pos.coords;
                    map.setView([latitude, longitude], 15);
                    marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
                    onChange?.({ lat: latitude, lng: longitude });
                    marker.on('dragend', () => {
                        const p = marker.getLatLng();
                        onChange?.({ lat: p.lat, lng: p.lng });
                    });
                });
            }
        });
    }, [onChange]);

    return <div ref={mapRef} className="w-full h-64 rounded-lg" />;
}
