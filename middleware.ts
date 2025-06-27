import NextAuth from "next-auth";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";
const { auth } = NextAuth(authConfig);

//@ts-expect-error
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  //console.log("MIDDLEWARE HIT:", req.nextUrl.pathname);

  // ✅ Allow API route of stripe
  if (req.nextUrl.pathname === "/api/webhooks/stripe") {
    return NextResponse.next();
  }

  // ✅ Allow API auth routes
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // ✅ Allow public routes AND any path that starts with a public prefix
  // ✅ Wildcard match for public routes
  const isPublic = publicRoutes.some((route) => {
    if (route.endsWith("*")) {
      return nextUrl.pathname.startsWith(route.replace("*", ""));
    }
    return nextUrl.pathname === route;
  });

  // ✅ Allow access to public routes
  if (isPublic) {
    return null;
  }

  // ✅ Allow API auth routes
  if (isApiAuthRoute) {
    return null;
  }

  // ✅ Redirect logged-in users away from auth pages (e.g. /auth/login)
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  // ✅ Redirect unauthenticated users trying to access protected routes
  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/login", req.nextUrl.origin));
  }

  // ✅ Allow everything else
  return null;
});

//optionally, dont invoke middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
