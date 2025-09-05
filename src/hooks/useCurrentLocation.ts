import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export function useCurrentLocation() {
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // Use reverse geocoding to get address
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await response.json();
        
        const address = data.city || data.locality || data.principalSubdivision || 'Unknown Location';
        
        const locationData = {
          latitude,
          longitude,
          address
        };

        setLocation(locationData);
        
        // Save to localStorage
        localStorage.setItem('userCurrentLocation', JSON.stringify(locationData));
        
        return locationData;
      } catch (geocodeError) {
        console.error('Geocoding error:', geocodeError);
        const locationData = {
          latitude,
          longitude,
          address: 'Current Location'
        };
        
        setLocation(locationData);
        return locationData;
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Unable to get your location');
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (locationName: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setLoading(true);
      
      // Get user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Update profile location
      const { error } = await supabase
        .from('profiles')
        .update({ location: locationName })
        .eq('id', profile.id);

      if (error) throw error;
      
      setLocation(prev => prev ? { ...prev, address: locationName } : null);
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load saved location on mount
    const savedLocation = localStorage.getItem('userCurrentLocation');
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation));
      } catch (error) {
        console.error('Error parsing saved location:', error);
      }
    }
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    updateLocation
  };
}