import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, password, username, phone, emailHash, codeHash } = await req.json();

    if (!email || !password || !username || !emailHash || !codeHash) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Service role key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. Verify OTP exists and is valid
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('signup_email_otps')
      .select('id, attempts, consumed_at, expires_at')
      .eq('email_hash', emailHash)
      .eq('code_hash', codeHash)
      .eq('purpose', 'signup')
      .is('consumed_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError) {
      console.error('OTP lookup error:', otpError.message);
      return new Response(
        JSON.stringify({ error: 'Verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!otpRecord) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (otpRecord.attempts >= 5) {
      return new Response(
        JSON.stringify({ error: 'Too many attempts. Request a new code.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Mark OTP as consumed
    await supabaseAdmin
      .from('signup_email_otps')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', otpRecord.id);

    // 3. Create user via Admin API (bypasses email confirmation)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Mark as confirmed immediately
      user_metadata: {
        username,
        display_name: username,
        phone: phone || null,
      }
    });

    if (authError) {
      console.error('User creation error:', authError.message);
      // Rollback OTP consumption if user creation failed
      await supabaseAdmin
        .from('signup_email_otps')
        .update({ consumed_at: null })
        .eq('id', otpRecord.id);

      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        return new Response(
          JSON.stringify({ error: 'Email already registered' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Create profile record
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        username: username,
        display_name: username,
        email: email,
        phone: phone || null,
        mobile_number: phone || null,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError.message);
      // Note: User is created but profile failed - this will be handled on next login
    }

    // 5. Clean up old OTPs for this email (only hashes, no PII)
    await supabaseAdmin
      .from('signup_email_otps')
      .delete()
      .eq('email_hash', emailHash)
      .lt('expires_at', new Date().toISOString());

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: authData.user.id,
        email: authData.user.email
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Complete signup error:', error.message);
    return new Response(
      JSON.stringify({ error: 'Signup failed. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
