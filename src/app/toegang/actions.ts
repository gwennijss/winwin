"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, safeDestination, tokenFor } from "@/lib/access";

export type GateState = { wrong: boolean };

/** Checks the password, and on the right one sets the cookie and goes on to where the visitor was going. */
export async function enter(_before: GateState, form: FormData): Promise<GateState> {
  const password = process.env.SITE_PASSWORD;
  if (password) {
    if (String(form.get("wachtwoord") ?? "").trim() !== password) return { wrong: true };
    (await cookies()).set(ACCESS_COOKIE, await tokenFor(password), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  redirect(safeDestination(form.get("naar")));
}
