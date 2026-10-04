import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Informe um e-mail válido.");

export const passwordSchema = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .max(128, "A senha é longa demais.");

export const setupSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome.").max(80),
    email,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não são iguais.",
  });

export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
