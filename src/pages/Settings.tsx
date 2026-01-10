import { ArrowLeft, Bell, Globe, Moon, Smartphone, Mail, ChevronRight, Palette, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, language, setLanguage, t } = useTheme();
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    phoneNotifications: false,
    pushNotifications: true
  });

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇧🇷' },
    { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success("Setting updated");
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate('/');
  };

  const currentLanguage = languages.find(lang => lang.code === language);

  // Mobile View
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
          <div className="flex items-center gap-3 p-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold">{t("Settings")}</h1>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Appearance Section */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Appearance</h2>
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0 divide-y divide-border/50">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Moon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{t("Dark Mode")}</p>
                      <p className="text-xs text-muted-foreground">Switch theme appearance</p>
                    </div>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
                </div>
                
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer active:bg-muted/50"
                  onClick={() => setShowLanguageDialog(true)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{t("Language")}</p>
                      <p className="text-xs text-muted-foreground">{currentLanguage?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{currentLanguage?.flag}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notifications Section */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Notifications</h2>
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0 divide-y divide-border/50">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">{t("Email Notifications")}</p>
                      <p className="text-xs text-muted-foreground">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.emailNotifications} 
                    onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">Get instant alerts</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.pushNotifications} 
                    onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">{t("Phone Notifications")}</p>
                      <p className="text-xs text-muted-foreground">Receive SMS alerts</p>
                    </div>
                  </div>
                  <Switch 
                    checked={settings.phoneNotifications} 
                    onCheckedChange={(checked) => updateSetting("phoneNotifications", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Account Section */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Account</h2>
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-0">
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer active:bg-muted/50"
                  onClick={() => navigate('/privacy-security')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium">Privacy & Security</p>
                      <p className="text-xs text-muted-foreground">Manage your account security</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sign Out */}
          {user && (
            <Card className="border-0 shadow-lg bg-destructive/5 overflow-hidden">
              <CardContent className="p-0">
                <button 
                  className="w-full flex items-center gap-3 p-4 text-destructive"
                  onClick={handleSignOut}
                >
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <span className="font-medium">Sign Out</span>
                </button>
              </CardContent>
            </Card>
          )}

          {/* App Info */}
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-primary-foreground">R</span>
            </div>
            <h3 className="font-bold text-lg">ReOwn</h3>
            <p className="text-xs text-muted-foreground">Version 1.0.0</p>
            <p className="text-xs text-muted-foreground mt-1">Made with ❤️ for the community</p>
          </div>
        </div>

        {/* Language Selection Dialog */}
        <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("Language")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-1">
              {languages.map((lang) => (
                <Button
                  key={lang.code}
                  variant={language === lang.code ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => {
                    setLanguage(lang.code as any);
                    setShowLanguageDialog(false);
                    toast.success(`Language changed to ${lang.name}`);
                  }}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Desktop View
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b">
        <div className="max-w-4xl mx-auto flex items-center gap-4 p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{t("Settings")}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 grid md:grid-cols-2 gap-6">
        {/* Appearance */}
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Appearance</h2>
                <p className="text-sm text-muted-foreground">Customize your experience</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{t("Dark Mode")}</p>
                    <p className="text-xs text-muted-foreground">Toggle dark theme</p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              </div>
              
              <div 
                className="flex items-center justify-between p-4 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => setShowLanguageDialog(true)}
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{t("Language")}</p>
                    <p className="text-xs text-muted-foreground">{currentLanguage?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentLanguage?.flag}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Bell className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Notifications</h2>
                <p className="text-sm text-muted-foreground">Manage your alerts</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">{t("Email Notifications")}</p>
                    <p className="text-xs text-muted-foreground">Updates via email</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.emailNotifications} 
                  onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Instant alerts</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.pushNotifications} 
                  onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Sign Out */}
        <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm md:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Account</h2>
                <p className="text-sm text-muted-foreground">Security & account settings</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate('/privacy-security')}
              >
                <Shield className="h-4 w-4 mr-2" />
                Privacy & Security
              </Button>
              {user && (
                <Button 
                  variant="destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 to-primary/5 md:col-span-2">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-primary-foreground">R</span>
            </div>
            <h3 className="font-bold text-xl">ReOwn</h3>
            <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            <p className="text-sm text-muted-foreground mt-1">Made with ❤️ for the community</p>
          </CardContent>
        </Card>
      </div>

      {/* Language Selection Dialog */}
      <Dialog open={showLanguageDialog} onOpenChange={setShowLanguageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("Language")}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={language === lang.code ? "secondary" : "ghost"}
                className="justify-start gap-3 h-12"
                onClick={() => {
                  setLanguage(lang.code as any);
                  setShowLanguageDialog(false);
                  toast.success(`Language changed to ${lang.name}`);
                }}
              >
                <span className="text-xl">{lang.flag}</span>
                <span>{lang.name}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;