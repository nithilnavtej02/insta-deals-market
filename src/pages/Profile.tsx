import { Heart, MessageCircle, Package, Star, Settings, Shield, Bell, LogOut, MapPin, Edit, User, ShoppingCart, ClipboardList, Plus, Camera, Award, TrendingUp } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import BottomNavigation from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useFollows } from "@/hooks/useFollows";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { getRandomAvatarEmoji } from "@/utils/randomStats";
import { useIsMobile } from "@/hooks/use-mobile";

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { following: followingList } = useFollows();
  const { cartItems, getCartItemCount } = useCart();
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
  const isMobile = useIsMobile();

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
    if (!profile) return;
    
    const fetchFollowers = async () => {
      try {
        const { data, error } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', profile.id);
        
        if (error) throw error;

        const followerIds = (data || []).map(f => f.follower_id);
        if (followerIds.length > 0) {
          const { data: followerProfiles } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url, verified')
            .in('id', followerIds);
          
          setFollowers(followerProfiles || []);
        } else {
          setFollowers([]);
        }
      } catch (error) {
        console.error('Error fetching followers:', error);
      }
    };

    const fetchFollowing = async () => {
      try {
        const { data, error } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', profile.id);
        
        if (error) throw error;

        const followingIds = (data || []).map(f => f.following_id);
        if (followingIds.length > 0) {
          const { data: followingProfiles } = await supabase
            .from('profiles')
            .select('id, username, display_name, avatar_url, verified')
            .in('id', followingIds);
          
          setFollowing(followingProfiles || []);
        } else {
          setFollowing([]);
        }
      } catch (error) {
        console.error('Error fetching following:', error);
      }
    };

    const fetchRecentActivity = async () => {
      try {
        setRecentActivity([]);
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      }
    };

    fetchFollowers();
    fetchFollowing();
    fetchRecentActivity();
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

  const openAvatarPicker = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && profile && user) {
        try {
          const fileExt = file.name.split('.').pop();
          const path = `${user.id}/avatar.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, file, { upsert: true, contentType: file.type });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(path);

          await updateProfile({ avatar_url: publicUrl });
          toast.success('Profile picture updated!');
        } catch (error) {
          console.error('Error uploading avatar:', error);
          toast.error('Failed to upload profile picture');
        }
      }
    };
    input.click();
  };

  const handleAccountOptionClick = (label: string) => {
    switch(label) {
      case 'Cart': navigate('/cart'); break;
      case 'Favorites': navigate('/favorites'); break;
      case 'Notifications': navigate('/notifications'); break;
      case 'Settings': navigate('/settings'); break;
      case 'Privacy & Security': navigate('/privacy-security'); break;
      case 'My Listings': navigate('/my-listings'); break;
      case 'My Orders': navigate('/my-orders'); break;
      case 'Buy Orders': navigate('/buy-orders'); break;
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
    { label: "Buy Orders", icon: ClipboardList, count: null },
    { label: "My Orders", icon: ClipboardList, count: null },
    { label: "Cart", icon: ShoppingCart, count: getCartItemCount() },
    { label: "Favorites", icon: Heart, count: null },
    { label: "Notifications", icon: Bell, count: null },
    { label: "Privacy & Security", icon: Shield, count: null },
    { label: "Settings", icon: Settings, count: null }
  ];

  // Dialogs - shared between mobile and desktop
  const renderDialogs = () => (
    <>
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
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Tell us about yourself..."
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Your city"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Your phone number"
              />
            </div>
            <Button onClick={handleUpdateProfile} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

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
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="@username"
              />
            </div>
            <div>
              <Label htmlFor="display_name">Display Name</Label>
              <Input 
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                placeholder="Your name"
              />
            </div>
            <Button onClick={handleUpdateName} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFollowers} onOpenChange={setShowFollowers}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Followers ({followers.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {followers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No followers yet</p>
            ) : (
              followers.map((follower) => (
                <div key={follower.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={follower.avatar_url || undefined} />
                      <AvatarFallback>{follower.username?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{follower.display_name || follower.username || 'User'}</p>
                      <p className="text-sm text-muted-foreground">@{follower.username || 'unknown'}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Remove</Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFollowing} onOpenChange={setShowFollowing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Following ({following.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {following.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Not following anyone yet</p>
            ) : (
              following.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>{user.username?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.display_name || user.username || 'User'}</p>
                      <p className="text-sm text-muted-foreground">@{user.username || 'unknown'}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Unfollow</Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );

  // Mobile View - Keep existing design
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-background px-4 py-6 relative">
          <div className="flex items-start gap-3 mb-4 relative">
            <Avatar 
              className="w-20 h-20 cursor-pointer relative"
              onClick={openAvatarPicker}
            >
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary text-white text-lg">
                {profile?.avatar_url ? 
                  ((profile?.display_name && profile.display_name.slice(0, 2)) || 
                   (profile?.username && profile.username.slice(0, 2)) || 'U') : 
                  getRandomAvatarEmoji(profile?.username || 'user')
                }
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-base font-semibold">@{profile?.username || 'user'}</h1>
              <p className="text-xl font-bold text-foreground">{profile?.display_name || 'User'}</p>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{profile?.location || 'Location not set'}</span>
              </div>
            </div>

            {profile?.verified && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs border-green-500 text-green-600 hover:bg-green-50 rounded-full"
              >
                ✓ Verified
              </Button>
            )}

            <Button
              onClick={openAvatarPicker}
              size="icon"
              aria-label="Change profile picture"
              className="absolute -bottom-2 left-14 rounded-full w-7 h-7 shadow-lg bg-primary hover:bg-primary/90 z-10"
            >
              <Plus className="h-3 w-3 text-white" />
            </Button>
          </div>

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

          <div className="flex items-center gap-3 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowFollowers(true)} 
              className="flex-1 h-11 rounded-full border-primary/20"
            >
              <span className="text-primary font-semibold">Followers</span>
            </Button>
            <Button 
              onClick={() => setShowFollowing(true)} 
              className="flex-1 h-11 rounded-full bg-primary hover:bg-primary/90"
            >
              <span className="text-white font-semibold">Following</span>
            </Button>
          </div>

          <div className="flex items-center gap-6 mt-6 text-center justify-center">
            <div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{profile?.items_sold || 0}</p>
              <p className="text-xs text-muted-foreground">Items Sold</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{profile?.rating ? profile.rating.toFixed(1) : '0.0'}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold">{profile?.total_reviews || 0}</p>
              <p className="text-xs text-muted-foreground">Reviews</p>
            </div>
          </div>

          {renderDialogs()}
        </div>

        <div className="px-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Cart</h2>
          <Card onClick={() => navigate('/cart')} className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="py-6">
              {cartItems.length === 0 ? (
                <div className="text-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground mb-2">Your cart is empty</p>
                  <Button size="sm" variant="outline" onClick={(e) => {
                    e.stopPropagation();
                    navigate('/home');
                  }}>Start Shopping</Button>
                </div>
              ) : (
                <div className="text-center">
                  <ShoppingCart className="h-12 w-12 text-primary mx-auto mb-2" />
                  <p className="font-medium">{getCartItemCount()} items in cart</p>
                  <Button size="sm" className="mt-2">View Cart</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="px-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No recent activity</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((activity, i) => (
                <Card key={i}>
                  <CardContent className="py-3">
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="px-4">
          <h2 className="text-lg font-semibold mb-3">Account</h2>
          <div className="space-y-2">
            {accountOptions.map((option) => (
              <Card 
                key={option.label}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleAccountOptionClick(option.label)}
              >
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <option.icon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  {option.count !== null && option.count > 0 && (
                    <Badge variant="secondary">{option.count}</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="px-4 mt-6 mb-8">
          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <BottomNavigation />
      </div>
    );
  }

  // Desktop View - Professional Dashboard Layout
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account and view your activity</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Profile Card */}
          <div className="col-span-4 space-y-6">
            {/* Profile Card */}
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-primary to-primary-dark relative">
                <div className="absolute top-4 right-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShowEditProfile(true)}>
                        <User className="h-4 w-4 mr-2" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowEditName(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Name
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardContent className="pt-0 -mt-12 text-center">
                <div className="relative inline-block">
                  <Avatar 
                    className="w-24 h-24 border-4 border-background cursor-pointer shadow-lg"
                    onClick={openAvatarPicker}
                  >
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-white text-2xl">
                      {profile?.avatar_url ? 
                        ((profile?.display_name && profile.display_name.slice(0, 2)) || 
                         (profile?.username && profile.username.slice(0, 2)) || 'U') : 
                        getRandomAvatarEmoji(profile?.username || 'user')
                      }
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    onClick={openAvatarPicker}
                    size="icon"
                    className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 shadow-lg bg-primary hover:bg-primary/90"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </Button>
                </div>

                <h2 className="text-xl font-bold mt-4">{profile?.display_name || 'User'}</h2>
                <p className="text-primary font-medium">@{profile?.username || 'user'}</p>
                
                {profile?.verified && (
                  <Badge className="mt-2 bg-green-100 text-green-700 hover:bg-green-100">
                    <Award className="h-3 w-3 mr-1" />
                    Verified Seller
                  </Badge>
                )}

                <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profile?.location || 'Location not set'}</span>
                </div>

                {profile?.bio && (
                  <p className="text-sm text-muted-foreground mt-4 px-4">{profile.bio}</p>
                )}

                <Separator className="my-4" />

                <div className="flex justify-center gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowFollowers(true)}
                    className="flex flex-col h-auto py-2"
                  >
                    <span className="text-2xl font-bold text-foreground">{followers.length}</span>
                    <span className="text-xs text-muted-foreground">Followers</span>
                  </Button>
                  <Separator orientation="vertical" className="h-12" />
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowFollowing(true)}
                    className="flex flex-col h-auto py-2"
                  >
                    <span className="text-2xl font-bold text-foreground">{following.length}</span>
                    <span className="text-xs text-muted-foreground">Following</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">Items Sold</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{profile?.items_sold || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Star className="h-5 w-5 text-yellow-500" />
                    </div>
                    <span className="font-medium">Rating</span>
                  </div>
                  <span className="text-2xl font-bold">{profile?.rating ? profile.rating.toFixed(1) : '0.0'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium">Reviews</span>
                  </div>
                  <span className="text-2xl font-bold">{profile?.total_reviews || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Logout */}
            <Button 
              variant="outline" 
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Right Column - Account Options & Activity */}
          <div className="col-span-8 space-y-6">
            {/* Cart Overview */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Shopping Cart
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <div className="flex items-center justify-between py-4">
                    <p className="text-muted-foreground">Your cart is empty</p>
                    <Button variant="outline" onClick={() => navigate('/home')}>
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{getCartItemCount()} items in your cart</p>
                      <p className="text-sm text-muted-foreground">Ready for checkout</p>
                    </div>
                    <Button onClick={() => navigate('/cart')}>View Cart</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Options Grid */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Account & Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {accountOptions.map((option) => (
                    <button 
                      key={option.label}
                      className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-all text-left group"
                      onClick={() => handleAccountOptionClick(option.label)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                          <option.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <span className="font-medium">{option.label}</span>
                      </div>
                      {option.count !== null && option.count > 0 && (
                        <Badge className="bg-primary">{option.count}</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No recent activity to display</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity, i) => (
                      <div key={i} className="p-3 rounded-lg border">
                        {/* Activity content */}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {renderDialogs()}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Profile;
