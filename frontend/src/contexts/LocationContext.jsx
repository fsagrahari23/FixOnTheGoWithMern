import React, { createContext, useContext, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setCoordinates ,setAddress} from "../store/slices/locationSlice";
import { getSocket } from "../../libs/socket";

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.auth?.user?.role);
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const listenersAddedRef = useRef(false);
  const lastLocationRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const formatFallbackAddress = (lat, lng) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
    return `Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`;
  };

  const fetchAddress = async (lat, lng) => {
    const fallbackAddress = formatFallbackAddress(lat, lng);

    if (!navigator.onLine) {
      dispatch(setAddress(fallbackAddress));
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Reverse geocode failed with status ${response.status}`);
      }

      const data = await response.json();
      const address = data.display_name || fallbackAddress;
      dispatch(setAddress(address));
      // console.log("Frontend: Fetched address:", address);
    } catch (error) {
      dispatch(setAddress(fallbackAddress));
    } finally {
      clearTimeout(timeoutId);
    }
  };

  useEffect(() => {
    socketRef.current = getSocket(); // singleton from lib
    const socket = socketRef.current;

    if (!listenersAddedRef.current) {
      socket.on("connect", () => console.log("Frontend: Connected"));
      socket.on("disconnect", () => console.log("Frontend: Disconnected"));
      socket.on("mechanic-location", (data) =>
        console.log("Frontend: Received mechanic location:", data)
      );
      listenersAddedRef.current = true;
    }

    if (!watchIdRef.current && navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const now = Date.now();

          // Only update if moved > 50 meters or > 30 seconds passed
          if (lastLocationRef.current) {
            const distance = calculateDistance(
              lastLocationRef.current.lat, 
              lastLocationRef.current.lng, 
              latitude, 
              longitude
            );
            const timeDiff = now - lastUpdateTimeRef.current;

            if (distance < 50 && timeDiff < 30000) {
              return; // Ignore small changes
            }
          }

          lastLocationRef.current = { lat: latitude, lng: longitude };
          lastUpdateTimeRef.current = now;

          const coordinates = [longitude, latitude]; // GeoJSON format [lng, lat]
          dispatch(setCoordinates({ lat: latitude, lng: longitude }));

          // Emit location update to server
          if (socket.connected) {
            socket.emit("update-location", { coordinates });
            if (userRole === "mechanic") {
              socket.emit("mechanic-location-update", { coordinates });
            }
            console.log("Frontend: Emitted location update:", coordinates);
          }

          // Reverse geocoding should not block location emits.
          void fetchAddress(latitude, longitude);
        },
        (err) => console.error("Geolocation error:", err),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      // Socket is managed globally, do not disconnect here
    };
  }, [dispatch, userRole]);

  return <LocationContext.Provider value={{ socket: socketRef.current }}>{children}</LocationContext.Provider>;
};
