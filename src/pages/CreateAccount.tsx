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
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otp, setOtp] = useState("");
  const [pendingData, setPendingData] = useState<{
    email: string;
    username: string;
    password: string;
    phone: string | null;
  } | null>(null);

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

  // Generate 6-digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Hash function for OTP storage (simple hash for demo)
  const hashCode = async (str: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSendOTP = async () => {
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

    setLoading(true);
    try {
      const code = generateOTP();
      const emailHash = await hashCode(formData.email.toLowerCase());
      const codeHash = await hashCode(code);

      // Store hashed OTP in database
      const { error: otpError } = await supabase
        .from('signup_email_otps')
        .insert({
          email_hash: emailHash,
          code_hash: codeHash,
          purpose: 'signup',
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        });

      if (otpError) throw otpError;

      // Send OTP via edge function
      const { error: sendError } = await supabase.functions.invoke('send-verification-code', {
        body: {
          email: formData.email,
          username: formData.username,
          code: code,
        },
      });

      if (sendError) throw sendError;

      // Store pending data for after verification
      setPendingData({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        phone: formData.phone ? formData.countryCode + formData.phone : null,
      });

      setStep('otp');
      toast.success("Verification code sent to your email!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    if (!pendingData) {
      toast.error("Session expired. Please try again.");
      setStep('form');
      return;
    }

    setLoading(true);
    try {
      const emailHash = await hashCode(pendingData.email.toLowerCase());
      const codeHash = await hashCode(otp);

      // Verify OTP from database
      const { data: otpRecord, error: fetchError } = await supabase
        .from('signup_email_otps')
        .select('*')
        .eq('email_hash', emailHash)
        .eq('code_hash', codeHash)
        .eq('purpose', 'signup')
        .is('consumed_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!otpRecord) {
        toast.error("Invalid or expired code. Please try again.");
        return;
      }

      // Check attempts
      if (otpRecord.attempts >= 5) {
        toast.error("Too many attempts. Please request a new code.");
        return;
      }

      // Mark OTP as consumed
      await supabase
        .from('signup_email_otps')
        .update({ consumed_at: new Date().toISOString() })
        .eq('id', otpRecord.id);

      // Now create the account
      const { data, error } = await signUp(pendingData.email, pendingData.password, {
        username: pendingData.username,
        email: pendingData.email,
        phone: pendingData.phone,
        mobile_number: pendingData.phone,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error("Email already exists");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Account created successfully!");
      navigate("/home");
    } catch (error: any) {
      toast.error(error.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!pendingData) return;

    setLoading(true);
    try {
      const code = generateOTP();
      const emailHash = await hashCode(pendingData.email.toLowerCase());
      const codeHash = await hashCode(code);

      await supabase
        .from('signup_email_otps')
        .insert({
          email_hash: emailHash,
          code_hash: codeHash,
          purpose: 'signup',
          expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        });

      await supabase.functions.invoke('send-verification-code', {
        body: {
          email: pendingData.email,
          username: pendingData.username,
          code: code,
        },
      });

      toast.success("New code sent!");
    } catch {
      toast.error("Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center p-4 border-b">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setStep('form')}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-semibold ml-4">Verify Email</h1>
        </div>

        <div className="p-6 max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl">📧</span>
            </div>
            <h2 className="text-xl font-semibold">Check your email</h2>
            <p className="text-muted-foreground">
              We've sent a 6-digit code to <span className="font-medium text-foreground">{pendingData?.email}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="h-14 text-center text-2xl tracking-[0.5em] font-mono"
              maxLength={6}
            />
          </div>

          <Button
            variant="reown"
            size="lg"
            className="w-full"
            onClick={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
          >
            {loading ? "Verifying..." : "Verify & Create Account"}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Didn't receive the code?
            </p>
            <Button
              variant="link"
              onClick={handleResendOTP}
              disabled={loading}
            >
              Resend Code
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          onClick={handleSendOTP}
          disabled={loading}
        >
          {loading ? "Sending Code..." : "Continue"}
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
