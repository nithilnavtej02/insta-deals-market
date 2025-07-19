import { useState, useRef } from "react";
import { MapPin, Camera, Upload, X, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import BottomNavigation from "@/components/BottomNavigation";

const Sell = () => {
  const [formData, setFormData] = useState({
    description: "",
    price: "",
    condition: "",
    category: "",
    location: ""
  });
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const conditions = ["New", "Like New", "Good", "Fair"];
  const categories = ["Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Cars"];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 5)); // Max 5 images
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setVideo(file);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
  };

  const handlePublish = () => {
    // Handle listing publication
    console.log("Publishing listing:", { ...formData, images, video });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-white border-b px-4 py-4">
        <h1 className="text-xl font-semibold">Sell Your Item</h1>
        <p className="text-muted-foreground">List your product for sale</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Media Upload */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Photos & Video</h2>
          
          {/* Image Upload */}
          <div>
            <Label>Photos (Required) - {images.length}/5</Label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 bg-black/50 text-white hover:bg-black/70"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              
              {images.length < 5 && (
                <Card 
                  className="aspect-square cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <CardContent className="flex flex-col items-center justify-center h-full p-2">
                    <Camera className="h-6 w-6 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground text-center">Add Photo</span>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <div className="flex gap-2 mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => imageInputRef.current?.click()}
                className="flex-1"
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => imageInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Gallery
              </Button>
            </div>
          </div>

          {/* Video Upload */}
          <div>
            <Label>Video (Optional)</Label>
            {video ? (
              <div className="relative mt-2">
                <video
                  src={URL.createObjectURL(video)}
                  className="w-full h-32 object-cover rounded-lg"
                  controls
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 bg-black/50 text-white hover:bg-black/70"
                  onClick={removeVideo}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Card 
                className="mt-2 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => videoInputRef.current?.click()}
              >
                <CardContent className="flex items-center justify-center p-6">
                  <div className="text-center">
                    <Video className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Add a video (optional)</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 30 seconds</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </div>
        </div>
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