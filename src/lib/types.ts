import type { Timestamp } from "firebase-admin/firestore";

export type Role = "OWNER" | "ADMIN" | "USER";
export type Slot = "eu" | "ela";
export const SLOTS: readonly Slot[] = ["eu", "ela"];
export type UserStatus = "ACTIVE" | "BLOCKED";
export type ThemeMode = "light" | "dark" | "auto";
export type FontSize = "small" | "normal" | "large" | "xlarge";

export interface UserSettings {
  theme: ThemeMode;
  primaryColor: string;
  fontSize: FontSize;
  notificationsEnabled: boolean;
  dashboardLayout: string[] | null;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: "light",
  primaryColor: "#2563eb",
  fontSize: "normal",
  notificationsEnabled: true,
  dashboardLayout: null,
};

/** Documento users/{uid}. O uid é o mesmo do Firebase Authentication. */
export interface UserDoc {
  name: string;
  email: string;
  avatarUrl: string | null;
  role: Role;
  slot: Slot;
  status: UserStatus;
  settings: UserSettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
