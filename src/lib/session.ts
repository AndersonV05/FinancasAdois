import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

export const SESSION_COOKIE = "fin_session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

/** Troca o ID token do Firebase por um cookie de sessão httpOnly. */
export async function createSessionFromIdToken(idToken: string) {
  const cookie = await adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MS });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
}

/** Retorna o uid se o cookie for válido e NÃO revogado (usuário desativado perde acesso). */
export async function getSessionUid(): Promise<string | null> {
  const jar = await cookies();
  const cookie = jar.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    const decoded = await adminAuth.verifySessionCookie(cookie, true);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
