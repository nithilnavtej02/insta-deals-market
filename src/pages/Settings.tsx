import { ArrowLeft, Bell, Shield, Globe, Moon, Eye, Lock, Smartphone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  const settingsGroups = [
    {
      title: "Account",
      items: [
        { label: "Email Notifications", icon: Mail, type: "switch", enabled: true },
        { label: "Phone Notifications", icon: Smartphone, type: "switch", enabled: false },
        { label: "Two-Factor Authentication", icon: Lock, type: "link" },
      ]
    },
    {
      title: "Privacy",
      items: [
        { label: "Show Activity Status", icon: Eye, type: "switch", enabled: true },
        { label: "Anonymous Mode", icon: Shield, type: "switch", enabled: false },
        { label: "Privacy Policy", icon: Shield, type: "link" },
      ]
    },
    {
      title: "Preferences",
      items: [
        { label: "Dark Mode", icon: Moon, type: "switch", enabled: false },
        { label: "Language", icon: Globe, type: "link", value: "English" },
        { label: "Push Notifications", icon: Bell, type: "switch", enabled: true },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="p-4 space-y-6">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-lg font-semibold mb-3">{group.title}</h2>
            <Card>
              <CardContent className="p-0">
                {group.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-3 p-4 ${
                        index !== group.items.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="flex-1 font-medium">{item.label}</span>
                      
                      {item.type === "switch" && (
                        <Switch checked={item.enabled} />
                      )}
                      
                      {item.type === "link" && (
                        <div className="flex items-center gap-2">
                          {item.value && (
                            <span className="text-sm text-muted-foreground">{item.value}</span>
                          )}
                          <span className="text-muted-foreground">›</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* App Info */}
      <div className="px-4 py-6">
        <Card>
          <CardContent className="p-4 text-center">
            <h3 className="font-semibold mb-2">ReOwn</h3>
            <p className="text-sm text-muted-foreground mb-1">Version 1.0.0</p>
            <p className="text-xs text-muted-foreground">Made with ❤️ for the community</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;