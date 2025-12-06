import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, username, code } = await req.json();

    if (!email || !username || !code) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
      console.log('Email would be sent to:', email, 'with code:', code);
      return new Response(
        JSON.stringify({ success: true, message: 'Development mode - RESEND_API_KEY not set' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(RESEND_API_KEY);

    // Professional, attractive HTML email template
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 500px; border-collapse: collapse;">
          <!-- Logo & Header -->
          <tr>
            <td style="text-align: center; padding-bottom: 30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); color: white; font-size: 28px; font-weight: bold; padding: 15px 30px; border-radius: 12px; letter-spacing: 1px;">
                ReOwn
              </div>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">India's Premium Reselling Marketplace</p>
            </td>
          </tr>
          
          <!-- Main Content Card -->
          <tr>
            <td>
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Welcome Message -->
                <tr>
                  <td style="padding: 40px 40px 20px 40px; text-align: center;">
                    <h1 style="margin: 0 0 10px 0; font-size: 24px; color: #1f2937;">Welcome aboard, <span style="color: #7C3AED;">@${username}</span>! 🎉</h1>
                    <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      You're one step away from joining thousands of smart buyers and sellers on ReOwn.
                    </p>
                  </td>
                </tr>
                
                <!-- Verification Code Box -->
                <tr>
                  <td style="padding: 20px 40px;">
                    <div style="background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); border-radius: 12px; padding: 30px; text-align: center;">
                      <p style="margin: 0 0 15px 0; color: rgba(255,255,255,0.9); font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
                      <div style="background: white; border-radius: 8px; padding: 20px; display: inline-block;">
                        <span style="font-size: 36px; font-weight: bold; color: #7C3AED; letter-spacing: 8px; font-family: 'Courier New', monospace;">${code}</span>
                      </div>
                      <p style="margin: 15px 0 0 0; color: rgba(255,255,255,0.8); font-size: 12px;">Code expires in 10 minutes</p>
                    </div>
                  </td>
                </tr>
                
                <!-- Instructions -->
                <tr>
                  <td style="padding: 20px 40px 30px 40px; text-align: center;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      Enter this 6-digit code on the verification page to complete your signup.
                    </p>
                  </td>
                </tr>
                
                <!-- Benefits -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse; background: #f9fafb; border-radius: 12px;">
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0 0 15px 0; font-weight: 600; color: #1f2937; font-size: 14px;">What you'll get with ReOwn:</p>
                          <table role="presentation" style="width: 100%; border-collapse: collapse;">
                            <tr>
                              <td style="padding: 8px 0; color: #4b5563; font-size: 14px;">✨ Buy & sell pre-owned items safely</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #4b5563; font-size: 14px;">💬 Direct chat with buyers & sellers</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #4b5563; font-size: 14px;">🔒 Secure transactions with UPI</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #4b5563; font-size: 14px;">📍 Connect with local sellers</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 20px; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 12px;">
                If you didn't create an account with ReOwn, you can safely ignore this email.
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} ReOwn Marketplace. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: 'ReOwn <onboarding@resend.dev>',
      to: [email],
      subject: `🎉 Hey @${username}, here's your ReOwn verification code: ${code}`,
      html: emailHtml,
    });

    console.log('Email sent successfully to:', email);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
