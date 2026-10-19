/**
 * An array of routes that are accesible to the public these routes do not require authentication
 * These routes do not require authentication
 * @type {string[]}
 */

export const publicRoutes = [
  "/Trip*",
  "/",
  "/auth/new-verification",
  // Public follow-along share pages and their polling endpoint
  "/api/public/trips*",
  // Public recap image endpoint (respects share state)
  "/api/recap*",
  // Stripe verifies deliveries via signature, not sessions
  "/api/webhooks/stripe",
];

/**
 * An array of routes that are used for authentication
 * These routes will redirect logged in users to the default redirect
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
 * The default redirect path after logging in
 * @type {string}
 * */
export const DEFAULT_LOGIN_REDIRECT = "/";
