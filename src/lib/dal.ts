import { cache } from "react";
import { redirect } from "next/navigation";
import { adminDb } from "@/lib/firebase-admin";
import { getSessionUid } from "@/lib/session";
import type { UserDoc } from "@/lib/types";

/**
 * Camada de acesso autenticada.
 * O uid vem SEMPRE do cookie de sessão verificado pelo Firebase Admin.
 * Ter uma conta no Firebase Auth não basta: é preciso existir o perfil users/{uid}
 * (criado só pelo servidor) com status ACTIVE.
 */
export const getCurrentUser = cache(async () => {
  const uid = await getSessionUid();
  if (!uid) return null;
  const snap = await adminDb.collection("users").doc(uid).get();
  if (!snap.exists) return null;
  const data = snap.data() as UserDoc;
  if (data.status !== "ACTIVE") return null;
  return {
    id: uid,
    name: data.name,
    email: data.email,
    avatarUrl: data.avatarUrl,
    role: data.role,
    settings: data.settings,
  };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role === "USER") redirect("/dashboard");
  return user;
}
