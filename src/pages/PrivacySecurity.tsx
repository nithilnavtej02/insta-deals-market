import { ArrowLeft, Shield, Lock, Eye, Bell, Smartphone, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const PrivacySecurity = () => {
  const navigate = useNavigate();

  const privacySettings = [
    {
      title: "Account Security",
      items: [
        { label: "Two-Factor Authentication", icon: Key, type: "switch", enabled: true },
        { label: "Login Alerts", icon: Bell, type: "switch", enabled: true },
        { label: "Device Management", icon: Smartphone, type: "link" },
      ]
    },
    {
      title: "Privacy Controls",
      items: [
        { label: "Show Online Status", icon: Eye, type: "switch", enabled: false },
        { label: "Profile Visibility", icon: Shield, type: "link", value: "Public" },
        { label: "Contact Information", icon: Lock, type: "link", value: "Friends Only" },
      ]
    },
    {
      title: "Data & Analytics",
      items: [
        { label: "Usage Analytics", icon: Eye, type: "switch", enabled: true },
        { label: "Personalized Ads", icon: Bell, type: "switch", enabled: false },
        { label: "Data Download", icon: Shield, type: "link" },
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
          <h1 className="text-xl font-semibold">Privacy & Security</h1>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="p-4 space-y-6">
        {privacySettings.map((group) => (
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

      {/* Security Tips */}
      <div className="p-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Security Tips</h3>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use a strong, unique password</li>
              <li>• Enable two-factor authentication</li>
              <li>• Keep your app updated</li>
              <li>• Be cautious with personal information</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacySecurity;