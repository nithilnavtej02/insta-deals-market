import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Eye, EyeOff, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CreateAccount = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
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
    setFormData(prev => ({ ...prev, [field]: value }));
    
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

  const validateField = async (field: string, value: string) => {
    if (!value) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq(field, value)
        .limit(1);

      if (error) throw error;

      const fieldKey = field as keyof typeof validation;
      setValidation(prev => ({
        ...prev,
        [fieldKey]: { checking: false, available: data.length === 0 }
      }));
    } catch (error) {
      console.error(`Error validating ${field}:`, error);
      const fieldKey = field as keyof typeof validation;
      setValidation(prev => ({
        ...prev,
        [fieldKey]: { checking: false, available: null }
      }));
    }
  };

  const handleCreateAccount = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await signUp(formData.email, formData.password, {
        username: formData.username,
        phone: formData.phone
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created! Please check your email to confirm your account.");
        navigate("/auth");
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
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
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
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="h-12 pr-12"
            />
            {formData.phone && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {validation.phone.checking ? (
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                ) : validation.phone.available === true ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : validation.phone.available === false ? (
                  <X className="h-4 w-4 text-red-500" />
                ) : null}
              </div>
            )}
          </div>
        </div>

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