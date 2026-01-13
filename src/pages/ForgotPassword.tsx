import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Eye, EyeOff, KeyRound, Mail, Lock } from "lucide-react";
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
      navigate("/auth");
    }
  };

  const getStepIcon = () => {
    switch (step) {
      case "credentials":
        return <Mail className="h-8 w-8 text-white" />;
      case "otp":
        return <KeyRound className="h-8 w-8 text-white" />;
      case "password":
        return <Lock className="h-8 w-8 text-white" />;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case "credentials":
        return "Reset Password";
      case "otp":
        return "Verify Code";
      case "password":
        return "New Password";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "credentials":
        return "Enter your email to receive a verification code";
      case "otp":
        return `We've sent a code to your ${identifierType}`;
      case "password":
        return "Create a new secure password";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary to-primary-foreground/20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <motion.div 
          className="absolute top-40 right-16 w-12 h-12 bg-white/10 rounded-xl backdrop-blur-sm"
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (step === "credentials") {
              navigate("/auth");
            } else if (step === "otp") {
              setStep("credentials");
            } else {
              setStep("otp");
            }
          }}
          className="text-white hover:bg-white/10 rounded-full"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </div>

      <div className="relative z-10 px-6 pt-8 pb-12">
        {/* Step indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div 
            key={step}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl mb-4 shadow-xl border border-white/20"
          >
            {getStepIcon()}
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">{getStepTitle()}</h1>
          <p className="text-white/70">{getStepDescription()}</p>
          
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {["credentials", "otp", "password"].map((s, i) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === s ? "w-6 bg-white" : 
                  (i < ["credentials", "otp", "password"].indexOf(step) ? "bg-white/80" : "bg-white/30")
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="max-w-md mx-auto backdrop-blur-xl bg-white/95 border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 space-y-5">
              {step === "credentials" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="identifier" className="text-sm font-medium">Email or Username</Label>
                    <Input
                      id="identifier"
                      type="text"
                      placeholder="Enter your email or username"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        detectIdentifierType(e.target.value);
                      }}
                      className="h-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                    />
                    {identifier && (
                      <p className="text-xs text-muted-foreground">
                        We'll send the code to your {identifierType}
                      </p>
                    )}
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-12 rounded-xl font-semibold"
                    onClick={handleSendCode}
                    disabled={!identifier.trim()}
                  >
                    Send Verification Code
                  </Button>
                </motion.div>
              )}

              {step === "otp" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <div className="text-center mb-4">
                    <p className="text-sm font-medium text-primary">{identifier}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="h-14 text-center text-2xl tracking-[0.5em] rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                      maxLength={6}
                    />
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-12 rounded-xl font-semibold"
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6}
                  >
                    Verify Code
                  </Button>

                  <div className="text-center">
                    <Button 
                      variant="link" 
                      onClick={() => setStep("credentials")}
                      className="text-sm text-muted-foreground"
                    >
                      Didn't receive code? Try different method
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "password" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="h-12 pr-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="h-12 pr-12 rounded-xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500">Passwords do not match</p>
                    )}
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-12 rounded-xl font-semibold"
                    onClick={handleResetPassword}
                    disabled={!newPassword || newPassword !== confirmPassword}
                  >
                    Reset Password
                  </Button>

                  <div className="text-center">
                    <Button 
                      variant="link"
                      onClick={() => navigate("/auth")}
                      className="text-sm text-muted-foreground"
                    >
                      Skip for now and continue
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
