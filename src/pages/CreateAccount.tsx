import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Eye, EyeOff, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { validatePassword, sanitizeInput } from "@/utils/security";

const CreateAccount = () => {
  const navigate = useNavigate();
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
  const [validation, setValidation] = useState<{
    username: { checking: boolean; available: boolean | null };
    email: { checking: boolean; available: boolean | null };
  }>({
    username: { checking: false, available: null },
    email: { checking: false, available: null }
  });

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
    
    if (field === 'username' || field === 'email') {
      setValidation(prev => ({
        ...prev,
        [field]: { checking: true, available: null }
      }));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username && validation.username.checking) {
        validateField('username', formData.username);
      }
      if (formData.email && validation.email.checking) {
        validateField('email', formData.email);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, formData.email]);

  const validateField = async (field: 'username' | 'email', value: string) => {
    if (!value) return;

    try {
      if (field === 'username') {
        const { data, error } = await supabase.rpc('is_username_available', {
          uname: value,
        });
        if (error) throw error;

        setValidation(prev => ({
          ...prev,
          username: { checking: false, available: Boolean(data) },
        }));
        return;
      }

      const { data, error } = await supabase.rpc('is_email_available', {
        email_input: value,
      });
      if (error) throw error;

      setValidation(prev => ({
        ...prev,
        email: { checking: false, available: Boolean(data) },
      }));
    } catch {
      setValidation(prev => ({
        ...prev,
        [field]: { checking: false, available: null },
      }));
    }
  };

  const handleCreateAccount = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.username.length < 3) {
      toast.error("Username must be at least 3 characters");
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

    if (validation.username.available === false) {
      toast.error("Username is already taken");
      return;
    }

    if (validation.email.available === false) {
      toast.error("Email is already registered");
      return;
    }

    setLoading(true);
    try {
      const phone = formData.phone ? formData.countryCode + formData.phone : null;

      // Create user directly with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: formData.username,
            display_name: formData.username,
            phone: phone,
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          toast.error("Email already registered. Please sign in instead.");
        } else {
          toast.error(authError.message);
        }
        return;
      }

      if (!authData.user) {
        toast.error("Failed to create account");
        return;
      }

      // Auto sign-in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        // If auto-login fails, redirect to auth page
        toast.success("Account created! Please sign in.");
        navigate("/auth");
        return;
      }

      toast.success("Account created successfully! Welcome to ReOwn!");
      navigate("/home");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
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
          <Label htmlFor="username">Username * (minimum 3 characters)</Label>
          <div className="relative">
            <Input
              id="username"
              type="text"
              placeholder="Choose a unique username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className="h-12 pr-12"
              minLength={3}
            />
            {formData.username && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {validation.username.checking ? (
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                ) : validation.username.available === true && formData.username.length >= 3 ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : validation.username.available === false || formData.username.length < 3 ? (
                  <X className="h-4 w-4 text-red-500" />
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="h-12 pr-12"
              required
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
          <Label htmlFor="phone">Phone Number (Optional)</Label>
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
              <option value="+52">🇲🇽 +52</option>
              <option value="+34">🇪🇸 +34</option>
              <option value="+39">🇮🇹 +39</option>
              <option value="+31">🇳🇱 +31</option>
              <option value="+46">🇸🇪 +46</option>
              <option value="+47">🇳🇴 +47</option>
              <option value="+45">🇩🇰 +45</option>
              <option value="+41">🇨🇭 +41</option>
              <option value="+32">🇧🇪 +32</option>
              <option value="+43">🇦🇹 +43</option>
              <option value="+82">🇰🇷 +82</option>
              <option value="+65">🇸🇬 +65</option>
              <option value="+60">🇲🇾 +60</option>
              <option value="+63">🇵🇭 +63</option>
              <option value="+66">🇹🇭 +66</option>
              <option value="+84">🇻🇳 +84</option>
              <option value="+62">🇮🇩 +62</option>
              <option value="+880">🇧🇩 +880</option>
              <option value="+92">🇵🇰 +92</option>
              <option value="+64">🇳🇿 +64</option>
            </select>
            <div className="relative flex-1">
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number (optional)"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="h-12"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
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
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
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
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <div className="text-red-500 text-xs flex items-center gap-1">
              <X className="h-3 w-3" />
              Passwords do not match
            </div>
          )}
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <div className="text-green-500 text-xs flex items-center gap-1">
              <Check className="h-3 w-3" />
              Passwords match
            </div>
          )}
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

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto"
            onClick={() => navigate("/auth")}
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
