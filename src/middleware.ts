import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = token.role;

    // Admin routes - only ADMIN
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      const redirectPath = role === "AGENT" ? "/agent" : "/customer";
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }

    // Agent routes - only AGENT and ADMIN
    if (pathname.startsWith("/agent") && role !== "AGENT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/customer", req.url));
    }

    // Customer routes - only CUSTOMER
    if (pathname.startsWith("/customer") && role !== "CUSTOMER") {
      const redirectPath = role === "ADMIN" ? "/admin" : "/agent";
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/agent/:path*", "/customer/:path*"],
};
