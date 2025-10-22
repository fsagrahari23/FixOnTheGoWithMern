import React, { createContext, useContext, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { setCoordinates ,setAddress} from "../store/slices/locationSlice";
import { getSocket } from "../../libs/socket";

const LocationContext = createContext();

export const useLocation = () => useContext(LocationContext);

export const LocationProvider = ({ children }) => {
  const dispatch = useDispatch();
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const listenersAddedRef = useRef(false);

  const fetchAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const address = data.display_name || "";
      dispatch(setAddress(address));
      console.log("Frontend: Fetched address:", address);
    } catch (error) {
      console.error("Error fetching address:", error);
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
          dispatch(setCoordinates({ lat: latitude, lng: longitude }));
          await fetchAddress(latitude, longitude);
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
  }, [dispatch]);

  return <LocationContext.Provider value={{ socket: socketRef.current }}>{children}</LocationContext.Provider>;
};
