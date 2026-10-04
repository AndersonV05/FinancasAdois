import { notFound } from "next/navigation";
import { SECTION_TITLES } from "@/lib/nav";

export default async function SectionPlaceholder({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = SECTION_TITLES[section];
  if (!title) notFound();
  return (
    <>
      <header className="page-head"><h1>{title}</h1></header>
      <section className="card empty">
        <h2>Esta área ainda não foi construída</h2>
        <p className="muted">Ela chega numa das próximas etapas do projeto.</p>
      </section>
    </>
  );
}
