/**
 * The password gate of the live site. It is on when `SITE_PASSWORD` is set,
 * as it is on the deployment; without it, as on a developer's machine, the
 * site is open.
 */

/** The cookie that says the password has been given. */
export const ACCESS_COOKIE = "ww-toegang";

/** Where the password is asked for. */
export const GATE = "/toegang";

/** What the cookie holds for a password: a digest of it, so the password itself is never stored in a browser. */
export async function tokenFor(password: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`winwin:${password}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** A place on this site to go to after the gate, and nowhere else. */
export function safeDestination(value: unknown): string {
  const to = typeof value === "string" ? value : "";
  return to.startsWith("/") && !to.startsWith("//") && !to.startsWith(GATE) ? to : "/presentatie";
}
