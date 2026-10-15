"use client";
import { useActionState } from "react";
import { createUser } from "../../actions";

export function UserForm() {
  const [state, action, pending] = useActionState(createUser, null);
  return (
    <form action={action} className="grid gap-2 rounded-lg border border-line bg-white p-5 text-sm sm:grid-cols-5">
      <input name="name" placeholder="Nom" className="field py-2" required />
      <input name="email" type="email" placeholder="E-mail" className="field py-2" required />
      <input name="password" type="password" placeholder="Mot de passe (12+)" minLength={12} className="field py-2" required />
      <select name="role" className="field py-2"><option value="SALES">Commercial</option><option value="ADMIN">Administrateur</option></select>
      <button className="btn-primary py-2" disabled={pending}>Créer</button>
      {state?.error && <p className="text-xs text-red-700 sm:col-span-5">{state.error}</p>}
      {state?.ok && <p className="text-xs text-emerald-800 sm:col-span-5">Utilisateur créé.</p>}
    </form>
  );
}
