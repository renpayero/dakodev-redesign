import type { APIRoute } from "astro";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { Resend } from "resend";
import crypto from "node:crypto";

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

const TEAM_EMAIL = "renzopayero@hotmail.com";

const productLabels: Record<string, string> = {
  crm: "DAKO・CRM (USD 300)",
  web: "DAKO・WEB (USD 80)",
};

/**
 * Valida la firma x-signature de MercadoPago.
 * Manifest: id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 * v1 = HMAC-SHA256(manifest, MP_WEBHOOK_SECRET)
 * Docs: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks#editor_2
 */
function verifyMpSignature(
  secret: string,
  signatureHeader: string | null,
  requestId: string | null,
  dataId: string | null
): boolean {
  if (!signatureHeader || !requestId || !dataId) return false;

  const parts = signatureHeader.split(",").reduce<Record<string, string>>(
    (acc, part) => {
      const [key, value] = part.split("=").map((s) => s.trim());
      if (key && value) acc[key] = value;
      return acc;
    },
    {}
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(v1, "hex")
    );
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const accessToken = import.meta.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("MP_ACCESS_TOKEN no configurado en webhook");
      return new Response("ok", { status: 200 });
    }

    const topic = url.searchParams.get("topic") || url.searchParams.get("type");
    const idParam =
      url.searchParams.get("id") || url.searchParams.get("data.id");

    let body: any = null;
    try {
      body = await request.json();
    } catch {
      body = null;
    }

    const paymentId =
      (body?.data?.id as string | undefined) ||
      (body?.id as string | undefined) ||
      idParam ||
      undefined;

    const eventType = (body?.type as string | undefined) || topic || undefined;

    if (eventType !== "payment" || !paymentId) {
      return new Response("ok", { status: 200 });
    }

    // Validar firma del webhook (defensa contra triggers falsos)
    const webhookSecret = import.meta.env.MP_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get("x-signature");
      const reqId = request.headers.get("x-request-id");
      const valid = verifyMpSignature(
        webhookSecret,
        signature,
        reqId,
        String(paymentId)
      );
      if (!valid) {
        console.warn("mp-webhook: firma inválida", {
          paymentId,
          hasSignature: Boolean(signature),
          hasReqId: Boolean(reqId),
        });
        return new Response("invalid signature", { status: 401 });
      }
    }

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    if (paymentData.status !== "approved") {
      return new Response("ok", { status: 200 });
    }

    const metadata = (paymentData.metadata || {}) as Record<string, any>;
    const product = (metadata.product as string) || "";
    const customerName =
      (metadata.customer_name as string) ||
      paymentData.payer?.first_name ||
      "Sin nombre";
    const customerEmail =
      (metadata.customer_email as string) ||
      paymentData.payer?.email ||
      "Sin email";
    const usdAmount = (metadata.usd_amount as number) || null;
    const arsAmount =
      (metadata.ars_amount as number) || paymentData.transaction_amount || null;
    const cotizacion = (metadata.cotizacion as number) || null;
    const externalRef = paymentData.external_reference || "";
    const productLabel = productLabels[product] || product || "Reserva";

    await resend.emails.send({
      from: "Dakodev Reservas <onboarding@resend.dev>",
      to: [TEAM_EMAIL],
      replyTo: customerEmail,
      subject: `[RESERVA PAGADA] ${productLabel} — ${customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00f5d4; border-bottom: 2px solid #00f5d4; padding-bottom: 10px;">
            Nueva reserva pagada
          </h2>

          <div style="background: #05080a; color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #9ca3af;">PRODUCTO</p>
            <p style="margin: 4px 0 16px; font-size: 22px; font-weight: bold;">${productLabel}</p>

            <p style="margin: 0; font-size: 14px; color: #9ca3af;">MONTO</p>
            <p style="margin: 4px 0 16px; font-size: 18px; font-weight: bold;">
              AR$ ${arsAmount?.toLocaleString("es-AR") ?? "—"}
              ${usdAmount ? `<span style="color:#00b4d8; font-size:14px;"> (≈ USD ${usdAmount}${cotizacion ? ` @ AR$${cotizacion}` : ""})</span>` : ""}
            </p>
          </div>

          <div style="margin: 20px 0;">
            <p><strong>Cliente:</strong> ${customerName}</p>
            <p><strong>Email:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a></p>
            <p><strong>Payment ID:</strong> ${paymentData.id}</p>
            <p><strong>External ref:</strong> ${externalRef}</p>
            <p><strong>Status:</strong> ${paymentData.status}</p>
            <p><strong>Fecha:</strong> ${paymentData.date_approved || paymentData.date_created || ""}</p>
          </div>

          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
          <p style="font-size: 12px; color: #888;">
            Acción requerida: contactar al cliente en menos de 24hs hábiles para coordinar el despliegue.
          </p>
        </div>
      `,
    });

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("mp-webhook error:", err);
    return new Response("ok", { status: 200 });
  }
};

export const GET: APIRoute = async () => {
  return new Response("ok", { status: 200 });
};
