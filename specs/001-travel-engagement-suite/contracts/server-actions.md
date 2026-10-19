# Contract: Server Actions — Travel Engagement & Monetization Suite

**Conventions**: All actions are `"use server"` in `features/<feature>/actions.ts`. Auth via existing `requireUser` / `requireAdmin` guards. Result shape follows the existing app pattern:

```ts
type ActionResult<T> = { success: true } & T | { success: false; error: string };
```

All inputs validated with Zod schemas co-located in `features/<feature>/schemas.ts`. Prices and quotas are always computed server-side from the database (never trusted from the client).

## features/travel-memory/actions.ts

```ts
getTravelProfile():
  ActionResult<{ profile: TravelProfileView | null; visited: VisitedDestinationView[] }>
  // auth required

upsertTravelProfile(input: TravelProfileInput):
  ActionResult<{ profile: TravelProfileView }>
  // TravelProfileInput = { pace?, budgetStyle?, interests: string[], dietaryNeeds?, accessibilityNeeds?, notes? }

addVisitedDestination(input: { country: string; city?: string; year?: number }):
  ActionResult<{ destination: VisitedDestinationView }>   // unique per user+country+city (upsert)

removeVisitedDestination(id: string):
  ActionResult<{}>                                        // scoped to caller's own rows
```

## features/trip-import/actions.ts

```ts
previewImport(input: ImportRequest):
  ActionResult<{ draft: ImportDraft }>
  // ImportRequest = { kind: "text"; text: string } | { kind: "url"; url: string } | { kind: "image"; dataUrl: string }
  // ImportDraft   = { country: string | null; places: string[]; suggestedInterests: string[];
  //                   suggestedDuration: number | null; confidence: "high" | "medium" | "low"; note?: string }
  // auth required. URL fetch: 10s timeout, 500 KB cap. Never throws; low confidence → success with note.
```

## features/bookable-offers/actions.ts

```ts
logOfferClick(input: { tripId?: string; partner: PartnerId; kind: OfferKind; destination?: string }):
  ActionResult<{}>                       // auth optional; fire-and-forget from client

// lib.ts (pure, server-safe builders — the actual offer source in v1)
buildDayOffers(input: { country: string; city: string; dayNumber: number; interests: string[] }): PartnerOffer[]
buildEssentialsOffers(input: { country: string; startDate: Date | null }): EssentialsOffer[]
// PartnerId = "viator" | "getyourguide" | "booking" | "insurance" | "esim" | "car"
// PartnerOffer = { id; partner; title; kind: "activity" | "stay"; url; imageQuery: string; priceHint?: string }
// EssentialsOffer = { id; partner; kind: "insurance" | "esim" | "car"; title; url }
// Empty array when partner ids are not configured — UI hides the block (FR-009).
```

## features/trip-day-view/actions.ts

```ts
checkIn(input: { tripId: string; day: number; stopKey: string; stopTitle: string; note?: string }):
  ActionResult<{ checkIn: CheckInView; badgeEarned: BadgeView | null }>
  // auth required. Caller must be trip owner or member. Upserts by (tripId, userId, stopKey).
  // Runs badge rules after write; returns newly earned badge once (for toast, FR-022).

// lib.ts
stopKey(day: number, activityIndex: number): string            // `${day}:${activityIndex}`
getTripPhase(trip: { startDate: Date | null; endDate: Date | null; country: string }): TripPhase
getDestinationLocalNow(country: string): { timeZone: string; now: Date; formatted: string }
evaluateBadges(userId: string): Promise<BadgeView | null>
// TripPhase = "upcoming" | "active" | "completed" | "undated"
```

## features/trip-sharing/actions.ts

```ts
enableShare(tripId: string, input: { joinEnabled: boolean }):
  ActionResult<{ url: string; token: string }>       // owner only; creates or reactivates
pauseShare(tripId: string): ActionResult<{}>         // owner only
revokeShare(tripId: string): ActionResult<{}>        // owner only
regenerateShare(tripId: string): ActionResult<{ url: string; token: string }>  // owner only; new token
joinTrip(token: string): ActionResult<{ tripId: string }>
  // auth required; requires ShareLink ACTIVE + joinEnabled; inserts TripMember MEMBER (idempotent)

getPublicTrip(token: string): Promise<PublicTripView>  // no auth; see contracts/public-share.md
```

## features/trip-journal/actions.ts

```ts
addJournalEntry(formData: FormData):
  ActionResult<{ entry: JournalEntryView }>
  // fields: tripId, day?, note?, photos (File[] up to 6, 5 MB each) — owner/member only

updateJournalEntry(input: { id: string; note?: string; day?: number }): ActionResult<{ entry: JournalEntryView }>
deleteJournalEntry(id: string): ActionResult<{}>      // author only; also deletes stored photos

getJournalEntries(tripId: string):
  ActionResult<{ entries: JournalEntryView[] }>

// lib.ts
savePhoto(userId: string, file: File): Promise<string>     // returns public path; local-disk MVP (R6)
deletePhoto(path: string): Promise<void>
buildRecap(tripId: string): Promise<RecapData | null>      // assembled on read (no stored recap)
// RecapData = { title; country; city; route: RouteStop[]; visited: CheckInView[];
//               journal: JournalEntryView[]; stats: { days: number; stopsVisited: number; photos: number } }
```

## features/membership/actions.ts

```ts
getMembership():
  ActionResult<{ membership: MembershipView; quota: QuotaView }>
  // MembershipView = { tier: "FREE" | "PRO"; status; currentPeriodEnd: string | null }
  // QuotaView      = { used: number; limit: number | null; remaining: number | null }  // null = unlimited

createMembershipCheckout(): ActionResult<{ url: string }>   // Stripe subscription mode; requires STRIPE_PRO_PRICE_ID
openBillingPortal(): ActionResult<{ url: string }>          // Stripe customer portal

// lib.ts
isPro(userId: string): Promise<boolean>                     // tier PRO + status ACTIVE + period not ended
assertCanGenerate(userId: string): Promise<{ ok: true } | { ok: false; error: string }>
  // called by GenerateAITripIternary before the AI call (FR-027/FR-030)
applySubscriptionEvent(event: Stripe.Event): Promise<void>
  // called from app/api/webhooks/stripe/route.ts; handles checkout.session.completed (mode=subscription),
  // customer.subscription.updated / .deleted → upsert Membership by stripeCustomerId
```

## features/curated-trips/actions.ts

```ts
setCuratedFlags(tripId: string, input: { isCurated: boolean; priceInCents?: number; isPublished: boolean }):
  ActionResult<{}>                                    // admin only; price required when isCurated

listCuratedTrips(): ActionResult<{ trips: CuratedTripView[] }>       // admin: all; public page: published only
getCuratedGate(tripId: string):
  ActionResult<{ trip: TripDetailsView; isCurated: boolean; hasAccess: boolean; priceInCents: number | null }>
  // hasAccess = not curated || Booking PAID exists for caller (FR-032)

createCuratedCheckoutSession(tripId: string): ActionResult<{ url: string }>
  // auth; requires isCurated + isPublished; price read from DB; metadata { kind: "curated", tripId, userId }

// lib.ts
cloneTripForBuyer(bookingId: string): Promise<void>
  // webhook-invoked on PAID curated booking; idempotent via Booking.copiedTripId (FR-033)
```

## features/group-trips/actions.ts

```ts
listMembers(tripId: string): ActionResult<{ members: TripMemberView[] }>   // owner/member only
removeMember(tripId: string, userId: string): ActionResult<{}>             // owner only
leaveTrip(tripId: string): ActionResult<{}>                                // member only (owner cannot leave)

suggestStop(input: { tripId: string; day: number; title: string; notes?: string }):
  ActionResult<{ suggestion: SuggestionView }>       // owner/member only (FR-036)

voteSuggestion(suggestionId: string): ActionResult<{ voted: boolean; voteCount: number }>
  // toggle upvote; owner/member only; one vote per user (unique constraint)

resolveSuggestion(suggestionId: string, decision: "approve" | "decline"):
  ActionResult<{ suggestion: SuggestionView }>
  // owner only. approve → appends { time: "Flexible", description: title(+notes) } to that day's
  // activities inside AIResponse.itinerary JSON, then marks APPROVED (FR-037). decline → DECLINED.
```

## Cross-feature wiring

| Caller | Callee | Note |
|--------|--------|------|
| `actions/CreateTrip.ts` (existing) | `features/membership/lib.assertCanGenerate` | Quota gate before AI call |
| `actions/CreateTrip.ts` (existing) | `features/travel-memory/lib.profileSummaryForPrompt` | Appends memory to prompt (FR-002) |
| `app/api/webhooks/stripe/route.ts` (existing) | `features/membership/lib.applySubscriptionEvent`, `features/curated-trips/lib.cloneTripForBuyer` | Marks booking PAID first (existing flow), then clone |
| `app/(dashboard)/layout.tsx` | `features/membership/components/ProBadge` | Tier badge in nav |
| Profile page | `features/trip-journal/components/BadgeShelf` | Badge display (FR-022) |
