import { useState, useEffect } from 'react';

export function useLocation() {
  const [location, setLocation] = useState<string>('New York');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setLocation(savedLocation);
    }
  }, []);

  const updateLocation = (newLocation: string) => {
    setLocation(newLocation);
    localStorage.setItem('userLocation', newLocation);
  };

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // In a real app, you'd use a geocoding service
            // For now, we'll just set it as "Current Location"
            const currentLocation = "Current Location";
            updateLocation(currentLocation);
          } catch (error) {
            console.error('Error getting location name:', error);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  };

  return {
    location,
    loading,
    updateLocation,
    getCurrentLocation
  };
}