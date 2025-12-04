import { useState, useRef, useEffect } from "react";
import { MapPin, Camera, Upload, X, Video, ChevronLeft, Film, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useLocation } from "@/hooks/useLocation";
import { useReelUpload } from "@/hooks/useReelUpload";
import { useUsdRate } from "@/hooks/useUsdRate";
import { toast } from "sonner";
import { validateFileUpload } from "@/utils/security";

const Sell = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { createProduct } = useProducts();
  const { categories } = useCategories();
  const { location: userLocation } = useLocation();
  const { uploadReel, uploading: reelUploading } = useReelUpload();
  const { convertToUsd } = useUsdRate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    condition: "",
    categoryId: "",
    location: userLocation || ""
  });
  const [keyFeatures, setKeyFeatures] = useState<string[]>(["", "", ""]);
  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [reelVideo, setReelVideo] = useState<File | null>(null);
  const [reelData, setReelData] = useState({
    title: "",
    description: "",
    buyLink: ""
  });
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const reelVideoInputRef = useRef<HTMLInputElement>(null);

  const conditions = ["New", "Like New", "Good", "Fair"];

  // Calculate USD equivalent
  const priceInInr = parseFloat(formData.price) || 0;
  const priceInUsd = priceInInr > 0 ? convertToUsd(priceInInr) : 0;

  const handleInputChange = (field: string, value: string) => {
    // Don't sanitize - allow all characters including spaces
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyFeatureChange = (index: number, value: string) => {
    const updated = [...keyFeatures];
    updated[index] = value;
    setKeyFeatures(updated);
  };

  const addKeyFeature = () => {
    if (keyFeatures.length < 6) {
      setKeyFeatures([...keyFeatures, ""]);
    }
  };

  const removeKeyFeature = (index: number) => {
    if (keyFeatures.length > 3) {
      setKeyFeatures(keyFeatures.filter((_, i) => i !== index));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    const validFiles: File[] = [];
    for (const file of files) {
      const validation = validateFileUpload(file, {
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp']
      });
      
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        toast.error(`${file.name}: ${validation.error}`);
      }
    }
    
    setImages(prev => [...prev, ...validFiles].slice(0, 10));
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateFileUpload(file, {
        maxSize: 50 * 1024 * 1024,
        allowedTypes: ['video/mp4', 'video/webm', 'video/ogg'],
        allowedExtensions: ['.mp4', '.webm', '.ogg']
      });
      
      if (validation.isValid) {
        setVideo(file);
      } else {
        toast.error(`Video upload failed: ${validation.error}`);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
  };

  const handlePublish = async () => {
    if (!user || !profile) {
      toast.error("Please sign in to list a product");
      navigate("/auth");
      return;
    }

    // Validate key features - at least 3 non-empty
    const validFeatures = keyFeatures.filter(f => f.trim().length > 0);
    if (validFeatures.length < 3) {
      toast.error("Please add at least 3 key features");
      return;
    }

    if (!formData.title || !formData.price || !formData.description || images.length < 3) {
      toast.error("Please fill all required fields and add at least 3 images");
      return;
    }

    setLoading(true);
    try {
      const imageUrls = await Promise.all(
        images.map(async (file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        })
      );

      const { data, error } = await createProduct({
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        condition: formData.condition.toLowerCase().replace(' ', '_') as 'new' | 'like_new' | 'good' | 'fair',
        category_id: formData.categoryId || null,
        location: formData.location,
        images: imageUrls,
        key_features: validFeatures
      });

      if (error) {
        toast.error("Failed to create listing");
      } else {
        toast.success("Product listed successfully!");
        navigate("/my-listings");
      }
    } catch (error) {
      toast.error("An error occurred while creating the listing");
    } finally {
      setLoading(false);
    }
  };

  const handleReelVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateFileUpload(file, {
        maxSize: 100 * 1024 * 1024,
        allowedTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
        allowedExtensions: ['.mp4', '.webm', '.ogg', '.mov']
      });
      
      if (validation.isValid) {
        setReelVideo(file);
        toast.success("Video selected successfully!");
      } else {
        toast.error(`Video upload failed: ${validation.error}`);
      }
    }
  };

  const removeReelVideo = () => {
    setReelVideo(null);
  };

  const handleReelUpload = async () => {
    if (!reelVideo || !reelData.title) {
      toast.error("Please add a video and title for your reel");
      return;
    }

    const result = await uploadReel(reelVideo, reelData);
    if (!result.error) {
      setReelVideo(null);
      setReelData({ title: "", description: "", buyLink: "" });
      navigate("/reels");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="flex items-center p-4 border-b">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => navigate("/")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <div className="ml-4">
          <h1 className="text-xl font-semibold">Sell Your Item</h1>
          <p className="text-muted-foreground">List your product for sale</p>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="product" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="product">Sell Product</TabsTrigger>
            <TabsTrigger value="reel">Upload Reel</TabsTrigger>
          </TabsList>
          
          <TabsContent value="product" className="space-y-6">
            {/* Media Upload */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Photos & Video</h2>
              
              {/* Image Upload */}
              <div>
                <Label>Photos (Required) - {images.length}/10</Label>
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
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 bg-primary text-white px-2 py-0.5 rounded text-xs">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {images.length < 10 && (
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
                
                <p className="text-xs text-muted-foreground mt-2">
                  Add 3-10 photos. First photo will be the cover image. Swipeable in product view.
                </p>
                
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

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                type="text"
                placeholder="What are you selling?"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="h-12"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your item in detail..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="min-h-32 resize-none"
              />
              <div className="text-right text-xs text-muted-foreground">
                {formData.description.length}/500
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Key Features * (3-6 features)</Label>
                {keyFeatures.length < 6 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addKeyFeature}
                    className="text-primary"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                )}
              </div>
              {keyFeatures.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => handleKeyFeatureChange(index, e.target.value)}
                    className="flex-1"
                  />
                  {keyFeatures.length > 3 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeKeyFeature(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Add key highlights that make your product stand out
              </p>
            </div>

            {/* Price and Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (INR) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="pl-8"
                  />
                </div>
                {priceInInr > 0 && (
                  <p className="text-xs text-primary font-medium">
                    ≈ ${priceInUsd.toLocaleString()} USD
                  </p>
                )}
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
                      key={category.id}
                      variant={formData.categoryId === category.id ? "reown" : "outline"}
                      size="sm"
                      onClick={() => handleInputChange("categoryId", category.id)}
                      className="text-xs"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      if (navigator.geolocation) {
                        toast.success('Getting your location...');
                        navigator.geolocation.getCurrentPosition(
                          async (position) => {
                            const { latitude, longitude } = position.coords;
                            const { reverseGeocode } = await import('@/utils/locationFormat');
                            const locationName = await reverseGeocode(latitude, longitude);
                            setFormData({...formData, location: locationName});
                            toast.success('Location added successfully!');
                          },
                          (error) => {
                            toast.error('Unable to get location. Please enter manually.');
                          }
                        );
                      } else {
                        toast.error('Geolocation not supported by your browser.');
                      }
                    }}
                    className="px-3"
                  >
                    📍
                  </Button>
                </div>
              </div>
            </div>

            <Button
              variant="reown"
              size="lg"
              className="w-full"
              onClick={handlePublish}
              disabled={loading}
            >
              {loading ? "Publishing..." : "Publish Listing"}
            </Button>
          </TabsContent>

          <TabsContent value="reel" className="space-y-6">
            {/* Reel Upload */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Upload Reel</h2>
              
              {/* Video Upload for Reel */}
              <div>
                <Label>Video *</Label>
                {reelVideo ? (
                  <div className="relative mt-2">
                    <video
                      src={URL.createObjectURL(reelVideo)}
                      className="w-full h-64 object-cover rounded-lg"
                      controls
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 bg-black/50 text-white hover:bg-black/70"
                      onClick={removeReelVideo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Card 
                    className="mt-2 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => reelVideoInputRef.current?.click()}
                  >
                    <CardContent className="flex items-center justify-center p-12">
                      <div className="text-center">
                        <Film className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm font-medium">Upload your reel video</p>
                        <p className="text-xs text-muted-foreground mt-1">MP4, MOV up to 100MB</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <input
                  ref={reelVideoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleReelVideoUpload}
                  className="hidden"
                />
              </div>

              {/* Reel Title */}
              <div className="space-y-2">
                <Label htmlFor="reelTitle">Title *</Label>
                <Input
                  id="reelTitle"
                  type="text"
                  placeholder="Give your reel a catchy title"
                  value={reelData.title}
                  onChange={(e) => setReelData({...reelData, title: e.target.value})}
                  className="h-12"
                />
              </div>

              {/* Reel Description */}
              <div className="space-y-2">
                <Label htmlFor="reelDescription">Description (Optional)</Label>
                <Textarea
                  id="reelDescription"
                  placeholder="Add a description for your reel..."
                  value={reelData.description}
                  onChange={(e) => setReelData({...reelData, description: e.target.value})}
                  className="min-h-24 resize-none"
                />
              </div>

              {/* Buy Link */}
              <div className="space-y-2">
                <Label htmlFor="buyLink">Buy Link (Optional)</Label>
                <Input
                  id="buyLink"
                  type="url"
                  placeholder="https://example.com/product"
                  value={reelData.buyLink}
                  onChange={(e) => setReelData({...reelData, buyLink: e.target.value})}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Add a link where viewers can buy the product shown in your reel
                </p>
              </div>

              <Button
                variant="reown"
                size="lg"
                className="w-full"
                onClick={handleReelUpload}
                disabled={reelUploading || !reelVideo || !reelData.title}
              >
                {reelUploading ? "Uploading..." : "Upload Reel"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Sell;
