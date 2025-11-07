import { ArrowLeft, MapPin, Search, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Location = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { updateLocation } = useCurrentLocation();

  const indianLocations = [
    // Major cities
    { id: 1, name: "Mumbai, Maharashtra", type: "city" },
    { id: 2, name: "Delhi", type: "city" },
    { id: 3, name: "Bengaluru, Karnataka", type: "city" },
    { id: 4, name: "Hyderabad, Telangana", type: "city" },
    { id: 5, name: "Ahmedabad, Gujarat", type: "city" },
    { id: 6, name: "Chennai, Tamil Nadu", type: "city" },
    { id: 7, name: "Kolkata, West Bengal", type: "city" },
    { id: 8, name: "Pune, Maharashtra", type: "city" },
    { id: 9, name: "Jaipur, Rajasthan", type: "city" },
    { id: 10, name: "Lucknow, Uttar Pradesh", type: "city" },
    { id: 11, name: "Kanpur, Uttar Pradesh", type: "city" },
    { id: 12, name: "Nagpur, Maharashtra", type: "city" },
    { id: 13, name: "Indore, Madhya Pradesh", type: "city" },
    { id: 14, name: "Thane, Maharashtra", type: "city" },
    { id: 15, name: "Bhopal, Madhya Pradesh", type: "city" },
    { id: 16, name: "Visakhapatnam, Andhra Pradesh", type: "city" },
    { id: 17, name: "Pimpri-Chinchwad, Maharashtra", type: "city" },
    { id: 18, name: "Patna, Bihar", type: "city" },
    { id: 19, name: "Vadodara, Gujarat", type: "city" },
    { id: 20, name: "Ghaziabad, Uttar Pradesh", type: "city" },
    { id: 21, name: "Ludhiana, Punjab", type: "city" },
    { id: 22, name: "Agra, Uttar Pradesh", type: "city" },
    { id: 23, name: "Nashik, Maharashtra", type: "city" },
    { id: 24, name: "Faridabad, Haryana", type: "city" },
    { id: 25, name: "Meerut, Uttar Pradesh", type: "city" },
    { id: 26, name: "Rajkot, Gujarat", type: "city" },
    { id: 27, name: "Varanasi, Uttar Pradesh", type: "city" },
    { id: 28, name: "Srinagar, Jammu and Kashmir", type: "city" },
    { id: 29, name: "Amritsar, Punjab", type: "city" },
    { id: 30, name: "Chandigarh", type: "city" },
    { id: 31, name: "Coimbatore, Tamil Nadu", type: "city" },
    { id: 32, name: "Kochi, Kerala", type: "city" },
    { id: 33, name: "Guwahati, Assam", type: "city" },
    { id: 34, name: "Bhubaneswar, Odisha", type: "city" },
    { id: 35, name: "Dehradun, Uttarakhand", type: "city" },
  ];

  const [filteredLocations, setFilteredLocations] = useState(indianLocations);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = indianLocations.filter(loc =>
        loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(indianLocations);
    }
  }, [searchQuery]);

  const handleLocationSelect = async (locationName: string) => {
    if (!user) return;
    
    try {
      await updateLocation(locationName);
      toast.success("Location updated successfully");
      navigate(-1);
    } catch (error) {
      console.error('Error updating location:', error);
      toast.error("Failed to update location");
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.info('Getting your location...');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Try BigDataCloud API first
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          
          if (response.ok) {
            const data = await response.json();
            const cityName = data.city || data.locality || data.principalSubdivision;
            const stateName = data.principalSubdivision;
            const locationName = cityName && stateName 
              ? `${cityName}, ${stateName}` 
              : cityName || stateName || `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            handleLocationSelect(locationName);
          } else {
            // Fallback to coordinates
            const fallbackName = `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
            handleLocationSelect(fallbackName);
            toast.info("Using coordinates. You can search for your city above.");
          }
        } catch (error) {
          console.error("Error getting location name:", error);
          toast.error("Failed to get location details. Please select from the list.");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Unable to get location. ";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out.";
            break;
          default:
            errorMessage += "Please select from the list below.";
        }
        
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Choose Location</h1>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Current Location */}
        <Button
          variant="outline"
          className="w-full justify-start mb-6"
          onClick={getCurrentLocation}
        >
          <Target className="h-5 w-5 mr-3 text-primary" />
          Use current location
        </Button>

        {/* All Indian Cities */}
        <div>
          <h3 className="font-semibold mb-3">Indian Cities & States</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredLocations.map((location) => (
              <Card key={location.id} className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleLocationSelect(location.name)}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{location.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;