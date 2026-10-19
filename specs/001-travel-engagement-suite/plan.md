# Implementation Plan: Travel Engagement & Monetization Suite

**Branch**: `001-travel-engagement-suite` | **Date**: 2026-10-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-travel-engagement-suite/spec.md`

## Summary

Implement nine engagement/monetization features on top of the existing AI trip planner: bookable affiliate offers (revenue), travel memory (personalization), import-from-anywhere, trip day view, check-ins + badges + follow-along share links (in-trip bond), journal + recap, Pro membership, curated paid trips, and group suggestions/voting. The four "later" items (in-app real bookings, live price feeds, printed photo books, guide marketplace) stay archived and are explicitly out of scope.

Technical approach (from Phase 0 research): all new code in `features/<name>/` folders (user directive) with co-located actions/schemas/types/lib/components; one new Radix Dialog primitive for modal-based quick actions; affiliate offers as server-built tracked links (no partner APIs); share links via UUID token + state machine with an allowlist serializer; destination-time-aware day view via `countries-and-timezones`; Stripe subscriptions + reused Booking flow for curated purchases; additive Prisma/MongoDB schema only.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22, Next.js 16.1.6 (App Router, Turbopack build), React 19.2.4

**Primary Dependencies**: Prisma 6.9 + MongoDB, NextAuth v5 beta.30, AI SDK v6 (`ai`, `@ai-sdk/google`, gemini-2.5-flash), Stripe 18, Tailwind v4 + Radix primitives + sonner (toasts), Zod 3.25, date-fns/react-datepicker, react-leaflet 5 (maps), Resend (mail), `crypto.randomUUID` (no dep). **New**: `@radix-ui/react-dialog` (modal primitive), `countries-and-timezones` (destination local time), `next/og` ImageResponse (built-in, recap image).

**Storage**: MongoDB via Prisma (additive schema); journal photos on local disk (`public/uploads/journal/`) through a swappable storage helper

**Testing**: No test runner in repo — gates are `npx tsc --noEmit`, `npm run lint`, `npm run build`, plus scripted PowerShell HTTP smoke tests and quickstart walkthroughs (`quickstart.md`)

**Target Platform**: Responsive web (desktop + mobile browsers); same deployment target as the existing app

**Project Type**: Single Next.js web application

**Performance Goals**: Day view renders < 1 s on mobile; all quick-action feedback < 1 s with no full reload (FR-045); public share page p95 < 2 s on 4G; follow-along polling every 30 s

**Constraints**: Existing app theme only (tokens/components, light + dark, no drift); quick actions in modals; simple plain-English copy; all DB changes additive (`prisma db push`, never reset/delete — user constraint); affiliate links only (no live supplier APIs in v1); non-destructive seed (upserts only)

**Scale/Scope**: Single-tenant web app; 9 feature slices; 11 new/extended Prisma models; ~8 new pages/routes; ~25 new components; free tier = 3 AI generations/month; scale target: thousands of users, MongoDB single instance

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution (`.specify/memory/constitution.md`) is an **unratified template** (placeholder sections only, no principles defined). No violations can be evaluated against it. Applying project conventions observed in the codebase and user directives instead:

| Project convention gate | Status |
|--------------------------|--------|
| Feature-based organization for all new code (user directive) | PASS — `features/<name>/` structure in Project Structure |
| Existing theme only, no visual drift (user directive) | PASS — reuses tokens/components; one new dialog primitive built in the existing shadcn-style pattern |
| Non-destructive database changes (user directive) | PASS — additive models/optional fields only; no resets/deletes |
| Simple plain-English user copy | PASS — copy constants per feature |
| Existing flows keep working (auth, checkout, ratings, admin) | PASS — extension points only (`CreateTrip` quota+memory hooks, webhook handlers, Trip-Details composition) |
| Lint/typecheck/build gates green | PASS — enforced per workstream in quickstart |

**Post-Phase-1 re-check**: No new violations introduced by the design (data model additive, contracts extension-only, no new deploy units). Gate re-confirmed.

## Project Structure

### Documentation (this feature)

```text
specs/001-travel-engagement-suite/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 decisions (R1–R15)
├── data-model.md        # Phase 1 Prisma model design
├── quickstart.md        # Phase 1 validation walkthroughs
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── contracts/
    ├── server-actions.md    # Action signatures per feature
    ├── routes.md            # Pages, API routes, middleware, page composition
    └── public-share.md      # Public payload + safety rules
```

### Source Code (repository root)

Existing structure (unchanged, reused): `app/` routes, `actions/` (legacy actions), `data/` (db + data helpers), `lib/` (shared helpers), `components/` (legacy + `ui/` primitives), `FormsRelatedConfig/` (existing forms), `prisma/`.

New feature-based structure (all new code):

```text
features/
├── travel-memory/
│   ├── actions.ts / schemas.ts / types.ts / lib.ts
│   └── components/         (TravelProfileModal, TravelTasteCard, VisitedDestinationsList)
├── trip-import/
│   ├── actions.ts / schemas.ts / types.ts / lib.ts
│   └── components/         (ImportTripModal, ImportPreviewForm)
├── bookable-offers/
│   ├── actions.ts / lib.ts / types.ts
│   └── components/         (BookableOffersCard, EssentialsRow, OfferLinkButton)
├── trip-day-view/
│   ├── actions.ts / lib.ts / types.ts
│   └── components/         (TripDayView, TodayStopCard, CountdownCard, CheckInModal)
├── trip-sharing/
│   ├── actions.ts / lib.ts / types.ts
│   └── components/         (ShareControls, FollowMap, PublicTripPage)
├── trip-journal/
│   ├── actions.ts / lib.ts / types.ts
│   └── components/         (JournalPromptModal, JournalTimeline, RecapView, BadgeShelf)
├── membership/
│   ├── actions.ts / lib.ts / types.ts
│   └── components/         (UpgradeModal, PlanCard, ProBadge)
├── curated-trips/
│   ├── actions.ts / lib.ts / types.ts
│   └── components/         (PremiumTripBadge, PurchasePreviewGate, CuratedTripAdminTable)
└── group-trips/
    ├── actions.ts / schemas.ts / types.ts / lib.ts
    └── components/         (TripMembersModal, SuggestionsPanel, SuggestStopModal, VoteButtons)

app/
├── (dashboard)/pro/page.tsx               # membership page
├── (dashboard)/curated-trips/page.tsx     # admin curated management
├── (dashboard)/profile/page.tsx           # taste editor + badges (extended/created)
├── Trip/[id]/Trip-Details/page.tsx        # extended host (single Promise.all composition)
├── Trip/[id]/Recap/page.tsx               # private recap
├── Trip/share/[token]/page.tsx            # public follow-along
├── Trip/share/[token]/recap/page.tsx      # public recap
├── api/public/trips/[token]/route.ts      # polling endpoint
├── api/recap/[token]/image/route.tsx      # ImageResponse PNG
└── api/webhooks/stripe/route.ts           # extended (membership + curated)

components/ui/dialog.tsx                   # new Radix Dialog primitive (existing pattern)
prisma/schema.prisma                       # extended (see data-model.md)
routes.ts                                  # publicRoutes additions
```

**Structure Decision**: Single Next.js project. All new code goes into top-level `features/<feature>/` folders that own their components, types, schemas, server actions, and pure logic (satisfies the user's feature-based architecture directive). Routes stay in `app/` because the framework requires it, but they are thin: they compose feature components and feature actions only. Legacy folders (`actions/`, `FormsRelatedConfig/`, `components/*`) are not mass-migrated (regression risk); existing files we must touch get folded into the relevant feature folder when that reduces duplication (e.g., trip creation gains memory/quota hooks in place, new logic lands in `features/`).

## Workstreams (implementation order = spec priority)

Each workstream is independently shippable and must keep `tsc`/`lint`/`build` green.

1. **WS1 — Bookable offers** (FR-006..010, US2): `features/bookable-offers` + dialog primitive + offer blocks in Trip-Details + `OfferClick` logging + admin dashboard offer stats column.
2. **WS2 — Travel memory** (FR-001..005, US1): profile model/actions/modal + prompt hook in `CreateTrip` + visited destinations UI.
3. **WS3 — Import anywhere** (FR-011..014, US3): import modal on trip creation page, Gemini extraction, draft prefill of existing form.
4. **WS4 — Trip day view** (FR-015..017, US4): date fields on trip creation + phase logic + Today view + CheckInModal/check-in action.
5. **WS5 — Sharing & badges** (FR-018..022, US5): ShareLink/CheckIn/Badge models, share controls modal, public pages/API, middleware additions, badge evaluation.
6. **WS6 — Journal & recap** (FR-023..026, US6): journal entries + photo storage helper + evening prompt + recap page + `next/og` image.
7. **WS7 — Membership** (FR-027..030, US7): Membership model, Stripe subscription checkout + portal, webhook events, quota gate in `CreateTrip`, `/pro` page + upgrade modals.
8. **WS8 — Curated trips** (FR-031..034, US8): admin flags + admin page, preview gate, curated checkout, webhook clone (`copiedTripId` idempotency).
9. **WS9 — Group trips** (FR-035..038, US9): TripMember/Suggestion/Vote models, join-via-share-link, members modal, suggestions panel + voting + owner approve/decline merge.

Cross-cutting applied in every WS: FR-039 (plain copy), FR-040 (theme), FR-044/045 (modals/fluidity), FR-042 (graceful degradation), FR-043 (no regressions).

## Complexity Tracking

> No constitution violations — table intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| — | — | — |
