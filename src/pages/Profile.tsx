import { Heart, MessageCircle, Package, Star, Settings, Shield, Bell, LogOut, Calendar, MapPin, X, Edit, User, ShoppingCart } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [showVerifiedDialog, setShowVerifiedDialog] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    phone: '',
    username: '',
    display_name: ''
  });
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const fetchFollowers = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*, profiles:follower_id(*)')
        .eq('following_id', profile.id);
      
      if (error) throw error;
      setFollowers(data || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowing = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('follows')
        .select('*, profiles:following_id(*)')
        .eq('follower_id', profile.id);
      
      if (error) throw error;
      setFollowing(data || []);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const fetchRecentActivity = async () => {
    if (!profile) return;
    
    try {
      // This would be a more complex query combining orders, favorites, messages
      setRecentActivity([]); // For now, empty until we implement activity tracking
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        location: profile.location || '',
        phone: profile.phone || '',
        username: profile.username || '',
        display_name: profile.display_name || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      fetchFollowers();
      fetchFollowing();
      fetchRecentActivity();
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    const { error } = await updateProfile(formData);
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
      setShowEditProfile(false);
    }
  };

  const handleUpdateName = async () => {
    const { error } = await updateProfile({
      username: formData.username,
      display_name: formData.display_name
    });
    if (error) {
      toast.error('Failed to update name');
    } else {
      toast.success('Name updated successfully');
      setShowEditName(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      navigate('/auth');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Please sign in</h2>
          <p className="text-muted-foreground mb-4">You need to sign in to view your profile.</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  const accountOptions = [
    { label: "My Listings", icon: Package, count: null },
    { label: "Cart", icon: ShoppingCart, count: null },
    { label: "Favorites", icon: Heart, count: null },
    { label: "Notifications", icon: Bell, count: null },
    { label: "Privacy & Security", icon: Shield, count: null },
    { label: "Settings", icon: Settings, count: null }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-background px-4 py-6 relative">
        {/* Profile Info */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar 
            className="w-16 h-16 cursor-pointer"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file && profile) {
                  try {
                    // Upload to Supabase storage
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${profile.id}.${fileExt}`;
                    
                    const { data, error } = await supabase.storage
                      .from('avatars')
                      .upload(fileName, file, { upsert: true });
                    
                    if (error) throw error;
                    
                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                      .from('avatars')
                      .getPublicUrl(fileName);
                    
                    // Update profile with new avatar URL
                    await updateProfile({ avatar_url: publicUrl });
                    toast.success('Profile picture updated!');
                  } catch (error) {
                    console.error('Error uploading avatar:', error);
                    toast.error('Failed to upload profile picture');
                  }
                }
              };
              input.click();
            }}
          >
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary text-white text-xl">
              {profile?.avatar_url ? 
                (profile?.display_name?.slice(0, 2) || profile?.username?.slice(0, 2) || 'U') : 
                (() => {
                  const emojis = ['😊', '🎯', '🌟', '🎨', '🚀', '💎', '🔥', '⚡', '🌈', '🎪'];
                  const index = profile?.username ? profile.username.length % emojis.length : 0;
                  return emojis[index];
                })()
              }
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold">@{profile?.username || 'user'}</h1>
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
            <p className="text-lg font-medium text-foreground mb-1">{profile?.display_name || 'User'}</p>
            {/* Email only visible to the user themselves */}
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs p-0 h-auto mt-1"
            >
              📍 {profile?.location || 'Location not set'}
            </Button>
          </div>
        </div>

        {/* Pencil Icon for Edit Options */}
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm">
                <Edit className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditProfile(true)}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Edit Profile</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowEditName(true)}>
                <div className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  <span>Edit Name</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={showEditProfile} onOpenChange={setShowEditProfile}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us about yourself..." 
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleUpdateProfile}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Name Dialog */}
        <Dialog open={showEditName} onOpenChange={setShowEditName}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Name</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input 
                  id="displayName" 
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleUpdateName}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Followers and Following Buttons */}
        <div className="flex gap-3 mb-6">
          <Button 
            variant="outline" 
            className="flex-1 h-12"
            onClick={() => setShowFollowers(true)}
          >
            <div className="text-center">
              <p className="text-lg font-bold">{followers.length}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 h-12"
            onClick={() => setShowFollowing(true)}
          >
            <div className="text-center">
              <p className="text-lg font-bold">{following.length}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="cursor-pointer" onClick={() => navigate('/my-listings')}>
            <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{profile?.items_sold || 0}</p>
            <p className="text-sm text-muted-foreground">Items Sold</p>
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/reviews')}>
            <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{profile?.rating || 0}</p>
            <p className="text-sm text-muted-foreground">Rating</p>
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/reviews')}>
            <MessageCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{profile?.total_reviews || 0}</p>
            <p className="text-sm text-muted-foreground">Reviews</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activity</p>
              <p className="text-sm">Start buying or selling to see your activity here</p>
            </div>
          ) : (
            recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div 
                  key={activity.id} 
                  className="flex items-center gap-3 p-3 bg-card rounded-lg cursor-pointer hover:bg-muted/50"
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
                    <p className="font-medium text-sm text-foreground">{activity.item}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  {activity.amount && (
                    <p className="font-bold text-primary">{activity.amount}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Account Options */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 text-foreground">Account</h2>
        <Card>
          <CardContent className="p-0">
            {accountOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.label}
                  className={`flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer ${
                    index !== accountOptions.length - 1 ? "border-b border-border" : ""
                  }`}
                  onClick={() => {
                    if (option.label === "Settings") {
                      navigate("/settings");
                    } else if (option.label === "Notifications") {
                      navigate("/notifications");
                    } else if (option.label === "My Listings") {
                      navigate("/my-listings");
                    } else if (option.label === "Cart") {
                      navigate("/cart");
                    } else if (option.label === "Favorites") {
                      navigate("/favorites");
                    } else if (option.label === "Privacy & Security") {
                      navigate("/privacy-security");
                    }
                  }}
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="flex-1 font-medium text-foreground">{option.label}</span>
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
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>

      {/* Followers Dialog */}
      <Dialog open={showFollowers} onOpenChange={setShowFollowers}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Followers (1.2K)</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {followers.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar 
                  className="w-10 h-10 cursor-pointer"
                  onClick={() => {
                    setShowFollowers(false);
                    navigate(`/seller/${user.username.slice(1)}`);
                  }}
                >
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.username.slice(1, 3).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    setShowFollowers(false);
                    navigate(`/seller/${user.username.slice(1)}`);
                  }}
                >
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.username}</p>
                </div>
                <Button 
                  variant={user.isFollowing ? "outline" : "default"} 
                  size="sm"
                  className="h-8"
                >
                  {user.isFollowing ? "Following" : "Follow"}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Following Dialog */}
      <Dialog open={showFollowing} onOpenChange={setShowFollowing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Following (345)</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {following.map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar 
                  className="w-10 h-10 cursor-pointer"
                  onClick={() => {
                    setShowFollowing(false);
                    navigate(`/seller/${user.username.slice(1)}`);
                  }}
                >
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.username.slice(1, 3).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    setShowFollowing(false);
                    navigate(`/seller/${user.username.slice(1)}`);
                  }}
                >
                  <p className="font-medium text-foreground">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.username}</p>
                </div>
                <Button variant="outline" size="sm" className="h-8">
                  Following
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

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