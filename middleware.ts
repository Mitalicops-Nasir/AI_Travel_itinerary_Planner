import NextAuth from "next-auth";

import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicRoutes,
} from "@/routes";
import authConfig from "./auth.config";
const { auth } = NextAuth(authConfig);

//@ts-expect-error
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // ✅ Allow API auth routes
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // ✅ Allow public routes AND any path that starts with a public prefix
  const isPublic = publicRoutes.some((route) => {
    if (route.endsWith("*")) {
      return nextUrl.pathname.startsWith(route.replace("*", ""));
    }
    return nextUrl.pathname === route;
  });

  if (isPublic) {
    return null;
  }

  if (isApiAuthRoute) {
    return null;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/auth/login", req.nextUrl.origin));
  }
  return null;
});

//optionally, dont invoke middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
