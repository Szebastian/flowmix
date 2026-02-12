// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();

    if (!username) {
      throw new Error("Username is required");
    }

    // 1. Fetch Instagram Profile
    // We try to scrape the og:image from the public profile
    // If SCRAPER_API_KEY is present, we use ScraperAPI (recommended for stability)
    // Otherwise we try a direct fetch with User-Agent spoofing

    const instagramUrl = `https://www.instagram.com/${username}/`;
    let html = "";

    const scraperApiKey = Deno.env.get("SCRAPER_API_KEY");

    if (scraperApiKey) {
      console.log("Using ScraperAPI...");
      // ScraperAPI format: http://api.scraperapi.com?api_key=KEY&url=URL
      const scraperUrl = `http://api.scraperapi.com?api_key=${scraperApiKey}&url=${encodeURIComponent(instagramUrl)}`;
      const response = await fetch(scraperUrl);
      if (!response.ok) {
         throw new Error(`ScraperAPI Error: ${response.statusText}`);
      }
      html = await response.text();
    } else {
      console.log("Using Direct Fetch (Fallback)...");
      const response = await fetch(instagramUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
       if (!response.ok) {
         if (response.status === 404) throw new Error("Instagram user not found");
         // If we hit 302 or 429, it's likely a block
         throw new Error(`Instagram Fetch Error: ${response.status} - ${response.statusText}. Consider setting SCRAPER_API_KEY.`);
      }
      html = await response.text();
    }

    // 2. Parse og:image
    // Simple regex to find <meta property="og:image" content="...">
    const metaMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
    
    if (!metaMatch || !metaMatch[1]) {
       if (html.includes("Login • Instagram")) {
           throw new Error("Instagram login wall hit. Please configure SCRAPER_API_KEY for stable scraping.");
       }
       // Fallback: Sometimes it's in a different tag or the regex missed it.
       // But usually og:image is the standard.
       throw new Error("Could not find profile image. Account might be private or layout changed.");
    }

    const imageUrl = metaMatch[1];
    // Instagram image URLs often have HTML entities encoded (e.g. &amp;)
    const cleanImageUrl = imageUrl.replace(/&amp;/g, "&");

    console.log(`Found image: ${cleanImageUrl}`);

    // 3. Download Image
    const imageResponse = await fetch(cleanImageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to download image from Instagram");
    }
    const imageBlob = await imageResponse.blob();

    // 4. Upload to Supabase Storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const fileName = `instagram/${username}.jpg`;

    // Ensure bucket exists? The API usually requires it to exist.
    // We use 'colaboradores_fotos' bucket for public avatars.
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from("colaboradores_fotos")
      .upload(fileName, imageBlob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload Error:", uploadError);
      throw new Error(`Supabase Storage Upload Error: ${uploadError.message}`);
    }

    // 5. Get Public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from("colaboradores_fotos")
      .getPublicUrl(fileName);
      
    // Return result
    return new Response(
      JSON.stringify({ 
          username, 
          avatarUrl: publicUrl,
          source: scraperApiKey ? "scraper-api" : "direct-fetch"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || String(error) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
