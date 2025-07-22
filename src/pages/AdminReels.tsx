import { useState } from "react";
import { ArrowLeft, Plus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

const AdminReels = () => {
  const navigate = useNavigate();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [newReel, setNewReel] = useState({
    title: "",
    description: "",
    price: "",
    seller: "",
    image: null as File | null,
    buyLink: ""
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewReel({ ...newReel, image: file });
    }
  };

  const handleSubmit = () => {
    console.log("Uploading reel:", newReel);
    // Here you would upload the reel to your backend
    setShowUploadDialog(false);
    setNewReel({
      title: "",
      description: "",
      price: "",
      seller: "",
      image: null,
      buyLink: ""
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Admin - Manage Reels</h1>
          </div>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Upload Reel
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload New Reel</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newReel.title}
                    onChange={(e) => setNewReel({ ...newReel, title: e.target.value })}
                    placeholder="Enter reel title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newReel.description}
                    onChange={(e) => setNewReel({ ...newReel, description: e.target.value })}
                    placeholder="Enter reel description"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    value={newReel.price}
                    onChange={(e) => setNewReel({ ...newReel, price: e.target.value })}
                    placeholder="e.g., $299"
                  />
                </div>
                <div>
                  <Label htmlFor="seller">Seller Username</Label>
                  <Input
                    id="seller"
                    value={newReel.seller}
                    onChange={(e) => setNewReel({ ...newReel, seller: e.target.value })}
                    placeholder="e.g., @techseller"
                  />
                </div>
                <div>
                  <Label htmlFor="buyLink">Buy Link (External)</Label>
                  <Input
                    id="buyLink"
                    value={newReel.buyLink}
                    onChange={(e) => setNewReel({ ...newReel, buyLink: e.target.value })}
                    placeholder="https://example.com/product"
                  />
                </div>
                <div>
                  <Label htmlFor="image">Product Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Reel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Admin Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Only you (admin) can upload reels to the platform</p>
              <p>• Users can view, like, and interact with reels but cannot upload</p>
              <p>• When users click "Buy", they'll be redirected to the external link you provide</p>
              <p>• Make sure to include high-quality images and compelling descriptions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Uploads */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Uploads</h2>
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <h3 className="font-medium">iPhone 14 Pro Max</h3>
                  <p className="text-sm text-muted-foreground">$999 • @techdealer</p>
                </div>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminReels;