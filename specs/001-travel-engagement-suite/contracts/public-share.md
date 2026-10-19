# Contract: Public Share Data — Follow-Along, Recap, Polling

**Endpoints**: `GET /api/public/trips/[token]` (polling) and the same payload feeds `/Trip/share/[token]` and `/Trip/share/[token]/recap` server pages.

## Safety rules (FR-019, FR-041)

1. **Allowlist only** — the serializer (`toPublicTripView`) builds every field explicitly. No spread of Prisma rows, ever.
2. **Never expose**: user email/id, payments/bookings, ratings, suggestions/votes, other members, exact budget, `AIResponse.estimatedPrice`, private journal entries (no "private" flag exists — journal is shared by default; if a traveler wants privacy they do not add it, and can delete entries).
3. **Share state gates**: `PAUSED` / `REVOKED` / unknown token → `state` only, no trip data. `ACTIVE` → full payload.
4. **Location precision**: only checked-in stops are shown. No live GPS, no device location.
5. **Traveler identity**: first name only (`name.split(" ")[0]`), no avatar-less fallback needed (existing `image` allowed if present).
6. **Caching**: `Cache-Control: no-store` on the polling endpoint; pages are dynamic.

## Payload

```ts
type PublicTripView = {
  state: "active" | "paused" | "revoked" | "invalid";
  updatedAt: string;                                  // ISO — poll diffing
  traveler: { firstName: string; image: string | null } | null;   // null unless state === "active"
  trip: {
    title: string;
    country: string;
    city: string;
    coverImage: string | null;
    startDate: string | null;                         // ISO date
    endDate: string | null;
    phase: "upcoming" | "active" | "completed" | "undated";
  } | null;                                           // null unless state === "active"
  route: Array<{ day: number; location: string; lat: number; lng: number }>;   // [] unless active
  visited: Array<{
    day: number;
    stopKey: string;
    stopTitle: string;
    checkedInAt: string;
    note: string | null;
    photoUrl: string | null;
  }>;                                                 // [] unless active
  journal: Array<{
    day: number | null;
    note: string | null;
    photos: string[];
    createdAt: string;
  }>;                                                 // [] unless active
};
```

## Page behavior (server components)

| State | `/Trip/share/[token]` | `/Trip/share/[token]/recap` |
|-------|----------------------|------------------------------|
| `active`, phase `upcoming` | Trip teaser + countdown + map of route (no visited yet) | "Trip has not started" state |
| `active`, phase `active` | Full follow-along: map, visited stops, timeline, polls every 30 s; "Join trip" button if logged in AND `joinEnabled` | Live recap-so-far |
| `active`, phase `completed` | Full view + prominent link to recap | Final recap + "Share this recap" + image download link |
| `paused` | Friendly "Sharing is paused" page, no data | same |
| `revoked` / `invalid` | "This link is no longer available" page | same |

- Both pages are mobile-first (they are the "parents following along" surface) and use existing theme tokens (`components/TripDetails/TripMap.tsx` reused for the map — read-only mode).
- Recap image: `GET /api/recap/[token]/image` renders 1200×630 PNG from the same allowlisted payload using existing theme colors; respects share state.

## Join flow (`joinEnabled`)

1. Logged-in viewer on an `active` share page sees **"Join this trip"**.
2. Click → `joinTrip(token)` server action → upsert `TripMember(MEMBER)` → toast + link to `/Trip/[id]/Trip-Details`.
3. Owner sees the new member in `TripMembersModal` (features/group-trips) and can remove them.
