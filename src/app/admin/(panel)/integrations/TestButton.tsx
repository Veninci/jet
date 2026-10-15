"use client";
import { useActionState } from "react";
import { testProvider } from "../../actions";

export function TestButton({ provider }: { provider: string }) {
  const [state, action, pending] = useActionState(testProvider, null);
  return (
    <form action={action} className="mt-3">
      <input type="hidden" name="provider" value={provider} />
      <button className="btn-ghost py-1.5 text-xs" disabled={pending}>{pending ? "Test…" : "Tester la connexion"}</button>
      {state && <p className={`mt-2 text-xs ${state.ok ? "text-emerald-800" : "text-red-700"}`}>{state.message}</p>}
    </form>
  );
}
