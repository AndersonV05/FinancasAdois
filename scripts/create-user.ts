/**
 * Alternativa por linha de comando (normalmente você cria a conta pela tela de login).
 *   npm run user:create -- eu|ela "Nome" email@exemplo.com "senha-forte"
 */
import { SlotTakenError, parseSlot, registerSlotUser } from "../src/lib/users";
import { setupSchema } from "../src/lib/validations";

async function main() {
  const [slotArg, name, email, password] = process.argv.slice(2);
  const slot = parseSlot(slotArg);
  if (!slot || !name || !email || !password) {
    console.error('Uso: npm run user:create -- eu|ela "Nome" email@exemplo.com "senha"');
    process.exit(1);
  }
  const parsed = setupSchema.safeParse({ name, email, password, confirmPassword: password });
  if (!parsed.success) {
    console.error(parsed.error.issues.map((i) => i.message).join("\n"));
    process.exit(1);
  }
  const user = await registerSlotUser({ slot, ...parsed.data });
  console.log(`Conta criada no perfil "${slot}": ${parsed.data.name} <${user.email}>`);
}

main().catch((e) => {
  if (e instanceof SlotTakenError) console.error("Este perfil já tem uma conta.");
  else console.error(e?.code === "auth/email-already-exists" ? "Já existe um usuário com esse e-mail." : e);
  process.exit(1);
});
