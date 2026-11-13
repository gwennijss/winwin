import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, GATE, tokenFor } from "@/lib/access";

/**
 * Keeps the whole site behind one password, `SITE_PASSWORD`: pages, the
 * campaign footage and the printed presentation alike. A visitor
 * without the cookie is sent to the gate and comes back to where they were
 * going; anything that is not a page is simply refused.
 */
export async function proxy(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  // Without a password the site is open on a developer's machine, and shut on a deployment: it holds clients' material.
  if (!password) return process.env.VERCEL ? new NextResponse("Deze site is nog niet ingesteld.", { status: 503 }) : NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (pathname === GATE) return NextResponse.next();
  if (request.cookies.get(ACCESS_COOKIE)?.value === (await tokenFor(password))) return NextResponse.next();

  const wantsPage = request.method === "GET" && (request.headers.get("accept") ?? "").includes("text/html");
  if (!wantsPage) return new NextResponse("Alleen met wachtwoord.", { status: 401 });

  const gate = request.nextUrl.clone();
  gate.pathname = GATE;
  gate.search = "";
  if (pathname !== "/") gate.searchParams.set("naar", pathname + search);
  return NextResponse.redirect(gate);
}

export const config = {
  // Everything but the framework's own files: the gate itself needs its scripts, styles and typefaces.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
