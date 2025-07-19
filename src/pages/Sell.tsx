import { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import BottomNavigation from "@/components/BottomNavigation";

const Sell = () => {
  const [formData, setFormData] = useState({
    description: "",
    price: "",
    condition: "",
    category: "",
    location: ""
  });

  const conditions = ["New", "Like New", "Good", "Fair"];
  const categories = ["Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Cars"];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePublish = () => {
    // Handle listing publication
    console.log("Publishing listing:", formData);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-white border-b px-4 py-4">
        <h1 className="text-xl font-semibold">Sell Your Item</h1>
        <p className="text-muted-foreground">List your product for sale</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Description */}
        <div className="space-y-2">
          <Textarea
            placeholder="Describe your item in detail..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="min-h-32 resize-none"
          />
          <div className="text-right text-xs text-muted-foreground">
            {formData.description.length}/500
          </div>
        </div>

        {/* Price and Condition */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="price"
                type="text"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Condition</Label>
            <div className="flex flex-wrap gap-2">
              {conditions.map((condition) => (
                <Button
                  key={condition}
                  variant={formData.condition === condition ? "reown" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange("condition", condition)}
                  className="text-xs"
                >
                  {condition}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Category & Location */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Category & Location</h2>
          
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={formData.category === category ? "reown" : "outline"}
                  size="sm"
                  onClick={() => handleInputChange("category", category)}
                  className="text-xs"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                type="text"
                placeholder="City, State"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <Button
          variant="reown"
          size="lg"
          className="w-full"
          onClick={handlePublish}
        >
          Publish Listing
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Sell;