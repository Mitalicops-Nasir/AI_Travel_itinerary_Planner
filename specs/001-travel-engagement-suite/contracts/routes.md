# Contract: Routes & Pages — Travel Engagement & Monetization Suite

**Conventions**: Next.js App Router. Existing route naming (`app/Trip/...`, capitalized) is preserved. New public routes are anonymous-access and must be added to `publicRoutes` in `routes.ts` (middleware). All new pages reuse the app theme tokens and existing components; quick actions open modals (FR-044).

## New pages

| Route | Access | Purpose | Key data |
|-------|--------|---------|----------|
| `/Trip/[id]/Trip-Details` *(extended)* | owner / member / paid buyer | Hosts all trip features | Single `Promise.all`: trip+gates+share+checkins+journal+suggestions+quota |
| `/Trip/[id]/Recap` | owner / member | Private recap page with share actions | `buildRecap(tripId)` |
| `/Trip/share/[token]` | public (no login) | Follow-along view (route map, visited stops, journal) + "Join trip" button when logged in | `getPublicTrip(token)`; polls `/api/public/trips/[token]` every 30 s |
| `/Trip/share/[token]/recap` | public (no login) | Public recap page | `getPublicTrip(token)` (journal included) |
| `/pro` (under `app/(dashboard)/`) | logged-in | Plan comparison, upgrade CTA, manage billing, quota status | `getMembership()` |
| `/curated-trips` (under `app/(dashboard)/`) | admin only | Curated trip management table (toggle premium, set price, publish) | `listCuratedTrips()` |
| `/profile` *(extended if exists, else created under dashboard)* | logged-in | Travel taste editor, visited destinations, badges | `getTravelProfile()`, badge shelf |

## New API routes

| Route | Method | Access | Purpose | Contract |
|-------|--------|--------|---------|----------|
| `/api/public/trips/[token]` | GET | public | Polling JSON for follow-along page | `contracts/public-share.md` |
| `/api/recap/[token]/image` | GET | public | Shareable recap image (PNG) via `next/og` `ImageResponse` | Returns image; 404 for inactive links |
| `/api/webhooks/stripe` *(extended)* | POST | public (signature) | Adds: membership events, curated purchase clone | existing verification unchanged |

## Middleware additions (`routes.ts`)

Add to `publicRoutes`:

```
"/Trip/share",          // public follow-along + recap pages
"/api/public/trips",    // polling endpoint
"/api/recap",           // recap image endpoint
```

`/api/webhooks/stripe` is already public. Everything else keeps existing auth behavior.

## Trip-Details page composition (integration point)

`app/Trip/[id]/Trip-Details/page.tsx` becomes the single host that renders feature components (server component; data loaded in one `Promise.all`):

```tsx
<TripDetails ...existing />                      // existing visual, unchanged theme
<TripPhaseBanner phase={...} localTime={...} />  // features/trip-day-view  (FR-015/016)
<BookableOffersCard offers={...} />              // features/bookable-offers (per itinerary day)
<EssentialsRow offers={...} />                   // features/bookable-offers (upcoming trips only)
<ShareControls share={...} />                    // features/trip-sharing    (modal)
<SuggestionsPanel ... />                         // features/group-trips     (members only)
<JournalTimeline ... />                          // features/trip-journal
```

- Locked preview: when `isCurated && !hasAccess`, only overview + images render; itinerary/offers/journal/suggestions are replaced by `PurchasePreviewGate` (features/curated-trips).
- `TripDayView` takes over the main slot when `phase === "active"`.
- All modals mount here once (dialog primitive) and are opened by triggers from any card.

## New shared UI primitives

| File | Source | Used by |
|------|--------|---------|
| `components/ui/dialog.tsx` | new (Radix Dialog, same shadcn-style pattern as `dropdown-menu.tsx`) | all feature modals |

`sonner` toasts (already installed) are the standard feedback channel; no new toast library.
