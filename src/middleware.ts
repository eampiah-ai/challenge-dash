import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("challenge-session")?.value;
  const { pathname } = request.nextUrl;

  const publicPaths = ["/login", "/api/auth/login", "/api/auth/logout"];
  const isPublic = publicPaths.some((path) => pathname === path || pathname.startsWith(path + "/"));

  if (!isPublic && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
