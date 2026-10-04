"use server";

import { redirect } from "next/navigation";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { createSessionFromIdToken, deleteSession, getSessionUid } from "@/lib/session";
import { setupSchema } from "@/lib/validations";
import { SlotTakenError, parseSlot, registerSlotUser } from "@/lib/users";
import { signInWithPassword } from "@/lib/firebase-rest";
import { logActivity } from "@/lib/activity";
import type { UserDoc } from "@/lib/types";

export type FormState =
  | { error?: string; fieldErrors?: Record<string, string | undefined> }
  | undefined;

/** Valida o token, confere que o perfil está ativo e abre a sessão. Retorna erro ou null. */
async function startSession(idToken: string): Promise<string | null> {
  try {
    const { uid } = await adminAuth.verifyIdToken(idToken);
    const snap = await adminDb.collection("users").doc(uid).get();
    if (!snap.exists) return "Este perfil não está liberado.";
    if ((snap.data() as UserDoc).status !== "ACTIVE") return "Esta conta está bloqueada. Fale com o administrador.";
    await createSessionFromIdToken(idToken);
    await logActivity(uid, "auth.login");
    return null;
  } catch (e) {
    console.error(e);
    return "Não foi possível entrar. Tente novamente.";
  }
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const slot = parseSlot(formData.get("slot"));
  const password = String(formData.get("password") ?? "");
  if (!slot || !password) return { error: "Informe a senha." };

  const slotDoc = await adminDb.doc(`slots/${slot}`).get();
  const email = slotDoc.get("email") as string | undefined;
  if (!email) return { error: "Este perfil ainda não foi criado." };

  const result = await signInWithPassword(email, password);
  if ("error" in result) return { error: result.error };

  const failure = await startSession(result.idToken);
  if (failure) return { error: failure };
  redirect("/dashboard");
}

export async function createAccountAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const slot = parseSlot(formData.get("slot"));
  if (!slot) return { error: "Perfil inválido." };

  const requiredCode = process.env.SIGNUP_CODE;
  if (requiredCode && String(formData.get("code") ?? "").trim() !== requiredCode) {
    return { fieldErrors: { code: "Código de convite incorreto." } };
  }

  const parsed = setupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string | undefined> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { fieldErrors };
  }

  const { name, email, password } = parsed.data;
  try {
    await registerSlotUser({ slot, name, email, password });
  } catch (e) {
    if (e instanceof SlotTakenError) return { error: "Este perfil já foi criado. Volte e entre com a senha." };
    const code = (e as { code?: string }).code;
    if (code === "auth/email-already-exists") return { fieldErrors: { email: "Este e-mail já está em uso." } };
    if (code === "auth/invalid-email") return { fieldErrors: { email: "Informe um e-mail válido." } };
    if (code === "auth/invalid-password") return { fieldErrors: { password: "Senha inválida. Use 8 caracteres ou mais." } };
    console.error(e);
    return { error: "Não foi possível criar a conta. Verifique a configuração do Firebase." };
  }

  const result = await signInWithPassword(email, password);
  if ("error" in result) return { error: `Conta criada, mas o login falhou: ${result.error}` };
  const failure = await startSession(result.idToken);
  if (failure) return { error: failure };
  redirect("/dashboard");
}

export async function logoutAction() {
  const uid = await getSessionUid();
  await deleteSession();
  if (uid) await logActivity(uid, "auth.logout");
  redirect("/login");
}
