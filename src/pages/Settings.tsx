import { ArrowLeft, Bell, Shield, Globe, Moon, Eye, Lock, Smartphone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

const Settings = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, language, setLanguage, t } = useTheme();
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    phoneNotifications: false,
    showActivityStatus: true,
    anonymousMode: false,
    pushNotifications: true
  });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ta', name: 'தமிழ்' }
  ];

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const currentLanguageName = languages.find(lang => lang.code === language)?.name || 'English';

  const settingsGroups = [
    {
      title: t("Account"),
      items: [
        { label: t("Email Notifications"), icon: Mail, type: "switch", enabled: settings.emailNotifications, key: "emailNotifications" },
        { label: t("Phone Notifications"), icon: Smartphone, type: "switch", enabled: settings.phoneNotifications, key: "phoneNotifications" },
        { label: "Two-Factor Authentication", icon: Lock, type: "link" },
      ]
    },
    {
      title: "Privacy",
      items: [
        { label: "Show Activity Status", icon: Eye, type: "switch", enabled: settings.showActivityStatus, key: "showActivityStatus" },
        { label: "Anonymous Mode", icon: Shield, type: "switch", enabled: settings.anonymousMode, key: "anonymousMode" },
        { label: "Privacy Policy", icon: Shield, type: "link" },
      ]
    },
    {
      title: "Preferences",
      items: [
        { label: t("Dark Mode"), icon: Moon, type: "switch", enabled: darkMode, key: "darkMode", action: toggleDarkMode },
        { label: t("Language"), icon: Globe, type: "link", value: currentLanguageName, action: () => setShowLanguageDialog(true) },
        { label: "Push Notifications", icon: Bell, type: "switch", enabled: settings.pushNotifications, key: "pushNotifications" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">{t("Settings")}</h1>
        </div>
      </div>

      {/* Settings Groups */}
      <div className="p-4 space-y-6">
        {settingsGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-lg font-semibold mb-3 text-foreground">{group.title}</h2>
            <Card>
              <CardContent className="p-0">
                {group.items.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-3 p-4 ${
                        index !== group.items.length - 1 ? "border-b border-border" : ""
                      }`}
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="flex-1 font-medium text-foreground">{item.label}</span>
                      
                      {item.type === "switch" && (
                        <Switch 
                          checked={item.enabled} 
                          onCheckedChange={(checked) => {
                            if (item.action) {
                              item.action();
                            } else if (item.key) {
                              updateSetting(item.key, checked);
                            }
                          }}
                        />
                      )}
                      
                      {item.type === "link" && (
                        <div 
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={item.action}
                        >
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

      {/* Language Selection Dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Language")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={language === lang.code ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setLanguage(lang.code as any);
                  setShowLanguageDialog(false);
                }}
              >
                {lang.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;