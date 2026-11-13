"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { enter, type GateState } from "./actions";

const START: GateState = { wrong: false };

/** The one field of the gate. A wrong password says so under the field and leaves it ready for another try. */
export function Gate() {
  const [state, action, busy] = useActionState(enter, START);
  const to = useSearchParams().get("naar") ?? "";
  return (
    <form action={action} className="w-full max-w-[420px]">
      <input type="hidden" name="naar" value={to} />
      <label htmlFor="wachtwoord" className="block text-[15px] text-[#F3F6FF]/60">
        Wachtwoord
      </label>
      <div className="mt-3 flex gap-2">
        <input
          id="wachtwoord"
          name="wachtwoord"
          type="password"
          autoFocus
          autoComplete="current-password"
          required
          aria-invalid={state.wrong}
          aria-describedby={state.wrong ? "wachtwoord-fout" : undefined}
          className="h-14 min-w-0 flex-1 border border-[#F3F6FF]/25 bg-transparent px-4 text-[20px] text-[#F3F6FF] outline-none transition-colors focus:border-[#F3F6FF]"
        />
        <button
          type="submit"
          disabled={busy}
          className="h-14 shrink-0 cursor-pointer bg-[#F3F6FF] px-7 text-[17px] font-medium text-[#252526] transition-opacity hover:opacity-85 disabled:opacity-60"
        >
          Open
        </button>
      </div>
      <p id="wachtwoord-fout" role="alert" className="mt-3 h-6 text-[15px] text-[#C9C0FF]">
        {state.wrong ? "Dat wachtwoord klopt niet. Probeer het nog eens." : ""}
      </p>
    </form>
  );
}
