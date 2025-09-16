import { useState, useEffect } from 'react';
import { useCurrentLocation } from './useCurrentLocation';

export function useLocation() {
  const [location, setLocation] = useState<string>('New York');
  const [loading, setLoading] = useState(false);
  const { getCurrentLocation: getRealLocation, location: realLocation, loading: realLoading } = useCurrentLocation();

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setLocation(savedLocation);
    }
  }, []);

  useEffect(() => {
    if (realLocation?.address) {
      setLocation(realLocation.address);
      localStorage.setItem('userLocation', realLocation.address);
    }
  }, [realLocation]);

  // Auto-update location every 10 minutes when mounted
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.geolocation) {
        getRealLocation();
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [getRealLocation]);

  const updateLocation = (newLocation: string) => {
    setLocation(newLocation);
    localStorage.setItem('userLocation', newLocation);
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      const locationData = await getRealLocation();
      if (locationData?.address) {
        updateLocation(locationData.address);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    location,
    loading: loading || realLoading,
    updateLocation,
    getCurrentLocation
  };
}