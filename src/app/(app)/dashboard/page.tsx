import type { Metadata } from "next";
import { requireUser } from "@/lib/dal";
import { greeting, longDate } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <header className="page-head">
        <div>
          <h1>{greeting()}, {firstName} 👋</h1>
          <p className="muted">{longDate()}</p>
        </div>
      </header>

      <section className="card empty" aria-labelledby="etapa1">
        <h2 id="etapa1">Tudo pronto para começar</h2>
        <p className="muted">
          Sua conta, suas configurações e suas categorias já foram criadas. Os lançamentos, cartões e
          gráficos chegam nas próximas etapas.
        </p>
      </section>
    </>
  );
}
