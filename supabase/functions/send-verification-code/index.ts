import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { email, username, code } = await req.json()

    if (!email || !username || !code) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .code-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to ReOwn!</h1>
    </div>
    <div class="content">
      <p>Hi <strong>@${username}</strong>,</p>
      
      <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
      
      <div class="code-box">
        <p style="margin: 0 0 10px 0; color: #666;">Your verification code:</p>
        <div class="code">${code}</div>
      </div>
      
      <p style="text-align: center;">
        <a href="${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${code}&type=signup" class="button">
          Verify Email Address
        </a>
      </p>
      
      <p style="font-size: 14px; color: #666;">
        Or copy and paste this code into the verification page:<br>
        <strong>${code}</strong>
      </p>
      
      <p style="font-size: 14px; color: #666;">
        This code will expire in 24 hours. If you didn't create an account with ReOwn, please ignore this email.
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ReOwn Marketplace. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `

    if (!RESEND_API_KEY) {
      console.log('Email preview (RESEND_API_KEY not configured):')
      console.log('To:', email)
      console.log('Username:', username)
      console.log('Code:', code)
      
      return new Response(
        JSON.stringify({ success: true, message: 'Development mode - check logs' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'ReOwn <onboarding@resend.dev>',
        to: [email],
        subject: `Welcome to ReOwn, @${username}! Verify your email`,
        html: emailHtml,
      })
    })

    const data = await res.json()

    return new Response(
      JSON.stringify(data),
      { status: res.status, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
