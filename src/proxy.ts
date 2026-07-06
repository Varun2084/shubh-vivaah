import { auth } from "@/auth";
import { NextResponse } from "next/server";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/dashboard",
  TEACHER: "/dashboard",
  STUDENT: "/dashboard",
  PARENT: "/dashboard",
  ACCOUNTANT: "/dashboard",
  LIBRARIAN: "/dashboard",
  TRANSPORT_STAFF: "/dashboard",
};

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";

  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLoginPage) {
    const home = ROLE_HOME[req.auth!.user.role] ?? "/dashboard";
    return NextResponse.redirect(new URL(home, req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
