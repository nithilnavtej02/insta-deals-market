import { ArrowLeft, Bell, Heart, MessageCircle, Package, Star, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, loading, markAsRead } = useNotifications();

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading notifications...</div>
      </div>
    );
  }

  const dummyNotifications = [
    {
      id: 1,
      type: "like",
      icon: Heart,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      user: "@techseller_NY",
      message: "liked your iPhone 14 Pro listing",
      time: "2 minutes ago",
      avatar: "/api/placeholder/40/40",
      unread: true
    },
    {
      id: 2,
      type: "message",
      icon: MessageCircle,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      user: "@fashionista_23",
      message: "sent you a message about Vintage Leather Jacket",
      time: "15 minutes ago",
      avatar: "/api/placeholder/40/40",
      unread: true
    },
    {
      id: 3,
      type: "follow",
      icon: UserPlus,
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
      user: "@vintage_lover",
      message: "started following you",
      time: "1 hour ago",
      avatar: "/api/placeholder/40/40",
      unread: false
    },
    {
      id: 4,
      type: "sale",
      icon: Package,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
      user: "ReOwn",
      message: "Your MacBook Air M2 has been sold!",
      time: "2 hours ago",
      avatar: "/api/placeholder/40/40",
      unread: false
    },
    {
      id: 5,
      type: "review",
      icon: Star,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-50",
      user: "@apple_reseller",
      message: "left you a 5-star review",
      time: "3 hours ago",
      avatar: "/api/placeholder/40/40",
      unread: false
    },
    {
      id: 6,
      type: "like",
      icon: Heart,
      iconColor: "text-red-500",
      bgColor: "bg-red-50",
      user: "@gamer_hub",
      message: "liked your Gaming Chair listing",
      time: "4 hours ago",
      avatar: "/api/placeholder/40/40",
      unread: false
    },
    {
      id: 7,
      type: "message",
      icon: MessageCircle,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      user: "@book_collector",
      message: "asked about your rare book collection",
      time: "1 day ago",
      avatar: "/api/placeholder/40/40",
      unread: false
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Notifications</h1>
          </div>
          <Button variant="ghost" size="sm" className="text-primary">
            Mark all read
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y">
        {(notifications.length > 0 ? notifications : dummyNotifications).map((notification) => {
          const Icon = notification.icon;
          return (
            <div
              key={notification.id}
              className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                notification.unread ? "bg-primary/5" : ""
              }`}
              onClick={() => {
                if (notification.type === "message") {
                  navigate(`/chat/${notification.id}`);
                } else if (notification.type === "follow") {
                  navigate(`/seller/${notification.user.slice(1)}`);
                } else if (notification.type === "like") {
                  navigate('/my-listings');
                } else if (notification.type === "review") {
                  navigate('/reviews');
                }
              }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full ${notification.bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-5 w-5 ${notification.iconColor}`} />
                </div>

                {/* Avatar */}
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={notification.avatar} />
                  <AvatarFallback>{notification.user.slice(1, 3).toUpperCase()}</AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium text-primary">{notification.user}</span>
                        {" "}
                        <span className="text-muted-foreground">{notification.message}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                    {notification.unread && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;