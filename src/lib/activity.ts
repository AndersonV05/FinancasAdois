import { FieldValue } from "firebase-admin/firestore";
import { userCol } from "@/lib/paths";

export async function logActivity(
  uid: string,
  action: string,
  extra?: { entity?: string; entityId?: string; metadata?: Record<string, unknown> },
) {
  try {
    await userCol(uid, "activityLog").add({ action, ...extra, createdAt: FieldValue.serverTimestamp() });
  } catch (err) {
    console.error("Falha ao registrar atividade", err);
  }
}
