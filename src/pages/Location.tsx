import { ArrowLeft, MapPin, Search, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Location = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const suggestedLocations = [
    { id: 1, name: "Mumbai, India", distance: "Current Location" },
    { id: 2, name: "Delhi, India", distance: "1,415 km away" },
    { id: 3, name: "Bangalore, India", distance: "984 km away" },
    { id: 4, name: "Pune, India", distance: "149 km away" },
    { id: 5, name: "Ahmedabad, India", distance: "492 km away" },
  ];

  const recentLocations = [
    { id: 1, name: "Andheri West, Mumbai" },
    { id: 2, name: "Bandra, Mumbai" },
    { id: 3, name: "Powai, Mumbai" },
  ];

  const handleLocationSelect = (locationName: string) => {
    // Update location and navigate back
    navigate(-1);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Handle current location
          handleLocationSelect("Current Location");
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
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

        {/* Recent Locations */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Recent Locations</h3>
          <div className="space-y-2">
            {recentLocations.map((location) => (
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

        {/* Suggested Locations */}
        <div>
          <h3 className="font-semibold mb-3">Suggested Locations</h3>
          <div className="space-y-2">
            {suggestedLocations.map((location) => (
              <Card key={location.id} className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleLocationSelect(location.name)}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{location.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{location.distance}</span>
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