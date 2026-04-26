import type { APIRoute } from "astro";
import { MercadoPagoConfig, Preference } from "mercadopago";

export const prerender = false;

type ProductKey = "crm" | "web";

const PRODUCTS: Record<
  ProductKey,
  { title: string; description: string; usd: number }
> = {
  crm: {
    title: "Reserva DAKO・CRM",
    description:
      "Reserva única — Despliegue del CRM y configuración de credenciales en menos de 24hs hábiles. Usuarios ilimitados.",
    usd: 300,
  },
  web: {
    title: "Reserva DAKO・WEB",
    description:
      "Reserva única para desarrollo de Landing / Sitio Institucional. Despliegue y relevamiento en menos de 24hs hábiles. (El plan mensual de hosting + soporte se coordina por separado.)",
    usd: 1,
  },
};

async function getDolarOficialVenta(): Promise<number> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares/oficial", {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`dolarapi status ${res.status}`);
    const data = (await res.json()) as { venta?: number };
    if (!data.venta || typeof data.venta !== "number") {
      throw new Error("dolarapi sin campo venta");
    }
    return data.venta;
  } catch (err) {
    console.error("Error obteniendo cotización dolar:", err);
    throw new Error("No se pudo obtener la cotización del dólar oficial");
  }
}

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const body = (await request.json()) as {
      product?: string;
      name?: string;
      email?: string;
    };
    const product = (body.product || "").toLowerCase() as ProductKey;
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();

    if (!product || !PRODUCTS[product]) {
      return new Response(
        JSON.stringify({ success: false, error: "Producto inválido" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!name || !email) {
      return new Response(
        JSON.stringify({ success: false, error: "Nombre y email son requeridos" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const accessToken = import.meta.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("MP_ACCESS_TOKEN no configurado");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Pasarela de pago no configurada. Probá la opción 'Reservar' por WhatsApp.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const productInfo = PRODUCTS[product];
    const cotizacion = await getDolarOficialVenta();
    const arsAmount = Math.round(productInfo.usd * cotizacion);

    const publicOrigin = import.meta.env.PUBLIC_SITE_URL || url.origin;
    const externalReference = `${product}|${email}|${Date.now()}`;

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: `dakodev-${product}`,
            title: productInfo.title,
            description: productInfo.description,
            quantity: 1,
            unit_price: arsAmount,
            currency_id: "ARS",
            category_id: "services",
          },
        ],
        payer: { name, email },
        back_urls: {
          success: `${publicOrigin}/servicios/gracias?product=${product}&status=approved`,
          failure: `${publicOrigin}/servicios/gracias?product=${product}&status=failure`,
          pending: `${publicOrigin}/servicios/gracias?product=${product}&status=pending`,
        },
        auto_return: "approved",
        notification_url: `${publicOrigin}/api/mp-webhook`,
        external_reference: externalReference,
        statement_descriptor: "DAKODEV RESERVA",
        metadata: {
          product,
          customer_name: name,
          customer_email: email,
          usd_amount: productInfo.usd,
          ars_amount: arsAmount,
          cotizacion,
        },
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point,
        usd_amount: productInfo.usd,
        ars_amount: arsAmount,
        cotizacion,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-payment error:", err);
    const message =
      err instanceof Error ? err.message : "Error interno del servidor";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
