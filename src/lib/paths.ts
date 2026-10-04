import { adminDb } from "@/lib/firebase-admin";

/**
 * TODOS os dados financeiros vivem DENTRO de users/{uid}/...
 * Assim o isolamento é estrutural: para ler algo, é preciso informar o uid
 * (que vem sempre da sessão, nunca da URL ou do formulário).
 *
 *   users/{uid}                        perfil + configurações
 *   users/{uid}/accounts               contas
 *   users/{uid}/categories             categorias
 *   users/{uid}/cards                  cartões
 *   users/{uid}/transactions           receitas e despesas de conta (valores em centavos, data "YYYY-MM-DD")
 *   users/{uid}/cardPurchases          compras no cartão
 *   users/{uid}/installments           parcelas (cada uma aponta para uma fatura)
 *   users/{uid}/invoices               faturas
 *   users/{uid}/notifications          notificações
 *   users/{uid}/goals                  objetivos (com movimentações)
 *   users/{uid}/backupLogs             histórico de backups
 *   users/{uid}/activityLog            log de atividades
 *   shares/{id}                        compartilhamento explícito entre usuários (futuro)
 *   slots/{eu|ela}                     perfis fixos do login (quem ocupa cada um)
 */
export const USER_SUBCOLLECTIONS = [
  "accounts", "categories", "cards", "transactions", "cardPurchases", "installments",
  "invoices", "notifications", "goals", "backupLogs", "activityLog",
] as const;
export type UserSubcollection = (typeof USER_SUBCOLLECTIONS)[number];

export const userRef = (uid: string) => adminDb.collection("users").doc(uid);
export const userCol = (uid: string, name: UserSubcollection) => userRef(uid).collection(name);
