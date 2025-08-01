import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"credentials" | "otp" | "password">("credentials");
  const [identifier, setIdentifier] = useState("");
  const [identifierType, setIdentifierType] = useState<"email" | "phone" | "username">("email");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const detectIdentifierType = (value: string) => {
    if (value.includes("@")) {
      setIdentifierType("email");
    } else if (/^\d+$/.test(value)) {
      setIdentifierType("phone");
    } else {
      setIdentifierType("username");
    }
  };

  const handleSendCode = () => {
    if (identifier.trim()) {
      setStep("otp");
    }
  };

  const handleVerifyOtp = () => {
    if (otp.trim()) {
      setStep("password");
    }
  };

  const handleResetPassword = () => {
    if (newPassword && newPassword === confirmPassword) {
      // Navigate to auth page or show success
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center p-4 border-b">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            if (step === "credentials") {
              navigate("/auth");
            } else if (step === "otp") {
              setStep("credentials");
            } else {
              setStep("otp");
            }
          }}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-semibold ml-4">
          {step === "credentials" && "Reset Password"}
          {step === "otp" && "Verify Code"}
          {step === "password" && "New Password"}
        </h1>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-6">
        {step === "credentials" && (
          <>
            <div className="text-center mb-6">
              <p className="text-muted-foreground">
                Enter your email, phone number, or username to receive a verification code
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="identifier">Email, Phone, or Username</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="Enter your email, phone, or username"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  detectIdentifierType(e.target.value);
                }}
                className="h-12"
              />
              {identifier && (
                <p className="text-xs text-muted-foreground">
                  We'll send the code to your {identifierType}
                </p>
              )}
            </div>

            <Button
              variant="reown"
              size="lg"
              className="w-full"
              onClick={handleSendCode}
              disabled={!identifier.trim()}
            >
              Send Verification Code
            </Button>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="text-center mb-6">
              <p className="text-muted-foreground">
                We've sent a verification code to your {identifierType}
              </p>
              <p className="text-sm font-medium mt-2">{identifier}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">Enter Verification Code</Label>
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
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6}
            >
              Verify Code
            </Button>

            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => setStep("credentials")}
                className="text-sm"
              >
                Didn't receive code? Try different method
              </Button>
            </div>
          </>
        )}

        {step === "password" && (
          <>
            <div className="text-center mb-6">
              <p className="text-muted-foreground">
                Create a new password for your account
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <Button
              variant="reown"
              size="lg"
              className="w-full"
              onClick={handleResetPassword}
              disabled={!newPassword || newPassword !== confirmPassword}
            >
              Reset Password
            </Button>

            <div className="text-center">
              <Button 
                variant="link"
                onClick={() => navigate("/auth")}
                className="text-sm"
              >
                Skip for now and continue
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;