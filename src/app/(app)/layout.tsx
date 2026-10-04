import type { ReactNode } from "react";
import { requireUser } from "@/lib/dal";
import { Sidebar, BottomNav } from "@/components/app-nav";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  return (
    <div className="shell">
      <Sidebar name={user.name} email={user.email} />
      <main className="main" id="conteudo">{children}</main>
      <BottomNav />
    </div>
  );
}
