import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, username, code } = await req.json();

    if (!email || !username || !code) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating custom email for ${username} at ${email}`);

    // Generate attractive email content using ChatGPT
    let emailHtml = "";
    
    if (openaiApiKey) {
      try {
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a creative email writer for ReOwn, a modern marketplace app. Generate beautiful, engaging HTML email content for verification emails. Use modern styling with gradients, clean fonts, and professional design. Include the verification code prominently. The brand color is #7C3AED (purple). Keep it concise but welcoming."
              },
              {
                role: "user",
                content: `Create an attractive HTML verification email for a new user named "${username}" joining ReOwn marketplace. Their verification code is: ${code}. Make it warm, welcoming, and professional. Include the code in a styled box. Don't include <html>, <head>, or <body> tags - just the content that goes inside body. Use inline CSS styles.`
              }
            ],
            max_tokens: 1000,
          }),
        });

        const aiData = await aiResponse.json();
        if (aiData.choices?.[0]?.message?.content) {
          emailHtml = aiData.choices[0].message.content;
        }
      } catch (aiError) {
        console.error("AI generation failed, using fallback:", aiError);
      }
    }

    // Fallback HTML if AI fails
    if (!emailHtml) {
      emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; margin: 0;">ReOwn</h1>
            <p style="color: #666; font-size: 14px; margin-top: 5px;">Marketplace for Everyone</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%); border-radius: 16px; padding: 30px; text-align: center;">
            <h2 style="color: #1F2937; font-size: 24px; margin: 0 0 10px;">Welcome, ${username}! 👋</h2>
            <p style="color: #6B7280; font-size: 16px; margin: 0 0 25px;">We're excited to have you join our community!</p>
            
            <p style="color: #374151; font-size: 14px; margin: 0 0 15px;">Your verification code is:</p>
            
            <div style="background: linear-gradient(135deg, #7C3AED 0%, #9333EA 100%); border-radius: 12px; padding: 20px; display: inline-block; margin: 0 0 25px;">
              <span style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px;">${code}</span>
            </div>
            
            <p style="color: #6B7280; font-size: 14px; margin: 0;">This code expires in 10 minutes</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #9CA3AF; font-size: 12px;">If you didn't request this, please ignore this email.</p>
            <p style="color: #9CA3AF; font-size: 12px; margin-top: 10px;">© ${new Date().getFullYear()} ReOwn. All rights reserved.</p>
          </div>
        </div>
      `;
    }

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "ReOwn <onboarding@resend.dev>",
      to: [email],
      subject: `🎉 Welcome to ReOwn, ${username}! Your verification code inside`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Verification email sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
