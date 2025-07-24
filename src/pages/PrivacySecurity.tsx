import { ArrowLeft, Shield, Lock, Eye, Bell, Smartphone, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const PrivacySecurity = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    twoFactor: true,
    loginAlerts: true,
    onlineStatus: false,
    usageAnalytics: true,
    personalizedAds: false
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const privacySettings = [
    {
      title: "Account Security",
      items: [
        { label: "Two-Factor Authentication", icon: Key, type: "switch", enabled: settings.twoFactor, key: "twoFactor" },
        { label: "Login Alerts", icon: Bell, type: "switch", enabled: settings.loginAlerts, key: "loginAlerts" },
        { label: "Device Management", icon: Smartphone, type: "link" },
      ]
    },
    {
      title: "Privacy Controls",
      items: [
        { label: "Show Online Status", icon: Eye, type: "switch", enabled: settings.onlineStatus, key: "onlineStatus" },
        { label: "Profile Visibility", icon: Shield, type: "link", value: "Public" },
        { label: "Contact Information", icon: Lock, type: "link", value: "Friends Only" },
      ]
    },
    {
      title: "Data & Analytics",
      items: [
        { label: "Usage Analytics", icon: Eye, type: "switch", enabled: settings.usageAnalytics, key: "usageAnalytics" },
        { label: "Personalized Ads", icon: Bell, type: "switch", enabled: settings.personalizedAds, key: "personalizedAds" },
        { label: "Data Download", icon: Shield, type: "link" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background px-4 py-3 border-b">
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
                        <Switch 
                          checked={item.enabled} 
                          onCheckedChange={(checked) => item.key && updateSetting(item.key, checked)}
                        />
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

      {/* Privacy Policy & Terms */}
      <div className="p-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-foreground">Privacy Policy & Terms</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-foreground mb-2">Data Collection</h4>
                <p>We collect information to provide better services to our users. This includes basic account information, usage data, and communication preferences.</p>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-foreground mb-2">Information Sharing</h4>
                <p>We do not sell personal information to third parties. We may share anonymized data for analytics and improvement purposes only with your consent.</p>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-foreground mb-2">Data Retention</h4>
                <p>Your data is retained as long as your account is active. You can request data deletion at any time by contacting our support team.</p>
              </div>
              <div className="border rounded-lg p-3">
                <h4 className="font-medium text-foreground mb-2">Security Measures</h4>
                <p>We use industry-standard encryption and security measures to protect your data. All payments are processed securely through trusted payment providers.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Requests */}
      <div className="p-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 text-foreground">Data Requests</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start text-foreground"
                onClick={() => alert("Data download request submitted. You'll receive an email with your data within 7 days.")}
              >
                Download My Data
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => alert("Account deletion request submitted. Please contact support to complete this process.")}
              >
                Delete My Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Tips */}
      <div className="p-4">
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Security Tips</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
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