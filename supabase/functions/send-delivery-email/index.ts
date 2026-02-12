import { serve } from "std/http/server.ts";

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
        const payload = await req.json();
        console.log("Waitlist Webhook received:", payload);

        // Webhook pattern from Supabase: { type, record, table }
        const { type, record, table } = payload;
        
        if (table !== "waiting_list") {
            return new Response("Ignored: Not waiting_list table", { status: 200 });
        }

        // Only process newly inserted records with status 'pending_delivery'
        if (type !== "INSERT" || record.status !== "pending_delivery") {
            return new Response("Ignored: Not a delivery insertion", { status: 200 });
        }

        const email = record.email;
        const djName = record.dj_name || "DJ";

        if (!email) {
            console.error("No email in record:", record.id);
            return new Response("Error: Email not found", { status: 400 });
        }

        console.log(`Sending delivery email to: ${email} (DJ: ${djName})`);

        const emailSubject = "Tu enlace de descarga para Flowmix está listo";
        const downloadLink = "https://flowmix.software/downloads/demo"; // Placeholder link

        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
              <div style="background: #000; padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0;">Flowmix Demo 🚀</h1>
              </div>
              <div style="padding: 30px; color: #333;">
                <p style="font-size: 16px;">Hola <strong>${djName}</strong>,</p>
                <p style="font-size: 16px;">Gracias por tu interés en Software Libre DJ. Aquí tienes tu acceso temporal para probar los demos:</p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${downloadLink}" style="background: #22c55e; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    DESCARGAR DEMOS
                  </a>
                  <p style="font-size: 12px; color: #999; margin-top: 15px;">Este enlace expirará en 24 horas.</p>
                </div>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
                
                <p style="font-size: 14px; color: #666;">Si tienes problemas con la descarga, responde a este correo.</p>
              </div>
              <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #999;">
                Software Libre DJ - La evolución del DJing independiente.
              </div>
            </div>
        `;

        // Send via Resend
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "onboarding@resend.dev", // Change to verified domain in production
                to: [email],
                subject: emailSubject,
                html: emailHtml,
            }),
        });

        const data = await res.json();
        if (!res.ok) {
            console.error("Resend API Error:", data);
            throw new Error(`Resend Error: ${JSON.stringify(data)}`);
        }

        return new Response(JSON.stringify({ ok: true, id: data.id }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Edge Function Error:", errorMessage);
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
