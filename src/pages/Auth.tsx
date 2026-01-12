import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
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

      // Session is always persisted in localStorage by Supabase client

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
    <div className="min-h-screen bg-background">
      <div className="flex items-center p-4 border-b">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => navigate("/")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold ml-4">Sign In</h1>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="identifier">Email or Username</Label>
          <Input
            id="identifier"
            type="text"
            placeholder="Enter your email or username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pr-12"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label
              htmlFor="remember"
              className="text-sm font-normal cursor-pointer"
            >
              Remember me
            </Label>
          </div>
          <Button
            variant="link"
            className="text-sm text-muted-foreground p-0 h-auto"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </Button>
        </div>

        <Button
          variant="reown"
          size="lg"
          className="w-full"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-primary"
              onClick={() => navigate("/create-account")}
            >
              Sign Up
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
