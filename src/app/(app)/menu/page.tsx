import Link from "next/link";
import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { NAV_ITEMS } from "@/lib/nav";
import { ICONS } from "@/components/icons";
import { logoutAction } from "@/actions/auth";

export const metadata: Metadata = { title: "Menu" };

// Atalho para telas pequenas: reúne todas as áreas que não cabem na barra inferior.
export default async function MenuPage() {
  await requireUser();
  return (
    <>
      <header className="page-head"><h1>Menu</h1></header>
      <nav className="card menu-list" aria-label="Todas as áreas">
        {[...NAV_ITEMS, { href: "/perfil", label: "Meu perfil", icon: "settings" } as const].map(({ href, label, icon }) => {
          const Icon = ICONS[icon];
          return <Link key={href} href={href}><Icon size={18} aria-hidden /> {label}</Link>;
        })}
        <form action={logoutAction}>
          <button type="submit" className="menu-logout"><LogOut size={18} aria-hidden /> Sair da conta</button>
        </form>
      </nav>
    </>
  );
}
