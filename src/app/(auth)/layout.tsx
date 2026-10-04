import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth">
      <section className="auth-aside" aria-hidden>
        <div className="brand"><span className="brand-mark">F</span><span className="brand-name">Finanças</span></div>
        <div>
          <p className="auth-statement">Cada um com as suas contas. Cada conta no seu lugar.</p>
          <p className="auth-sub">Receitas, cartões, faturas e parcelas num só painel, com os seus dados separados dos de qualquer outra pessoa.</p>
        </div>
      </section>
      <section className="auth-main">{children}</section>
    </main>
  );
}
