import { Heart, MessageCircle, Package, Star, Settings, Shield, Bell, LogOut, Calendar, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Profile = () => {
  const navigate = useNavigate();
  const [showVerifiedDialog, setShowVerifiedDialog] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const recentActivity = [
    {
      id: 1,
      type: "sold",
      item: "iPhone 14 Pro sold",
      time: "2 hours ago",
      amount: "$899",
      icon: Package
    },
    {
      id: 2,
      type: "favorite",
      item: "MacBook Air favorited",
      time: "5 hours ago",
      icon: Heart
    },
    {
      id: 3,
      type: "message",
      item: "New message received",
      time: "1 day ago",
      icon: MessageCircle
    }
  ];

  const accountOptions = [
    { label: "My Listings", icon: Package, count: null },
    { label: "Favorites", icon: Heart, count: null },
    { label: "Notifications", icon: Bell, count: null },
    { label: "Privacy & Security", icon: Shield, count: null },
    { label: "Settings", icon: Settings, count: null }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-6">
        {/* Profile Info */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="w-16 h-16">
            <AvatarImage src="/src/assets/profile-pic.jpg" />
            <AvatarFallback className="bg-primary text-white text-xl">SU</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold">@sujatha</h1>
              <Dialog open={showVerifiedDialog} onOpenChange={setShowVerifiedDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs border-green-500 text-green-600 hover:bg-green-50"
                  >
                    ✓ Verified
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Verified Seller</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Shield className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Trusted Seller</h3>
                        <p className="text-sm text-muted-foreground">This seller is genuine and can be trusted</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">Account Created</p>
                        <p className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          March 15, 2023
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">Location</p>
                        <p className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Mumbai, India
                        </p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-lg font-medium text-primary mb-1">SUJATHA</p>
            <p className="text-muted-foreground">sujatha@mom.com</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs p-0 h-auto mt-1"
            >
              📍 Mumbai, India
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" placeholder="Tell us about yourself..." defaultValue="Tech enthusiast and seller in Mumbai" />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" defaultValue="Mumbai, India" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue="+91 98765 43210" />
                </div>
                <Button className="w-full">Save Changes</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showEditName} onOpenChange={setShowEditName}>
            <DialogTrigger asChild>
              <Button variant="reown" size="sm" className="flex-1">
                Edit Name
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Name</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue="@sujatha" />
                </div>
                <div>
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" defaultValue="SUJATHA" />
                </div>
                <Button className="w-full">Save Changes</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 text-center">
          <div className="cursor-pointer" onClick={() => navigate('/my-listings')}>
            <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">24</p>
            <p className="text-sm text-muted-foreground">Items Sold</p>
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/reviews')}>
            <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">4.8</p>
            <p className="text-sm text-muted-foreground">Rating</p>
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/reviews')}>
            <MessageCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">156</p>
            <p className="text-sm text-muted-foreground">Reviews</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity) => {
            const Icon = activity.icon;
            return (
              <div 
                key={activity.id} 
                className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  if (activity.type === "sold") navigate('/my-listings');
                  else if (activity.type === "favorite") navigate('/favorites');
                  else if (activity.type === "message") navigate('/messages');
                }}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.item}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
                {activity.amount && (
                  <p className="font-bold text-primary">{activity.amount}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Options */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Account</h2>
        <Card>
          <CardContent className="p-0">
            {accountOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.label}
                  className={`flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer ${
                    index !== accountOptions.length - 1 ? "border-b" : ""
                  }`}
                  onClick={() => {
                    if (option.label === "Settings") {
                      navigate("/settings");
                    } else if (option.label === "Notifications") {
                      navigate("/notifications");
                    } else if (option.label === "My Listings") {
                      navigate("/my-listings");
                    } else if (option.label === "Favorites") {
                      navigate("/favorites");
                    } else if (option.label === "Privacy & Security") {
                      navigate("/privacy-security");
                    }
                  }}
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="flex-1 font-medium">{option.label}</span>
                  <span className="text-muted-foreground">›</span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Logout */}
      <div className="px-4 mb-6">
        <Button
          variant="outline"
          className="w-full text-destructive border-destructive/20 hover:bg-destructive/5"
          onClick={() => {
            // Handle logout
            navigate("/auth");
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-muted-foreground mb-6">
        <p className="text-sm">ReOwn v1.0.0</p>
        <p className="text-xs">Made with ❤️ for the community</p>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;