export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/receitas", label: "Receitas", icon: "income" },
  { href: "/despesas", label: "Despesas", icon: "expense" },
  { href: "/cartoes", label: "Cartões", icon: "card" },
  { href: "/faturas", label: "Faturas", icon: "invoice" },
  { href: "/contas", label: "Contas", icon: "bank" },
  { href: "/relatorios", label: "Relatórios", icon: "chart" },
  { href: "/categorias", label: "Categorias", icon: "tag" },
  { href: "/objetivos", label: "Objetivos", icon: "target" },
  { href: "/configuracoes", label: "Configurações", icon: "settings" },
] as const;

export const SECTION_TITLES: Record<string, string> = Object.fromEntries(
  [...NAV_ITEMS.map((i) => [i.href.slice(1), i.label]), ["perfil", "Meu perfil"]],
);
