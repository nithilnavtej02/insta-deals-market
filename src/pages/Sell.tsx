import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Camera, Upload, X, Video, ChevronLeft, Film, Plus, Minus, Package, Sparkles } from "lucide-react";
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
import { PageTransition, staggerContainer, staggerItem } from "@/components/PageTransition";
import { SellSkeleton } from "@/components/skeletons/SellSkeleton";

const Sell = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { createProduct } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
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

  const priceInInr = parseFloat(formData.price) || 0;
  const priceInUsd = priceInInr > 0 ? convertToUsd(priceInInr) : 0;

  const handleInputChange = (field: string, value: string) => {
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

  if (profileLoading || categoriesLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24 p-4">
          <SellSkeleton />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
        {/* Header */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/50">
          <div className="flex items-center px-4 py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full bg-muted/50 hover:bg-muted"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="ml-4">
              <h1 className="text-xl font-bold">Sell Your Item</h1>
              <p className="text-xs text-muted-foreground">List your product for sale</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Tabs defaultValue="product" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted/50 p-1">
              <TabsTrigger value="product" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                Sell Product
              </TabsTrigger>
              <TabsTrigger value="reel" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
                <Film className="h-4 w-4" />
                Upload Reel
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="product">
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                {/* Media Upload */}
                <motion.div variants={staggerItem} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Camera className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold">Photos & Video</h2>
                  </div>
                  
                  {/* Image Upload */}
                  <div>
                    <Label className="text-sm font-medium">Photos (Required) - {images.length}/10</Label>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {images.map((image, index) => (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative aspect-square"
                        >
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover rounded-xl shadow-lg"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 bg-black/50 text-white hover:bg-black/70 rounded-full"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1 bg-primary text-white px-2 py-0.5 rounded-full text-xs font-medium">
                              Cover
                            </div>
                          )}
                        </motion.div>
                      ))}
                      
                      {images.length < 10 && (
                        <Card 
                          className="aspect-square cursor-pointer hover:bg-muted/50 transition-all duration-300 backdrop-blur-sm bg-card/50 border-dashed border-2 border-border/50 hover:border-primary/50"
                          onClick={() => imageInputRef.current?.click()}
                        >
                          <CardContent className="flex flex-col items-center justify-center h-full p-2">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                              <Plus className="h-5 w-5 text-primary" />
                            </div>
                            <span className="text-xs text-muted-foreground text-center">Add Photo</span>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-3">
                      Add 3-10 photos. First photo will be the cover image.
                    </p>
                    
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => imageInputRef.current?.click()}
                        className="flex-1 rounded-xl"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Camera
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => imageInputRef.current?.click()}
                        className="flex-1 rounded-xl"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Gallery
                      </Button>
                    </div>
                  </div>

                  {/* Video Upload */}
                  <div>
                    <Label className="text-sm font-medium">Video (Optional)</Label>
                    {video ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative mt-2"
                      >
                        <video
                          src={URL.createObjectURL(video)}
                          className="w-full h-32 object-cover rounded-xl shadow-lg"
                          controls
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 bg-black/50 text-white hover:bg-black/70 rounded-full"
                          onClick={removeVideo}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    ) : (
                      <Card 
                        className="mt-2 cursor-pointer hover:bg-muted/50 transition-all duration-300 backdrop-blur-sm bg-card/50 border-dashed border-2 border-border/50 hover:border-primary/50"
                        onClick={() => videoInputRef.current?.click()}
                      >
                        <CardContent className="flex items-center justify-center p-6">
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                              <Video className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm font-medium">Add a video (optional)</p>
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
                </motion.div>

                {/* Title */}
                <motion.div variants={staggerItem} className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="What are you selling?"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                  />
                </motion.div>

                {/* Description */}
                <motion.div variants={staggerItem} className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item in detail..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="min-h-32 resize-none rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="text-right text-xs text-muted-foreground">
                    {formData.description.length}/500
                  </div>
                </motion.div>

                {/* Key Features */}
                <motion.div variants={staggerItem} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Key Features * (3-6 features)</Label>
                    {keyFeatures.length < 6 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={addKeyFeature}
                        className="text-primary rounded-full"
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
                        className="flex-1 h-11 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                      />
                      {keyFeatures.length > 3 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeKeyFeature(index)}
                          className="text-muted-foreground hover:text-destructive rounded-full"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Add key highlights that make your product stand out
                  </p>
                </motion.div>

                {/* Price and Condition */}
                <motion.div variants={staggerItem} className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">Price (INR) *</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        className="pl-8 h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    {priceInInr > 0 && (
                      <p className="text-xs text-primary font-medium flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        ≈ ${priceInUsd.toLocaleString()} USD
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Condition</Label>
                    <div className="flex flex-wrap gap-2">
                      {conditions.map((condition) => (
                        <Button
                          key={condition}
                          variant={formData.condition === condition ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleInputChange("condition", condition)}
                          className={`text-xs rounded-full ${formData.condition === condition ? 'shadow-lg shadow-primary/25' : ''}`}
                        >
                          {condition}
                        </Button>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Category & Location */}
                <motion.div variants={staggerItem} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-blue-500" />
                    </div>
                    <h2 className="text-lg font-semibold">Category & Location</h2>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Category</Label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={formData.categoryId === category.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleInputChange("categoryId", category.id)}
                          className={`text-xs rounded-full ${formData.categoryId === category.id ? 'shadow-lg shadow-primary/25' : ''}`}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          type="text"
                          placeholder="City, State"
                          value={formData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          className="pl-10 h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
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
                              () => {
                                toast.error('Unable to get location. Please enter manually.');
                              }
                            );
                          } else {
                            toast.error('Geolocation not supported by your browser.');
                          }
                        }}
                        className="px-4 rounded-xl h-12"
                      >
                        📍
                      </Button>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <Button
                    size="lg"
                    className="w-full h-14 rounded-xl text-lg font-semibold shadow-lg shadow-primary/25"
                    onClick={handlePublish}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Publishing...
                      </div>
                    ) : (
                      "Publish Listing"
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </TabsContent>

            <TabsContent value="reel">
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-6"
              >
                <motion.div variants={staggerItem} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Film className="h-4 w-4 text-purple-500" />
                    </div>
                    <h2 className="text-lg font-semibold">Upload Reel</h2>
                  </div>
                  
                  {/* Video Upload for Reel */}
                  <div>
                    <Label className="text-sm font-medium">Video *</Label>
                    {reelVideo ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative mt-2"
                      >
                        <video
                          src={URL.createObjectURL(reelVideo)}
                          className="w-full h-64 object-cover rounded-xl shadow-lg"
                          controls
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 bg-black/50 text-white hover:bg-black/70 rounded-full"
                          onClick={removeReelVideo}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ) : (
                      <Card 
                        className="mt-2 cursor-pointer hover:bg-muted/50 transition-all duration-300 backdrop-blur-sm bg-card/50 border-dashed border-2 border-border/50 hover:border-purple-500/50"
                        onClick={() => reelVideoInputRef.current?.click()}
                      >
                        <CardContent className="flex items-center justify-center p-12">
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                              <Film className="h-8 w-8 text-purple-500" />
                            </div>
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
                    <Label htmlFor="reelTitle" className="text-sm font-medium">Title *</Label>
                    <Input
                      id="reelTitle"
                      type="text"
                      placeholder="Give your reel a catchy title"
                      value={reelData.title}
                      onChange={(e) => setReelData({...reelData, title: e.target.value})}
                      className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Reel Description */}
                  <div className="space-y-2">
                    <Label htmlFor="reelDescription" className="text-sm font-medium">Description (Optional)</Label>
                    <Textarea
                      id="reelDescription"
                      placeholder="Add a description for your reel..."
                      value={reelData.description}
                      onChange={(e) => setReelData({...reelData, description: e.target.value})}
                      className="min-h-24 resize-none rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {/* Buy Link */}
                  <div className="space-y-2">
                    <Label htmlFor="buyLink" className="text-sm font-medium">Buy Link (Optional)</Label>
                    <Input
                      id="buyLink"
                      type="url"
                      placeholder="https://example.com/product"
                      value={reelData.buyLink}
                      onChange={(e) => setReelData({...reelData, buyLink: e.target.value})}
                      className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-xs text-muted-foreground">
                      Add a link where viewers can buy the product shown in your reel
                    </p>
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-14 rounded-xl text-lg font-semibold shadow-lg shadow-purple-500/25 bg-purple-500 hover:bg-purple-600"
                    onClick={handleReelUpload}
                    disabled={reelUploading || !reelVideo || !reelData.title}
                  >
                    {reelUploading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading...
                      </div>
                    ) : (
                      "Upload Reel"
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        <BottomNavigation />
      </div>
    </PageTransition>
  );
};

export default Sell;
