import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!isOtpStep) {
      if (!email || !password) {
        toast.error("Please fill in all fields");
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await signIn(email, password);
        
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setIsOtpStep(true);
            toast.info("Please check your email for confirmation");
          } else {
            toast.error(error.message);
          }
        } else if (data.user) {
          toast.success("Successfully signed in!");
          navigate("/home");
        }
      } catch (error) {
        toast.error("An error occurred during sign in");
      } finally {
        setLoading(false);
      }
    } else {
      // Handle OTP verification here if needed
      toast.info("Please check your email and click the confirmation link");
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
        <h1 className="text-xl font-semibold ml-4">
          {isOtpStep ? "Verify OTP" : "Sign In"}
        </h1>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-6">
        {!isOtpStep ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email or Phone</Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter your email or phone number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <Button
              variant="reown"
              size="lg"
              className="w-full"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </>
        ) : (
          <>
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                We've sent a verification code to {email}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="h-12 text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            <Button
              variant="reown"
              size="lg"
              className="w-full"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Sign In"}
            </Button>

            <div className="text-center">
              <Button variant="link" onClick={() => navigate('/forgot-password')}>
                Didn't receive code? Resend
              </Button>
            </div>
          </>
        )}

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