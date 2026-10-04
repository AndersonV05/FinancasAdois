import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/dal";
import { getSlots } from "@/lib/users";
import { AuthPanel } from "@/components/auth-panel";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  const slots = await getSlots();
  return (
    <div className="auth-card">
      <AuthPanel slots={slots} codeRequired={Boolean(process.env.SIGNUP_CODE)} />
    </div>
  );
}
