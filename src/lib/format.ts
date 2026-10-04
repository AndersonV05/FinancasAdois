export const APP_TZ = process.env.APP_TIMEZONE ?? "America/Recife";

export const formatBRL = (value: number | string) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));

export const formatDate = (d: Date) => new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(d);

export function greeting(now = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: APP_TZ }).format(now),
  );
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function longDate(now = new Date()) {
  const text = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: APP_TZ,
  }).format(now);
  return text.charAt(0).toUpperCase() + text.slice(1);
}
