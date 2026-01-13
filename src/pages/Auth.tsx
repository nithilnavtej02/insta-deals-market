import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Eye, EyeOff, ShoppingBag, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      let emailToUse = identifier.trim();

      // Check if input is NOT an email (no @ symbol) - treat as username
      if (!identifier.includes("@")) {
        // Look up email by username (case-insensitive)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .ilike('username', identifier.trim())
          .single();

        if (profileError || !profileData?.email) {
          toast.error("Username not found. Please try with your email address.");
          setLoading(false);
          return;
        }
        emailToUse = profileData.email;
      }

      const { data, error } = await signIn(emailToUse, password);

      if (error) {
        if (error.message.includes('Invalid login')) {
          toast.error("Invalid credentials");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success("Successfully signed in!");
        navigate("/home");
      }
    } catch {
      toast.error("An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary-foreground/20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <motion.div 
          className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-2xl backdrop-blur-sm"
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="text-white hover:bg-white/10 rounded-full"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="relative z-10 px-6 pt-8 pb-12">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl mb-4 shadow-xl border border-white/20">
            <ShoppingBag className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/70">Sign in to continue to ReOwn</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="max-w-md mx-auto backdrop-blur-xl bg-white/95 border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-medium">Email or Username</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter your email or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full hover:bg-muted"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="rounded"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal cursor-pointer text-muted-foreground"
                  >
                    Remember me
                  </Label>
                </div>
                <Button
                  variant="link"
                  className="text-sm text-primary p-0 h-auto"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </Button>
              </div>

              <Button
                size="lg"
                className="w-full h-12 rounded-xl font-semibold text-base"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary font-semibold"
                    onClick={() => navigate("/create-account")}
                  >
                    Sign Up
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div 
          className="flex items-center justify-center gap-4 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <Sparkles className="h-4 w-4" />
            <span>Secure Login</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <Sparkles className="h-4 w-4" />
            <span>Easy Access</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
