/// <reference lib="deno.ns" />
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
    const { instagram_username, user_id } = await req.json();

    if (!instagram_username || !user_id) {
      throw new Error("Faltan parámetros: instagram_username o user_id");
    }

    // 1. Obtener datos de Apify (Instagram Profile Scraper)
    const APIFY_TOKEN = Deno.env.get("APIFY_TOKEN");
    if (!APIFY_TOKEN) throw new Error("Falta la variable de entorno APIFY_TOKEN");

    // Usamos el endpoint 'run-sync-get-dataset-items' para ejecutar y esperar los resultados
    const apifyUrl = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`;
    
    console.log(`[Apify] Buscando perfil para: ${instagram_username}`);
    
    const apifyResponse = await fetch(apifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        usernames: [instagram_username],
        resultsLimit: 1
      }),
    });

    if (!apifyResponse.ok) {
        const errText = await apifyResponse.text();
        throw new Error(`Apify Error: ${errText}`);
    }

    const apifyData = await apifyResponse.json();
    
    if (!apifyData || apifyData.length === 0) {
        throw new Error("Usuario no encontrado en Instagram (Apify retornó lista vacía)");
    }

    const profile = apifyData[0];
    // Apify puede devolver diferentes campos para la URL de la imagen
    const profilePicUrl = profile.profilePicUrl || profile.profile_pic_url || profile.hdProfilePicUrl;

    if (!profilePicUrl) {
        throw new Error("No se encontró URL de imagen en la respuesta de Apify");
    }

    // 2. Descargar la imagen desde la URL de Instagram/Apify
    console.log(`[Image] Descargando desde: ${profilePicUrl}`);
    const imageResponse = await fetch(profilePicUrl);
    if (!imageResponse.ok) throw new Error("Error al descargar la imagen desde Instagram");
    
    const imageBlob = await imageResponse.blob();

    // 3. Subir a Supabase Storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const fileName = `${user_id}.jpg`;
    
    console.log(`[Storage] Subiendo archivo: ${fileName} al bucket 'avatars'`);
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, imageBlob, {
        contentType: "image/jpeg",
        upsert: true
      });

    if (uploadError) {
        throw new Error(`Error subiendo a Storage: ${uploadError.message}`);
    }

    // 4. Obtener URL Pública Permanente
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);
    
    // Agregar timestamp para evitar caché del navegador si la imagen cambia
    const permanentUrl = `${publicUrl}?t=${Date.now()}`;

    // 5. Actualizar Base de Datos (Tabla 'profiles' o la que uses)
    // NOTA: Asumimos tabla 'profiles' y columna 'foto_url' como solicitaste.
    // Si tu tabla se llama diferente, ajusta aquí.
    console.log(`[DB] Actualizando perfil para ID: ${user_id}`);
    const { error: dbError } = await supabase
        .from("profiles") 
        .update({ foto_url: permanentUrl })
        .eq("id", user_id);

    if (dbError) {
        throw new Error(`Error actualizando Base de Datos: ${dbError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Perfil sincronizado correctamente", 
        avatarUrl: permanentUrl,
        username: profile.username
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
