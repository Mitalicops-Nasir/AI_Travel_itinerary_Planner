# Phase 0 Research — Travel Engagement & Monetization Suite

**Feature**: `001-travel-engagement-suite` | **Date**: 2026-10-18

All decisions below are grounded in the existing codebase (Next.js 16 App Router, Prisma + MongoDB, NextAuth v5, AI SDK v6 + Gemini, Stripe, Tailwind v4 + shadcn-style Radix primitives) and in the market research done for the spec. No `[NEEDS CLARIFICATION]` markers remained in the spec.

## R1. Monetization start: tracked affiliate links (no partner APIs)

- **Decision**: Ship bookable recommendations as server-built tracked URLs (Viator, GetYourGuide, Booking.com, insurance/eSIM/car-rental networks) plus internal click logging. No live pricing feeds or partner APIs in v1.
- **Rationale**: Free-to-join programs pay on completed bookings (Viator ~8%, GYG ~8–30%, insurance 10–40%); links work immediately with zero approval friction. Live price APIs are explicitly archived by the user.
- **Alternatives rejected**: Partner API integration now (requires Full/Booking access + approvals → archived); scraping partner sites (fragile, ToS risk).
- **Implementation shape**: pure functions in `features/bookable-offers/lib.ts` → `buildActivityLink()`, `buildStayLink()`, `buildEssentialsLink()`; partner IDs from env with safe fallbacks (`VIATOR_PARTNER_ID`, `GETYOURGUIDE_PARTNER_ID`, `BOOKING_AID`). Clicks logged via `OfferClick` rows (analytics + admin dashboard).

## R2. Modals + fluid interactions

- **Decision**: Add a Radix Dialog primitive at `components/ui/dialog.tsx` (same shadcn-style pattern as existing `dropdown-menu.tsx`, `select.tsx`), used for all quick actions (check-in, journal, import, share settings, upgrade, suggest stop). Feedback via existing `sonner` toasts; optimistic local state for votes/check-ins.
- **Rationale**: User constraint (modals where needed, fluid like a modern SaaS app — FR-044/045). Radix is already the UI primitive family in this repo; sonner already installed.
- **Alternatives rejected**: Route-per-action pages (breaks context), custom modal implementations (theme drift), new UI kit (drift + bloat).

## R3. Destination local time ("today" logic)

- **Decision**: Store `Trip.startDate`/`endDate` as UTC dates; compute phase (`upcoming | active | completed`) and "today's day number" server-side using the destination's timezone, derived from the trip country via the small `countries-and-timezones` dependency, resolved through `Intl.DateTimeFormat` for actual clock values.
- **Rationale**: Time-zone edge case in spec; needs global coverage; avoids device-time bugs.
- **Alternatives rejected**: Device timezone (wrong for travel), hand-built country→timezone map (not global, maintenance burden).

## R4. Share links: token + state machine, allowlist serializer

- **Decision**: One `ShareLink` per trip (`@unique tripId`), `token = crypto.randomUUID()` (Node built-in), states `ACTIVE | PAUSED | REVOKED`, `regenerate` replaces the token. Public pages/API read through a dedicated serializer (`toPublicTripView`) that only exposes route, visited stops, shared journal entries/photos, and traveler first name.
- **Rationale**: Spec FR-018..021 (pause/revoke/regenerate, no private data). UUID tokens are unguessable without new deps.
- **Alternatives rejected**: JWT share tokens (revocation is awkward), signed query params (complexity), exposing the raw trip id (guessable, no revocation).

## R5. Follow-along updates: 30s polling endpoint

- **Decision**: Public JSON endpoint `GET /api/public/trips/[token]` polled every 30s by the public page (and 60s on recap). No SSE/WebSockets in v1.
- **Rationale**: Simplest reliable option on serverless; trip updates are low-frequency (check-ins, journal entries). Real-time is a non-goal in the spec.
- **Alternatives rejected**: SSE (connection limits, serverless quirks), websockets (infra), full page reloads (breaks fluid requirement).

## R6. Journal photo storage

- **Decision**: MVP stores uploaded photos on local disk under `public/uploads/journal/<userId>/` through a single `features/trip-journal/lib.ts` storage helper (`savePhoto()`, `deletePhoto()`). Hard cap per file (5 MB) and max 6 photos per entry.
- **Rationale**: No storage account needed to ship; abstraction keeps a future swap to S3/Cloudinary a one-file change (documented in the helper).
- **Alternatives rejected**: Cloudinary/S3 now (extra credentials, scope creep), base64 in Mongo (document size limits, slow reads).

## R7. Free-tier quota counting

- **Decision**: Count `Trip` rows per user per calendar month (no counter model). Free limit: 3 generations/month; Pro: unlimited. Check happens in `GenerateAITripIternary` before AI call; UI shows remaining via a small server action.
- **Rationale**: Zero new models, self-healing (deleting old trips doesn't grant quota weirdly since count is creation-based), races are acceptable at this scale.
- **Alternatives rejected**: `UsageCounter` model (extra writes + drift risk), Redis (new infra).

## R8. Membership billing (Stripe subscriptions)

- **Decision**: Stripe Checkout in `mode: "subscription"` with a `STRIPE_PRO_PRICE_ID` price; `Membership` row tracks `stripeCustomerId`, `stripeSubscriptionId`, `currentPeriodEnd`, tier/status. Cancellation uses the Stripe customer portal link (`stripe.billingPortal.sessions.create`). Existing webhook route extended for `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
- **Rationale**: Reuses Stripe already in the app; portal keeps cancellation/legal flows off our plate; webhook pattern already hardened (idempotent helpers).
- **Alternatives rejected**: Custom cancel UI + proration math (complexity), one-time "lifetime" payments (doesn't match benchmark pricing ~$5/mo).

## R9. Curated paid trips: reuse Booking + clone on webhook

- **Decision**: Admin marks trips `isCurated` + `curatedPriceInCents` + `isPublished`. Purchase reuses the existing checkout pattern (new action `createCuratedCheckoutSession`) and `Booking` rows on the curated trip. On `checkout.session.completed` (webhook), mark booking PAID and clone the trip+AIResponse into a new trip owned by the buyer, recorded in `Booking.copiedTripId` for idempotency. Full plan locked behind `Booking.status === PAID`.
- **Rationale**: Booking already has the unique (user, trip) constraint and webhook idempotency; minimal new surface.
- **Alternatives rejected**: Separate `Purchase` model (duplicate payment logic), unlock-in-place without copy (buyer could edit the shared template for everyone).

## R10. Import from anywhere

- **Decision**: One modal with three inputs: paste text, paste URL, upload image. URL → server fetch (10s timeout, 500 KB cap, strip tags) → text; image → passed to Gemini vision via AI SDK. Extraction via a dedicated Zod schema (`ImportDraftSchema`: country, places[], suggestedInterests[], confidence, reason?) with graceful failure message.
- **Rationale**: Uses the AI stack already in the app; no scraping deps; spec FR-011..014 wants clear fallback.
- **Alternatives rejected**: Third-party scrapers (fragile/ToS), client-side only parsing (no vision).

## R11. Badges

- **Decision**: Deterministic rules evaluated after each check-in: `FIRST_TRIP`, `FIVE_CITIES`, `THREE_COUNTRIES` (stored as `Badge.type` string, so new types need no migration). Awarded with upsert; shown on profile + trip sidebar.
- **Rationale**: Cheap stickiness; spec keeps gamification small.
- **Alternatives rejected**: Points economy (scope), cron jobs (unnecessary — rules are check-in-triggered).

## R12. Recap + shareable image

- **Decision**: Recap data assembled server-side (`buildRecap()`); shareable image via `next/og` `ImageResponse` at `GET /api/recap/[token]/image` (built into Next — zero new deps). Recap public page lives under the same share token (`/Trip/share/[token]/recap`), so revocation rules apply uniformly.
- **Rationale**: Spec FR-025/026; no design drift if we reuse theme colors in the image.
- **Alternatives rejected**: Client canvas export (browser inconsistencies), external image services (new deps).

## R13. Group suggestions merge mechanics

- **Decision**: Suggestions are rows (`TripSuggestion`); votes are unique per user (`SuggestionVote`). Approve (owner only) appends the stop to the day's `activities` inside `AIResponse.itinerary` JSON and marks `APPROVED`; decline marks `DECLINED`. Join happens through the share link when `joinEnabled` is on (requires login), not email invites (mail infra is already present but link-join is the lower-friction MVP).
- **Rationale**: Matches spec FR-035..038; avoids a second invite-token system.
- **Alternatives rejected**: Email invites with tokens (duplicate of ShareLink, more states), real-time editing (spec only needs suggestions + votes).

## R14. Verification strategy (no test runner exists)

- **Decision**: Quality gates stay: `npx tsc --noEmit`, `npm run lint`, `npm run build`, plus scripted PowerShell HTTP smoke tests (the pattern used for the prior e2e pass), and a `prisma db push` dry check. No test framework is added in this feature.
- **Rationale**: The repo has no runner; adding Vitest/Jest is scope creep. Spec's success criteria are user-facing, validated via quickstart walkthroughs.
- **Alternatives rejected**: Introducing Jest/Vitest now (no team precedent in repo).

## R15. Feature-based organization (user directive)

- **Decision**: All new code lives in top-level `features/<feature>/` with co-located `actions.ts`, `schemas.ts`, `types.ts`, `lib.ts`, and `components/`. Shared primitives only when reused by 2+ features. Existing folders (`components/`, `actions/`, `FormsRelatedConfig/`, `data/`) keep working; files we touch move into their feature folder only when that reduces duplication. Routes stay in `app/` (framework requirement).
- **Rationale**: User explicitly asked for feature-based folders/components/types; avoids a risky big-bang refactor.
- **Alternatives rejected**: Mass migration of all legacy files (regression risk), `components/features/` nesting (less discoverable than top-level `features/`).
