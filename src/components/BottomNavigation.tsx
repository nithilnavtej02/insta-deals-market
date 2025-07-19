import { Home, Play, Plus, MessageCircle, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Play, label: "Reels", path: "/reels" },
    { icon: Plus, label: "Sell", path: "/sell" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isSell = item.path === "/sell";

          return (
            <Button
              key={item.path}
              variant="ghost"
              size="icon"
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center h-16 w-16 gap-1",
                isSell && "bg-primary text-white rounded-full hover:bg-primary/90"
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6",
                  isActive && !isSell && "text-primary",
                  !isActive && !isSell && "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive && !isSell && "text-primary",
                  !isActive && !isSell && "text-muted-foreground",
                  isSell && "text-white"
                )}
              >
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;