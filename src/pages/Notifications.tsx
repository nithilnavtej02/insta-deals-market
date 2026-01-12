import { useEffect } from "react";
import { ArrowLeft, Bell, CheckCheck, Trash2, Package, Heart, MessageCircle, UserPlus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatDistanceToNow } from "date-fns";
import LoadingLogo from "@/components/LoadingLogo";

const Notifications = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  // Redirect to auth if not logged in - using useEffect to avoid render issues
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingLogo size="md" text="Loading..." />
      </div>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_order':
      case 'order_update':
        return <Package className="h-5 w-5 text-green-500" />;
      case 'new_message':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'new_follower':
        return <UserPlus className="h-5 w-5 text-purple-500" />;
      case 'new_like':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'new_review':
        return <Star className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'new_order':
      case 'order_update':
        return 'bg-green-500/10';
      case 'new_message':
        return 'bg-blue-500/10';
      case 'new_follower':
        return 'bg-purple-500/10';
      case 'new_like':
        return 'bg-red-500/10';
      case 'new_review':
        return 'bg-yellow-500/10';
      default:
        return 'bg-primary/10';
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <LoadingLogo size="md" text="Loading notifications..." />
      </div>
    );
  }

  // Mobile View
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold">Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-xs text-primary">{unreadCount} unread</p>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-primary">
                <CheckCheck className="h-4 w-4 mr-1" />
                Read all
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Bell className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="font-bold text-lg mb-2">No notifications yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                You'll see notifications about orders, messages, and more here
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`border-0 shadow-md overflow-hidden cursor-pointer transition-all ${
                  !notification.read_at 
                    ? 'bg-primary/5 shadow-lg' 
                    : 'bg-card/80 backdrop-blur-sm'
                }`}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.action_url) {
                    navigate(notification.action_url);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className={`w-12 h-12 rounded-full ${getIconBgColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm line-clamp-2 ${!notification.read_at ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </p>
                        {!notification.read_at && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      {notification.content && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{notification.content}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  // Desktop View
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-3xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-primary">{unreadCount} unread notifications</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        {notifications.length === 0 ? (
          <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
            <CardContent className="py-20 text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <Bell className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-2xl font-bold mb-3">No notifications yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                You'll see notifications about your orders, messages, followers, and more here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`border-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all ${
                  !notification.read_at 
                    ? 'bg-primary/5 ring-1 ring-primary/20' 
                    : 'bg-card/80 backdrop-blur-sm'
                }`}
                onClick={() => {
                  markAsRead(notification.id);
                  if (notification.action_url) {
                    navigate(notification.action_url);
                  }
                }}
              >
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className={`w-14 h-14 rounded-xl ${getIconBgColor(notification.type)} flex items-center justify-center flex-shrink-0`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className={`text-base ${!notification.read_at ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </p>
                          {notification.content && (
                            <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.read_at && (
                          <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;