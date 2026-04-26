export const WHATSAPP_NUMBER = "5492477610100";

export function whatsappLink(product: string, action: "reservar" | "consultar" = "reservar"): string {
  const verb = action === "reservar" ? "reservar" : "consultar sobre";
  const msg = `Hola Dakodev, quiero ${verb} ${product} y coordinar una asesoría con el equipo.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}
