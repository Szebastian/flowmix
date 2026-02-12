import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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
        console.log("Webhook received:", payload);

        // 1. Validate Payload
        const { type, record, old_record, _schema, table } = payload;
        if (table !== "memberships") {
            return new Response("Ignored: Not memberships table", { status: 200 });
        }

        // 2. Setup Clients
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        // 3. Get User Email
        const userId = record.user_id;
        const { data: userData, error: _userError } = await supabase.auth.admin.getUserById(userId);

        // Fallback: Try profiles table if auth fails (e.g. if using a custom auth setup)
        let email = userData?.user?.email;

        if (!email) {
            const { data: profile } = await supabase.from('profiles').select('email').eq('id', userId).single();
            email = profile?.email;
        }

        if (!email) {
            console.error("Could not find email for user:", userId);
            return new Response("Error: Email not found", { status: 400 });
        }

        console.log(`Processing for user: ${email} | Status: ${record.status}`);

        // 4. Determine Email Type
        let emailSubject = "";
        let emailHtml = "";
        let shouldSend = false;

        // CASE A: New Contribution (Pending)
        // Trigger: INSERT of any status OR UPDATE to 'pending_verification'
        if (type === "INSERT" || (type === "UPDATE" && record.status === "pending_verification" && old_record.status !== "pending_verification")) {
            shouldSend = true;
            emailSubject = "Confirmación de Aporte - Software Libre DJ";
            const trackLink = `http://localhost:4200/track/${record.transaction_ref}`; // Update with production URL

            emailHtml = `
        <h1>¡Gracias por tu aporte! 🚀</h1>
        <p>Hemos registrado tu solicitud de membresía.</p>
        <p><strong>Nivel:</strong> ${record.level}</p>
        <p><strong>ID de Seguimiento:</strong> ${record.transaction_ref}</p>
        <p>Un miembro del equipo verificará tu comprobante en breve.</p>
        <br/>
        <a href="${trackLink}" style="background:#000; color:#fff; padding:10px 20px; text-decoration:none; border-radius:5px;">
          Ver Estado del Pago
        </a>
      `;
        }

        // CASE B: Activation (Active)
        // Trigger: UPDATE to 'active'
        else if (type === "UPDATE" && record.status === "active" && old_record.status !== "active") {
            shouldSend = true;
            emailSubject = "¡Tu acceso está listo! - Software Libre DJ";
            const trackLink = `http://localhost:4200/track/${record.transaction_ref}`;
            const whatsappLink = Deno.env.get("WHATSAPP_GROUP_LINK") || "https://chat.whatsapp.com/EXAMPLE";

            // Define benefits based on level
            const level = record.level as string;
            let benefitsHtml = "";
            if (level === 'apoyo') {
                benefitsHtml = `
          <li>✅ Acceso a builds estables</li>
          <li>✅ Soporte básico por email</li>
          <li>✅ Reconocimiento en la comunidad</li>
        `;
            } else if (level === 'interno') {
                benefitsHtml = `
          <li>✅ Acceso a builds anticipadas (Beta)</li>
          <li>✅ Soporte prioritario</li>
          <li>✅ Canal de feedback directo</li>
        `;
            } else if (level === 'socio') {
                benefitsHtml = `
          <li>✅ Acceso Total (Full Suite)</li>
          <li>✅ Soporte 1-on-1</li>
          <li>✅ Participación en decisiones técnicas</li>
          <li>✅ Builds personalizadas</li>
        `;
            }

            emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background: #000; padding: 20px; text-align: center;">
            <h1 style="color: #fff; margin: 0;">¡Bienvenido a la Élite! 🎧</h1>
          </div>
          <div style="padding: 30px; color: #333;">
            <p style="font-size: 16px;">Hola,</p>
            <p style="font-size: 16px;">Tu membresía de nivel <strong>${level.toUpperCase()}</strong> ha sido activada exitosamente.</p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #22c55e;">Tus Beneficios Activos:</h3>
              <ul style="padding-left: 20px; line-height: 1.6;">
                ${benefitsHtml}
              </ul>
            </div>

            <p style="font-size: 14px; color: #666;"><strong>Vigencia hasta:</strong> ${new Date(record.expiry_date).toLocaleDateString()}</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${trackLink}" style="background: #22c55e; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                ACCEDER AL SOFTWARE
              </a>
            </div>

            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
            
            <h3 style="color: #000;">Únete a la Comunidad</h3>
            <p>Conecta con otros DJs y mantente al día en nuestro grupo exclusivo:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${whatsappLink}" style="background: #25D366; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                GRUPO DE WHATSAPP
              </a>
            </div>
          </div>
          <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #999;">
            Software Libre DJ - La evolución del DJing independiente.
          </div>
        </div>
      `;
        }

        if (!shouldSend) {
            return new Response("Ignored: No email trigger condition met", { status: 200 });
        }

        // 5. Send Email via Resend
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "Soporte <onboarding@resend.dev>", // WARNING: Change to your verified domain in production
                to: [email],
                subject: emailSubject,
                html: emailHtml,
            }),
        });

        const data = await res.json();
        console.log("Resend Result Status:", res.status);
        console.log("Resend Result Body:", data);

        if (!res.ok) {
            console.error("❌ Resend API Error:", data);
            throw new Error(`Resend Error (${res.status}): ${JSON.stringify(data)}`);
        }

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error: unknown) {

        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(error);
        return new Response(JSON.stringify({ error: errorMessage }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
