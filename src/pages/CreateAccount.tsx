import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Eye, EyeOff, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validatePassword, sanitizeInput } from "@/utils/security";

const CreateAccount = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    countryCode: "+91",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [validation, setValidation] = useState<{
    username: { checking: boolean; available: boolean | null };
    email: { checking: boolean; available: boolean | null };
    phone: { checking: boolean; available: boolean | null };
  }>({
    username: { checking: false, available: null },
    email: { checking: false, available: null },
    phone: { checking: false, available: null }
  });

  const handleInputChange = (field: string, value: string) => {
    // Sanitize input to prevent XSS
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    // Trigger validation for username, email, phone
    if (field === 'username' || field === 'email' || field === 'phone') {
      setValidation(prev => ({
        ...prev,
        [field]: { checking: true, available: null }
      }));
    }
  };

  // Debounced validation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username && validation.username.checking) {
        validateField('username', formData.username);
      }
      if (formData.email && validation.email.checking) {
        validateField('email', formData.email);
      }
      if (formData.phone && validation.phone.checking) {
        validateField('phone', formData.phone);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, formData.email, formData.phone]);

  const validateField = async (field: 'username' | 'email' | 'phone', value: string) => {
    if (!value) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq(field, value)
        .limit(1);

      if (error) throw error;

      setValidation(prev => ({
        ...prev,
        [field]: { checking: false, available: data.length === 0 }
      }));
    } catch (error) {
      console.error(`Error validating ${field}:`, error);
      setValidation(prev => ({
        ...prev,
        [field]: { checking: false, available: null }
      }));
    }
  };

  const sendOtp = async () => {
    if (!formData.phone || !formData.countryCode) {
      toast.error("Please enter your phone number");
      return;
    }

    setLoading(true);
    try {
      // For now, simulate OTP sending - in production, use SMS service
      toast.success("OTP sent to your phone number");
      setIsOtpSent(true);
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    if (!formData.username || !formData.phone || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isOtpSent) {
      toast.error("Please verify your phone number first");
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error("Please enter valid 6-digit OTP");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors[0]);
      return;
    }

    setLoading(true);
    try {
      // Use email if provided, otherwise generate a placeholder
      const emailToUse = formData.email || `${formData.username}@temp.local`;
      
      const { data, error } = await signUp(emailToUse, formData.password, {
        username: formData.username,
        phone: formData.countryCode + formData.phone,
        mobile_number: formData.countryCode + formData.phone
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error("Username or phone already exists");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Account created successfully!");
        navigate("/home");
      }
    } catch (error) {
      toast.error("An error occurred during sign up");
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
        <h1 className="text-xl font-semibold ml-4">Create Account</h1>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-6">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <Input
              id="username"
              type="text"
              placeholder="Choose a unique username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className="h-12 pr-12"
            />
            {formData.username && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {validation.username.checking ? (
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                ) : validation.username.available === true ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : validation.username.available === false ? (
                  <X className="h-4 w-4 text-red-500" />
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email (Optional)</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address (optional)"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="h-12 pr-12"
            />
            {formData.email && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {validation.email.checking ? (
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                ) : validation.email.available === true ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : validation.email.available === false ? (
                  <X className="h-4 w-4 text-red-500" />
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <div className="flex gap-2">
            <select
              value={formData.countryCode}
              onChange={(e) => handleInputChange("countryCode", e.target.value)}
              className="h-12 px-3 rounded-md border bg-background"
            >
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+91">🇮🇳 +91</option>
              <option value="+86">🇨🇳 +86</option>
              <option value="+81">🇯🇵 +81</option>
              <option value="+49">🇩🇪 +49</option>
              <option value="+33">🇫🇷 +33</option>
              <option value="+61">🇦🇺 +61</option>
              <option value="+55">🇧🇷 +55</option>
              <option value="+7">🇷🇺 +7</option>
            </select>
            <div className="relative flex-1">
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="h-12 pr-24"
              />
              {formData.phone && !isOtpSent && (
                <Button
                  type="button"
                  size="sm"
                  onClick={sendOtp}
                  disabled={loading || validation.phone.checking}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  Send OTP
                </Button>
              )}
              {formData.phone && isOtpSent && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>
          </div>
        </div>

        {isOtpSent && (
          <div className="space-y-2">
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="h-12 text-center text-lg tracking-widest"
            />
          </div>
        )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
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
              {formData.password && (
                <div className="text-xs space-y-1">
                  {validatePassword(formData.password).errors.map((error, index) => (
                    <div key={index} className="text-red-500 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      {error}
                    </div>
                  ))}
                  {validatePassword(formData.password).isValid && (
                    <div className="text-green-500 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Password meets security requirements
                    </div>
                  )}
                </div>
              )}
            </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
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

        <Button
          variant="reown"
          size="lg"
          className="w-full"
          onClick={handleCreateAccount}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto text-primary"
              onClick={() => navigate("/auth")}
            >
              Sign In
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;