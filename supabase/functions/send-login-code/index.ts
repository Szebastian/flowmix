import { serve } from "std/http/server.ts";
import { Resend } from "npm:resend@3.2.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ALLOWED_ORIGINS = [
  "http://localhost:4300",
  "http://localhost:4200",
  "https://flowmix.netlify.app"
];

function makeCorsHeaders(origin?: string) {
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : "https://flowmix.netlify.app";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, *",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin") || undefined;
    return new Response("ok", { status: 200, headers: makeCorsHeaders(origin) });
  }
  if (req.method === "GET") {
    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { ...makeCorsHeaders(req.headers.get("origin") || undefined), "Content-Type": "application/json" },
    });
  }
  try {
    const body = await req.json();
    const email: string = (body?.email || "").trim().toLowerCase();
    const code: string = String(body?.code || "").trim();
    if (!email || !code || code.length < 4) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...makeCorsHeaders(req.headers.get("origin") || undefined), "Content-Type": "application/json" },
      });
    }
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Email provider not configured" }), {
        status: 500,
        headers: { ...makeCorsHeaders(req.headers.get("origin") || undefined), "Content-Type": "application/json" },
      });
    }
    const resend = new Resend(RESEND_API_KEY);
    const subject = "Tu código de acceso a Flowmix (Admin)";
    const html = `
      <div style="font-family: Arial, sans-serif; color: #111;">
        <h2>Flowmix Access Core</h2>
        <p>Tu código de acceso es:</p>
        <div style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">
          ${code}
        </div>
        <p>Expira en 10 minutos.</p>
        <p>Si no solicitaste este código, ignora este correo.</p>
      </div>
    `;
    
    // Attempt to send
    console.log(`Sending email to ${email} with code ${code}`);
    
    const { data, error } = await resend.emails.send({
      from: "Flowmix <onboarding@resend.dev>",
      to: email,
      subject,
      html,
    });
    
    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error: String(error.message || error) }), {
        status: 500,
        headers: { ...makeCorsHeaders(req.headers.get("origin") || undefined), "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, data }), {
      status: 200,
      headers: { ...makeCorsHeaders(req.headers.get("origin") || undefined), "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Exception:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...makeCorsHeaders(req.headers.get("origin") || undefined), "Content-Type": "application/json" },
    });
  }
});
