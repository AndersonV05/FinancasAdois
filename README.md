# Finanças — Etapa 1 (Firebase, login com perfis "Eu" e "Ela")

Stack: **Next.js 15 + React 19 + TypeScript + Firebase Authentication + Cloud Firestore**.
Todo acesso ao banco acontece no **servidor** (Firebase Admin SDK). As regras do Firestore
(`firestore.rules`) bloqueiam 100% do acesso direto pelo navegador — isso é intencional.

## Como o login funciona

- A tela de login mostra dois perfis fixos: **Eu** e **Ela**.
- Perfil sem conta → "Criar conta" (nome, e-mail, senha e, se configurado, o código de convite). Isso é feito **uma vez**.
- Perfil com conta → mostra o nome da pessoa e pede **só a senha**.
- O sistema nunca passa de **duas contas** (cada perfil é reservado por transação no Firestore).
- O e-mail nunca é enviado ao navegador; a senha é conferida no servidor.

## Privacidade entre os dois

1. O uid vem **somente do cookie de sessão** verificado pelo Admin SDK (`src/lib/dal.ts`).
2. Todos os dados financeiros ficam em `users/{uid}/...` (veja `src/lib/paths.ts`).
3. O acesso exige o perfil `users/{uid}` com `status: "ACTIVE"`, criado apenas pelo servidor.
4. Regras do Firestore: `allow read, write: if false`.

## 1. Configurar o Firebase

1. Console do Firebase → **Build → Firestore Database → Criar banco** (modo produção, região `southamerica-east1`).
2. **Build → Authentication → Começar → E-mail/senha → Ativar.**
3. **Configurações do projeto → Seus apps → Web** → copie `apiKey` para `FIREBASE_API_KEY`.
4. **Configurações do projeto → Contas de serviço → Gerar nova chave privada** → do JSON copie `project_id`, `client_email`, `private_key` para o `.env`. **Nunca envie esse JSON ao GitHub.**
5. **Publicar as regras:** console → Firestore → *Regras* → cole o conteúdo de `firestore.rules` → Publicar
   (ou `firebase deploy --only firestore` com o Firebase CLI).

## 2. Rodar localmente

```bash
npm install
cp .env.example .env     # (Windows: copy .env.example .env) e preencha
npm run dev              # http://localhost:3000
```

Abra o site, clique em **Eu**, crie a sua conta. Sua namorada clica em **Ela** e cria a dela.
Defina um `SIGNUP_CODE` no `.env` e passe o código só para ela.

> Alternativa por terminal: `npm run user:create -- eu "Nome" email "senha"` (ou `ela`).

## 3. Publicar (Vercel)

1. Suba o código no GitHub e importe o repositório em vercel.com.
2. Em *Settings → Environment Variables*, cadastre todas as variáveis do `.env.example`
   (em `FIREBASE_PRIVATE_KEY`, cole a chave com os `\n`).
3. HTTPS e domínio próprio: Vercel → Settings → Domains.

## Solução de problemas

- **"Chave de API do Firebase inválida ou restrita"**: no Google Cloud Console → *APIs e serviços → Credenciais*,
  abra a "Browser key" do projeto e, em *Restrições de aplicativo*, escolha **Nenhuma** (a chave só é usada no servidor).
  Em *Restrições de API*, mantenha permitida a **Identity Toolkit API**.
- **"Servidor sem configuração do Firebase"**: falta `FIREBASE_API_KEY` no `.env`.
- **Erro ao iniciar sobre credenciais**: confira `FIREBASE_PRIVATE_KEY` (entre aspas, com `\n`).
- **Errei o e-mail ao criar a conta**: no console do Firebase apague o usuário em Authentication e o documento do perfil em
  Firestore → `slots/eu` (ou `ela`) e `users/{uid}`; depois crie de novo.

## Próximas etapas

2. Contas, categorias, receitas e despesas (CRUD, filtros, navegação por mês, saldo).
3. Cartões, compras parceladas, faturas.
4. Dashboard (cards e gráficos), relatórios, notificações.
5. Configurações (aparência), perfil, importar/exportar/backup.
6. Objetivos, compartilhamento do casal, administração, log, revisão final.
