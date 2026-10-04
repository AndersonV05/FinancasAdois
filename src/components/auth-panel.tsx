"use client";

import { useState } from "react";
import { useActionState } from "react";
import { ArrowLeft } from "lucide-react";
import { createAccountAction, loginAction, type FormState } from "@/actions/auth";
import type { Slot } from "@/lib/types";

type Slots = Record<Slot, { name: string } | null>;
const LABEL: Record<Slot, string> = { eu: "Eu", ela: "Ela" };

function Field(props: {
  id: string; label: string; type?: string; autoComplete?: string; error?: string; hint?: string; autoFocus?: boolean;
}) {
  const { id, label, type = "text", autoComplete, error, hint, autoFocus } = props;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id} name={id} type={type} autoComplete={autoComplete} autoFocus={autoFocus} required
        className="input" aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      />
      {hint && !error && <p id={`${id}-hint`} className="hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="back-btn" onClick={onClick}>
      <ArrowLeft size={16} aria-hidden /> Trocar de perfil
    </button>
  );
}

function PasswordLogin({ slot, name, onBack }: { slot: Slot; name: string; onBack: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, undefined);
  return (
    <>
      <BackButton onClick={onBack} />
      <h1>Olá, {name.split(" ")[0]}</h1>
      <p className="muted">Digite a sua senha para entrar.</p>
      <form action={action} className="form" noValidate>
        <input type="hidden" name="slot" value={slot} />
        <Field id="password" label="Senha" type="password" autoComplete="current-password" autoFocus />
        {state?.error && <p role="alert" className="alert-error">{state.error}</p>}
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </>
  );
}

function CreateAccount({ slot, codeRequired, onBack }: { slot: Slot; codeRequired: boolean; onBack: () => void }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createAccountAction, undefined);
  const e = state?.fieldErrors ?? {};
  return (
    <>
      <BackButton onClick={onBack} />
      <h1>Criar conta ({LABEL[slot]})</h1>
      <p className="muted">Você faz isso uma vez só. Depois, entra apenas com a senha.</p>
      <form action={action} className="form" noValidate>
        <input type="hidden" name="slot" value={slot} />
        <Field id="name" label="Seu nome" autoComplete="given-name" error={e.name} autoFocus />
        <Field id="email" label="E-mail" type="email" autoComplete="email" error={e.email} />
        <Field id="password" label="Senha" type="password" autoComplete="new-password"
          error={e.password} hint="Use pelo menos 8 caracteres." />
        <Field id="confirmPassword" label="Repita a senha" type="password" autoComplete="new-password"
          error={e.confirmPassword} />
        {codeRequired && (
          <Field id="code" label="Código de convite" error={e.code}
            hint="O código que vocês combinaram para liberar a criação de contas." />
        )}
        {state?.error && <p role="alert" className="alert-error">{state.error}</p>}
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "Criando conta..." : "Criar conta e entrar"}
        </button>
      </form>
    </>
  );
}

export function AuthPanel({ slots, codeRequired }: { slots: Slots; codeRequired: boolean }) {
  const [slot, setSlot] = useState<Slot | null>(null);

  if (slot) {
    const person = slots[slot];
    return person
      ? <PasswordLogin slot={slot} name={person.name} onBack={() => setSlot(null)} />
      : <CreateAccount slot={slot} codeRequired={codeRequired} onBack={() => setSlot(null)} />;
  }

  return (
    <>
      <h1>Quem está entrando?</h1>
      <p className="muted">Escolha o seu perfil.</p>
      <div className="slot-grid">
        {(["eu", "ela"] as const).map((s) => {
          const person = slots[s];
          const title = person ? person.name.split(" ")[0] : LABEL[s];
          return (
            <button key={s} type="button" className="slot-card" onClick={() => setSlot(s)}>
              <span className="avatar avatar-lg" aria-hidden>{title.charAt(0).toUpperCase()}</span>
              <strong>{title}</strong>
              <small>{person ? "Entrar com a senha" : "Criar conta"}</small>
            </button>
          );
        })}
      </div>
    </>
  );
}
