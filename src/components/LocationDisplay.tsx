import { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { toast } from 'sonner';

interface LocationDisplayProps {
  onLocationSelect?: (location: string) => void;
  showUpdateButton?: boolean;
  className?: string;
}

export function LocationDisplay({ onLocationSelect, showUpdateButton = false, className = "" }: LocationDisplayProps) {
  const { location, loading, getCurrentLocation, updateLocation } = useCurrentLocation();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleGetCurrentLocation = async () => {
    setIsUpdating(true);
    try {
      const locationData = await getCurrentLocation();
      if (locationData?.address) {
        onLocationSelect?.(locationData.address);
        toast.success(`Location updated to ${locationData.address}`);
      }
    } catch (error) {
      toast.error('Failed to get current location');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1 text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span className="text-sm">
          {location?.address || 'Location not set'}
        </span>
      </div>
      
      {showUpdateButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGetCurrentLocation}
          disabled={loading || isUpdating}
          className="h-6 px-2"
        >
          <Navigation className="h-3 w-3 mr-1" />
          {isUpdating ? 'Updating...' : 'Update'}
        </Button>
      )}
    </div>
  );
}