import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function init() {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Variáveis FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY são obrigatórias.");
  }
  const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  getFirestore(app).settings({ ignoreUndefinedProperties: true });
  return app;
}

const app = init();
export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
