"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";
import { ICONS } from "@/components/icons";
import { logoutAction } from "@/actions/auth";

type Props = { name: string; email: string };

export function Sidebar({ name, email }: Props) {
  const pathname = usePathname();
  return (
    <aside className="sidebar" aria-label="Menu principal">
      <div className="brand">
        <span className="brand-mark" aria-hidden>F</span>
        <span className="brand-name">Finanças</span>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const Icon = ICONS[icon];
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}>
              <Icon size={18} aria-hidden /> {label}
            </Link>
          );
        })}
      </nav>

      <div className="userbox">
        <Link href="/perfil" className="userbox-link" aria-label="Meu perfil">
          <span className="avatar" aria-hidden>{name.charAt(0).toUpperCase()}</span>
          <span className="userbox-text">
            <strong>{name}</strong>
            <small>{email}</small>
          </span>
        </Link>
        <form action={logoutAction}>
          <button className="icon-btn" type="submit" aria-label="Sair da conta" title="Sair">
            <LogOut size={18} aria-hidden />
          </button>
        </form>
      </div>
    </aside>
  );
}

const MOBILE_ITEMS = [
  { href: "/dashboard", label: "Início", icon: "home" },
  { href: "/despesas", label: "Gastos", icon: "expense" },
  { href: "/cartoes", label: "Cartões", icon: "card" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const moreActive = !MOBILE_ITEMS.some((i) => pathname.startsWith(i.href));
  return (
    <nav className="bottom-nav" aria-label="Navegação rápida">
      {MOBILE_ITEMS.map(({ href, label, icon }) => {
        const Icon = ICONS[icon];
        return (
          <Link key={href} href={href} aria-current={pathname.startsWith(href) ? "page" : undefined}>
            <Icon size={20} aria-hidden /> <span>{label}</span>
          </Link>
        );
      })}
      <Link href="/menu" aria-current={moreActive ? "page" : undefined}>
        <Menu size={20} aria-hidden /> <span>Mais</span>
      </Link>
    </nav>
  );
}
