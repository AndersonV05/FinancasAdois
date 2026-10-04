import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const BEGIN = "-----BEGIN PRIVATE KEY-----";
const END = "-----END PRIVATE KEY-----";

/** Aceita a chave com aspas, com \n literal, com espaços no lugar das quebras, etc. */
function normalizePrivateKey(raw: string) {
  let key = raw.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  const start = key.indexOf(BEGIN);
  const end = key.indexOf(END);
  if (start === -1 || end === -1) {
    throw new Error("FIREBASE_PRIVATE_KEY incompleta: faltam as linhas BEGIN/END PRIVATE KEY.");
  }
  const body = key
    .slice(start + BEGIN.length, end)
    .replace(/\\+n/g, "")
    .replace(/\s+/g, "");
  if (!/^[A-Za-z0-9+/=]+$/.test(body) || body.length < 1500) {
    throw new Error(
      `FIREBASE_PRIVATE_KEY danificada (corpo com ${body.length} caracteres, esperado ~1600). ` +
        "Use FIREBASE_SERVICE_ACCOUNT_BASE64 (veja o README).",
    );
  }
  return `${BEGIN}\n${body.match(/.{1,64}/g)!.join("\n")}\n${END}\n`;
}

function loadCredentials() {
  // Opção mais segura: o JSON inteiro da conta de serviço codificado em base64.
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
  if (b64) {
    const json = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
    return {
      projectId: String(json.project_id),
      clientEmail: String(json.client_email),
      privateKey: normalizePrivateKey(String(json.private_key)),
    };
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!projectId || !clientEmail || !rawKey) {
    throw new Error("Defina FIREBASE_SERVICE_ACCOUNT_BASE64 ou FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY.");
  }
  return { projectId, clientEmail, privateKey: normalizePrivateKey(rawKey) };
}

function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;
  const app = initializeApp({ credential: cert(loadCredentials()) });
  getFirestore(app).settings({ ignoreUndefinedProperties: true });
  return app;
}

// Inicialização preguiçosa: o build não precisa das credenciais, só a execução do site.
function lazy<T extends object>(factory: () => T): T {
  let instance: T | undefined;
  return new Proxy({} as T, {
    get(_target, prop) {
      instance ??= factory();
      const value = (instance as Record<string | symbol, unknown>)[prop];
      return typeof value === "function" ? value.bind(instance) : value;
    },
  });
}

export const adminAuth: Auth = lazy(() => getAuth(getAdminApp()));
export const adminDb: Firestore = lazy(() => getFirestore(getAdminApp()));
