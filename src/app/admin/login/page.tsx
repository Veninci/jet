"use client";
import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <form action={action} className="w-full max-w-sm space-y-4 rounded-lg border border-line bg-white p-8">
        <h1 className="font-display text-3xl">Administration</h1>
        <div><label className="label" htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="username" className="field" required /></div>
        <div><label className="label" htmlFor="password">Mot de passe</label><input id="password" name="password" type="password" autoComplete="current-password" className="field" required /></div>
        {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
        <button className="btn-primary w-full" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>
      </form>
    </main>
  );
}
