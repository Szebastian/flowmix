import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Check API Key
    if (!RESEND_API_KEY) {
      console.error("[send-waitlist-welcome] RESEND_API_KEY is not set in environment variables");
      throw new Error("Server configuration error: Missing RESEND_API_KEY");
    }

    // Parse Body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error("[send-waitlist-welcome] Error parsing JSON body:", e);
      return new Response(JSON.stringify({ error: "Invalid JSON body", details: String(e) }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, name } = body;
    console.log(`[send-waitlist-welcome] Processing request for: ${email}`);

    if (!email) {
      console.error("[send-waitlist-welcome] Missing email in payload");
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanName = name || "Future DJ";
    console.log(`[send-waitlist-welcome] Sending via Resend to ${email} as ${cleanName}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev", 
        to: [email],
        subject: "¡Confirmado! Estás en la lista de Flowmix 🎧",
        html: `
          <div style="font-family: 'Courier New', monospace; background-color: #09090b; color: #e4e4e7; padding: 40px; max-width: 600px; margin: 0 auto; border: 1px solid #27272a; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22d3ee; margin: 0; font-size: 24px; letter-spacing: -1px;">FLOWMIX</h1>
              <p style="color: #71717a; font-size: 12px; margin-top: 5px; letter-spacing: 2px;">THE EVOLUTION OF DJING</p>
            </div>
            
            <div style="background-color: #18181b; padding: 30px; border-radius: 4px; border: 1px solid #27272a;">
              <p style="margin-top: 0; font-size: 16px;">Hola <strong>${cleanName}</strong>,</p>
              
              <p style="line-height: 1.6; color: #d4d4d8;">
                Gracias por unirte a <strong>Flowmix</strong>.
              </p>
              
              <p style="line-height: 1.6; color: #d4d4d8;">
                Tu registro se ha completado con éxito. Ahora mismo, nuestro equipo está trabajando a máxima potencia para finalizar la versión Beta y asegurar que cada transición y cada beat sea perfecto.
              </p>

              <div style="margin: 30px 0; padding: 15px; background: rgba(34, 211, 238, 0.1); border-left: 3px solid #22d3ee; color: #22d3ee; font-size: 14px;">
                <strong style="display: block; margin-bottom: 5px;">ESTADO: ACCESO PRIORITARIO CONFIRMADO 🎧</strong>
                No tienes que hacer nada más. En cuanto abramos las puertas, recibirás un pase de acceso directo en esta bandeja de entrada.
              </div>
              
              <p style="line-height: 1.6; color: #d4d4d8;">
                Mientras tanto, síguenos para ver qué estamos cocinando:
              </p>
              
              <p style="text-align: center; margin-top: 20px;">
                 <a href="https://instagram.com/flowmix_official" style="color: #22d3ee; text-decoration: none; margin: 0 10px;">Instagram</a>
                 <span style="color: #52525b;">|</span>
                 <a href="#" style="color: #22d3ee; text-decoration: none; margin: 0 10px;">TikTok</a>
                 <span style="color: #52525b;">|</span>
                 <a href="#" style="color: #22d3ee; text-decoration: none; margin: 0 10px;">YouTube</a>
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #52525b;">
              <p>Flowmix - The Evolution of DJing</p>
              <p>2026 © Todos los derechos reservados.</p>
            </div>
          </div>
        `,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Resend error:', data);
      throw new Error(JSON.stringify(data));
    }

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
