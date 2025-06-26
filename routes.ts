/**
 * An array of routes that are accesible to the public these routes do not require authentication
 * These routes do not require authentication
 * @type {string[]}
 */

export const publicRoutes = [
  "/Trip*",
  "/",
  "/AI-Trips",
  "/auth/new-verification",
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 * */
export const authRoutes = [
  "/auth/login",
  "/auth/signup",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password",
];

/**
 * The Prefix for API authentication routes
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string[]}
 * */
export const apiAuthPrefix = "/api/auth";

/**
 * The deafult redirect path after logging in
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string[]}
 * */
export const DEFAULT_LOGIN_REDIRECT = "/";
