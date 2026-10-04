import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { Manrope } from "next/font/google";
import { getCurrentUser } from "@/lib/dal";
import { HEX_COLOR } from "@/lib/validations";
import "./globals.css";

const font = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = { title: { default: "Finanças", template: "%s · Finanças" }, description: "Controle financeiro pessoal." };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// Cada usuário tem seu próprio tema, cor e tamanho de fonte: aplicados na raiz com base na sessão.
export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  const s = user?.settings;
  const color = s && HEX_COLOR.test(s.primaryColor) ? s.primaryColor : "#2563eb";

  return (
    <html
      lang="pt-BR"
      className={font.variable}
      data-theme={s?.theme ?? "light"}
      data-font={s?.fontSize ?? "normal"}
      style={{ "--primary": color } as CSSProperties}
    >
      <body>{children}</body>
    </html>
  );
}
