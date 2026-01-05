-- Silence linter by explicitly denying all direct access to OTP table
ALTER TABLE public.signup_email_otps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "OTP table: no direct access" ON public.signup_email_otps;

CREATE POLICY "OTP table: no direct access"
ON public.signup_email_otps
FOR ALL
TO public
USING (false)
WITH CHECK (false);
