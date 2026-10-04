import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { userCol, userRef } from "@/lib/paths";
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/lib/default-categories";
import { DEFAULT_SETTINGS, SLOTS, type Role, type Slot } from "@/lib/types";

export class SlotTakenError extends Error {
  constructor() { super("SLOT_TAKEN"); }
}

export function parseSlot(value: unknown): Slot | null {
  return SLOTS.includes(value as Slot) ? (value as Slot) : null;
}

/** Lê os dois perfis fixos. Só devolve o nome; o e-mail nunca vai para o navegador. */
export async function getSlots(): Promise<Record<Slot, { name: string } | null>> {
  const [eu, ela] = await Promise.all(SLOTS.map((s) => adminDb.doc(`slots/${s}`).get()));
  const pick = (d: typeof eu) => (d.exists && d.get("uid") ? { name: String(d.get("name")) } : null);
  return { eu: pick(eu), ela: pick(ela) };
}

type NewUser = { slot: Slot; name: string; email: string; password: string };

/**
 * Cria a conta de um perfil fixo. O perfil é reservado por transação:
 * só pode existir UMA conta em "eu" e UMA em "ela" (máximo de duas no sistema).
 */
export async function registerSlotUser({ slot, name, email, password }: NewUser) {
  const lock = adminDb.doc(`slots/${slot}`);
  await adminDb.runTransaction(async (t) => {
    if ((await t.get(lock)).exists) throw new SlotTakenError();
    t.set(lock, { claimedAt: FieldValue.serverTimestamp() });
  });

  try {
    const role: Role = slot === "eu" ? "OWNER" : "USER";
    const record = await adminAuth.createUser({ email: email.trim().toLowerCase(), password, displayName: name });
    try {
      const batch = adminDb.batch();
      batch.set(userRef(record.uid), {
        name, email: record.email, avatarUrl: null, role, slot, status: "ACTIVE",
        settings: DEFAULT_SETTINGS,
        createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
      });
      const cats = userCol(record.uid, "categories");
      for (const [n, emoji, color] of DEFAULT_EXPENSE_CATEGORIES)
        batch.set(cats.doc(), { name: n, emoji, color, kind: "EXPENSE", createdAt: FieldValue.serverTimestamp() });
      for (const [n, emoji, color] of DEFAULT_INCOME_CATEGORIES)
        batch.set(cats.doc(), { name: n, emoji, color, kind: "INCOME", createdAt: FieldValue.serverTimestamp() });
      batch.set(lock, { uid: record.uid, name, email: record.email, claimedAt: FieldValue.serverTimestamp() });
      await batch.commit();
    } catch (err) {
      await adminAuth.deleteUser(record.uid).catch(() => {});
      throw err;
    }
    return { uid: record.uid, email: record.email ?? email, slot };
  } catch (err) {
    await lock.delete().catch(() => {});
    throw err;
  }
}
