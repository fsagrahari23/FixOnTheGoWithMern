import { useCallback, useEffect, useRef, useState } from 'react';
import { getSocket } from '../../libs/socket';

const GEO_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 3000,
  timeout: 10000,
};

const areCoordinatesEqual = (a, b) => {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== 2 || b.length !== 2) return false;
  return a[0] === b[0] && a[1] === b[1];
};

const arePathCoordinatesEqual = (a = [], b = []) => {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (!areCoordinatesEqual(a[i], b[i])) return false;
  }
  return true;
};

export function useBookingTracker({ bookingId, isTracking, actorRole, mechanicId = null }) {
  const [trackingData, setTrackingData] = useState({
    userCoordinates: null,
    mechanicCoordinates: null,
    pathCoordinates: [],
    mechanicOnline: false,
  });

  const geoWatchRef = useRef(null);
  const geoEmitIntervalRef = useRef(null);
  const latestActorCoordinatesRef = useRef(null);

  const mergeTrackingPayload = useCallback((payload) => {
    setTrackingData((prev) => {
      const nextUserCoordinates = payload.userCoordinates || prev.userCoordinates;
      const nextMechanicCoordinates = payload.mechanicCoordinates || prev.mechanicCoordinates;
      const nextPathCoordinates = payload.pathCoordinates || prev.pathCoordinates;
      const nextMechanicOnline =
        actorRole === 'user'
          ? (payload.mechanicCoordinates ? true : prev.mechanicOnline)
          : prev.mechanicOnline;

      if (
        areCoordinatesEqual(prev.userCoordinates, nextUserCoordinates) &&
        areCoordinatesEqual(prev.mechanicCoordinates, nextMechanicCoordinates) &&
        arePathCoordinatesEqual(prev.pathCoordinates, nextPathCoordinates) &&
        prev.mechanicOnline === nextMechanicOnline
      ) {
        return prev;
      }

      return {
        ...prev,
        userCoordinates: nextUserCoordinates,
        mechanicCoordinates: nextMechanicCoordinates,
        pathCoordinates: nextPathCoordinates,
        mechanicOnline: nextMechanicOnline,
      };
    });
  }, [actorRole]);

  const setStaticUserCoordinates = useCallback((coordinates) => {
    if (!coordinates) return;
    setTrackingData((prev) => {
      if (areCoordinatesEqual(prev.userCoordinates, coordinates)) return prev;
      return {
        ...prev,
        userCoordinates: coordinates,
      };
    });
  }, []);

  useEffect(() => {
    if (!bookingId || !isTracking) {
      return;
    }

    const socket = getSocket();

    const handleSnapshot = (payload) => {
      if (!payload || String(payload.bookingId) !== String(bookingId)) return;
      mergeTrackingPayload(payload);
    };

    const handleTrackingUpdate = (payload) => {
      if (!payload || String(payload.bookingId) !== String(bookingId)) return;
      mergeTrackingPayload(payload);
    };

    socket.on('booking-tracking-snapshot', handleSnapshot);
    socket.on('booking-tracking-update', handleTrackingUpdate);
    socket.emit('join-booking-tracking', { bookingId });

    return () => {
      socket.emit('leave-booking-tracking', { bookingId });
      socket.off('booking-tracking-snapshot', handleSnapshot);
      socket.off('booking-tracking-update', handleTrackingUpdate);
    };
  }, [bookingId, isTracking, mergeTrackingPayload]);

  useEffect(() => {
    if (actorRole !== 'user' || !bookingId || !isTracking || !mechanicId) {
      return;
    }

    const socket = getSocket();

    const handleAssignedLocation = (payload) => {
      if (!payload || String(payload.bookingId) !== String(bookingId)) return;
      setTrackingData((prev) => {
        const nextMechanicCoordinates = payload.coordinates || prev.mechanicCoordinates;
        const nextUserCoordinates = payload.userCoordinates || prev.userCoordinates;
        const nextPathCoordinates = payload.pathCoordinates || prev.pathCoordinates;
        const nextMechanicOnline = true;

        if (
          areCoordinatesEqual(prev.userCoordinates, nextUserCoordinates) &&
          areCoordinatesEqual(prev.mechanicCoordinates, nextMechanicCoordinates) &&
          arePathCoordinatesEqual(prev.pathCoordinates, nextPathCoordinates) &&
          prev.mechanicOnline === nextMechanicOnline
        ) {
          return prev;
        }

        return {
          ...prev,
          userCoordinates: nextUserCoordinates,
          mechanicCoordinates: nextMechanicCoordinates,
          pathCoordinates: nextPathCoordinates,
          mechanicOnline: nextMechanicOnline,
        };
      });
    };

    const handleCurrentLocation = (payload) => {
      if (!payload || String(payload.bookingId) !== String(bookingId)) return;
      setTrackingData((prev) => {
        const nextMechanicCoordinates = payload.coordinates || prev.mechanicCoordinates;
        const nextMechanicOnline = !!payload.isOnline;

        if (
          areCoordinatesEqual(prev.mechanicCoordinates, nextMechanicCoordinates) &&
          prev.mechanicOnline === nextMechanicOnline
        ) {
          return prev;
        }

        return {
          ...prev,
          mechanicCoordinates: nextMechanicCoordinates,
          mechanicOnline: nextMechanicOnline,
        };
      });
    };

    const handleMechanicOffline = (payload) => {
      if (!payload || String(payload.mechanicId) !== String(mechanicId)) return;
      setTrackingData((prev) => {
        if (!prev.mechanicOnline) return prev;
        return {
          ...prev,
          mechanicOnline: false,
        };
      });
    };

    socket.on('assigned-mechanic-location', handleAssignedLocation);
    socket.on('mechanic-current-location', handleCurrentLocation);
    socket.on('mechanic-offline', handleMechanicOffline);
    socket.emit('request-mechanic-location', { bookingId });

    return () => {
      socket.off('assigned-mechanic-location', handleAssignedLocation);
      socket.off('mechanic-current-location', handleCurrentLocation);
      socket.off('mechanic-offline', handleMechanicOffline);
    };
  }, [actorRole, bookingId, isTracking, mechanicId]);

  useEffect(() => {
    if (!bookingId || !isTracking || !navigator.geolocation) {
      if (geoWatchRef.current) {
        navigator.geolocation.clearWatch(geoWatchRef.current);
        geoWatchRef.current = null;
      }
      if (geoEmitIntervalRef.current) {
        clearInterval(geoEmitIntervalRef.current);
        geoEmitIntervalRef.current = null;
      }
      latestActorCoordinatesRef.current = null;
      return;
    }

    const socket = getSocket();
    const eventName = actorRole === 'mechanic' ? 'mechanic-location-update' : 'update-location';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = [position.coords.longitude, position.coords.latitude];
        latestActorCoordinatesRef.current = coordinates;

        setTrackingData((prev) => {
          const key = actorRole === 'mechanic' ? 'mechanicCoordinates' : 'userCoordinates';
          if (areCoordinatesEqual(prev[key], coordinates)) return prev;
          return {
            ...prev,
            [key]: coordinates,
          };
        });

        socket.emit(eventName, { bookingId, coordinates });
      },
      () => {
        // silently ignore geolocation errors to avoid blocking other UI actions
      },
      {
        ...GEO_OPTIONS,
        maximumAge: 0,
      }
    );

    geoWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const coordinates = [position.coords.longitude, position.coords.latitude];
        latestActorCoordinatesRef.current = coordinates;

        setTrackingData((prev) => {
          const key = actorRole === 'mechanic' ? 'mechanicCoordinates' : 'userCoordinates';
          if (areCoordinatesEqual(prev[key], coordinates)) return prev;
          return {
            ...prev,
            [key]: coordinates,
          };
        });
      },
      () => {
        // silently ignore geolocation errors to avoid blocking other UI actions
      },
      GEO_OPTIONS
    );

    geoEmitIntervalRef.current = setInterval(() => {
      if (!latestActorCoordinatesRef.current) return;
      socket.emit(eventName, {
        bookingId,
        coordinates: latestActorCoordinatesRef.current,
      });
    }, 300);

    return () => {
      if (geoWatchRef.current) {
        navigator.geolocation.clearWatch(geoWatchRef.current);
        geoWatchRef.current = null;
      }
      if (geoEmitIntervalRef.current) {
        clearInterval(geoEmitIntervalRef.current);
        geoEmitIntervalRef.current = null;
      }
    };
  }, [bookingId, isTracking, actorRole]);

  return {
    trackingData,
    setStaticUserCoordinates,
  };
}
