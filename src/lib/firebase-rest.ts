/** Confere e-mail + senha no Firebase Auth pelo servidor (a senha nunca vai para o Firestore). */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ idToken: string } | { error: string }> {
  const key = process.env.FIREBASE_API_KEY;
  if (!key) {
    console.error("FIREBASE_API_KEY não configurada.");
    return { error: "Servidor sem configuração do Firebase." };
  }
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      cache: "no-store",
    });
    const data = await res.json();
    if (res.ok && data.idToken) return { idToken: data.idToken as string };

    const message = String(data?.error?.message ?? "");
    if (message.startsWith("TOO_MANY_ATTEMPTS")) return { error: "Muitas tentativas. Aguarde alguns minutos e tente de novo." };
    if (message.startsWith("USER_DISABLED")) return { error: "Esta conta está bloqueada. Fale com o administrador." };
    if (/API key|referer|PERMISSION_DENIED|blocked/i.test(message + JSON.stringify(data?.error ?? ""))) {
      console.error("Erro de configuração da chave de API:", data?.error);
      return { error: "Chave de API do Firebase inválida ou restrita. Veja o README (solução de problemas)." };
    }
    return { error: "Senha incorreta." };
  } catch (e) {
    console.error(e);
    return { error: "Não foi possível falar com o Firebase. Verifique a conexão." };
  }
}
