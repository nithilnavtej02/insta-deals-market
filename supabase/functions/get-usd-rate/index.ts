import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cache the rate for 1 hour
let cachedRate: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check cache first
    if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION) {
      return new Response(
        JSON.stringify({ rate: cachedRate.rate, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch current USD/INR rate from a free API
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch exchange rate");
    }

    const data = await response.json();
    const inrRate = data.rates?.INR || 83.5; // Fallback rate

    // Cache the result
    cachedRate = { rate: inrRate, timestamp: Date.now() };

    return new Response(
      JSON.stringify({ rate: inrRate, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error fetching USD rate:", error);
    // Return fallback rate on error
    return new Response(
      JSON.stringify({ rate: 83.5, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
