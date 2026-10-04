import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

// Primeira barreira (Edge): só checa se existe cookie. A verificação real
// (assinatura, revogação, usuário ativo) acontece em src/lib/dal.ts.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isPublic || req.cookies.get("fin_session")?.value) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"] };
