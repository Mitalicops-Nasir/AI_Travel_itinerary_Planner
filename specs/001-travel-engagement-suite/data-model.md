# Phase 1 Data Model — Travel Engagement & Monetization Suite

**Feature**: `001-travel-engagement-suite` | **Storage**: MongoDB via Prisma (`prisma/schema.prisma`)

All changes are **additive** (new models, new optional fields, new enums). MongoDB adds fields without data migration; existing rows remain valid. `prisma db push` is non-destructive and the seed script stays upsert-only.

## Extended models

### User *(existing — new relations only)*

| Field | Type | Notes |
|-------|------|-------|
| travelProfile | TravelProfile? | 1:1 profile (US1) |
| visitedDestinations | VisitedDestination[] | "already visited" memory (US1) |
| membership | Membership? | absent = free tier (US7) |
| badges | Badge[] | milestones (US5) |
| checkIns | CheckIn[] | (US5) |
| journalEntries | JournalEntry[] | (US6) |
| tripMemberships | TripMember[] | group joined trips (US9) |
| suggestions | TripSuggestion[] | authored suggestions (US9) |
| suggestionVotes | SuggestionVote[] | (US9) |

### Trip *(existing — new fields + relations)*

| Field | Type | Notes |
|-------|------|-------|
| startDate | DateTime? | optional; unset = no day view (US4) |
| endDate | DateTime? | derived at creation: startDate + duration − 1 |
| isCurated | Boolean @default(false) | premium curated trip (US8) |
| curatedPriceInCents | Int? | required when isCurated |
| isPublished | Boolean @default(false) | visible to travelers when true |
| copiedFromTripId | String? | set on buyer's personal copy (US8) |
| shareLink | ShareLink? | 1:1 (US5) |
| members | TripMember[] | (US9) |
| checkIns | CheckIn[] | (US5) |
| journalEntries | JournalEntry[] | (US6) |
| suggestions | TripSuggestion[] | (US9) |

### Booking *(existing — one new field)*

| Field | Type | Notes |
|-------|------|-------|
| copiedTripId | String? | idempotency marker for curated clone (US8) |

## New models

### TravelProfile (US1)

```
id                  String  @id @default(cuid()) @map("_id")
userId              String  @unique
user                User    @relation(fields: [userId], references: [id], onDelete: Cascade)
pace                String?            // relaxed | balanced | packed
budgetStyle         String?            // shoestring | mid-range | comfort | luxury
interests           String[]           // free-form tags, mirrors trip interests
dietaryNeeds        String?
accessibilityNeeds  String?
notes               String?
createdAt           DateTime @default(now())
updatedAt           DateTime @updatedAt
```

### VisitedDestination (US1)

```
id        String  @id @default(cuid()) @map("_id")
userId    String
user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
country   String
city      String?
year      Int?
createdAt DateTime @default(now())

@@unique([userId, country, city])
@@index([userId])
```

### ShareLink (US5)

```
id          String @id @default(cuid()) @map("_id")
tripId      String @unique
trip        Trip   @relation(fields: [tripId], references: [id], onDelete: Cascade)
token       String @unique                  // crypto.randomUUID()
state       ShareLinkState @default(ACTIVE) // ACTIVE | PAUSED | REVOKED
joinEnabled Boolean @default(false)         // allow logged-in friends to join (US9)
createdAt   DateTime @default(now())
updatedAt   DateTime @updatedAt

enum ShareLinkState { ACTIVE PAUSED REVOKED }
```

### TripMember (US9)

```
id       String @id @default(cuid()) @map("_id")
tripId   String
userId   String
role     TripMemberRole @default(MEMBER)   // OWNER | MEMBER
joinedAt DateTime @default(now())

trip Trip @relation(fields: [tripId], references: [id], onDelete: Cascade)
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@unique([tripId, userId])
@@index([userId])

enum TripMemberRole { OWNER MEMBER }
```

### CheckIn (US4/US5)

```
id          String @id @default(cuid()) @map("_id")
tripId      String
userId      String
day         Int
stopKey     String            // `${day}:${activityIndex}`
stopTitle   String
note        String?
photoUrl    String?
checkedInAt DateTime @default(now())

trip Trip @relation(fields: [tripId], references: [id], onDelete: Cascade)
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@unique([tripId, userId, stopKey])
@@index([tripId])
```

### JournalEntry (US6)

```
id        String @id @default(cuid()) @map("_id")
tripId    String
userId    String
day       Int?
note      String?
photos    String[]            // storage paths/URLs
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

trip Trip @relation(fields: [tripId], references: [id], onDelete: Cascade)
user User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@index([tripId])
```

### Badge (US5)

```
id       String @id @default(cuid()) @map("_id")
userId   String
type     String              // FIRST_TRIP | FIVE_CITIES | THREE_COUNTRIES (string for future types)
earnedAt DateTime @default(now())

user User @relation(fields: [userId], references: [id], onDelete: Cascade)

@@unique([userId, type])
```

### Membership (US7)

```
id                   String @id @default(cuid()) @map("_id")
userId               String @unique
tier                 MembershipTier @default(FREE)   // FREE | PRO
status               MembershipStatus @default(ACTIVE) // ACTIVE | PAST_DUE | CANCELED | EXPIRED
stripeCustomerId     String?
stripeSubscriptionId String?
currentPeriodEnd     DateTime?
createdAt            DateTime @default(now())
updatedAt            DateTime @updatedAt

user User @relation(fields: [userId], references: [id], onDelete: Cascade)

enum MembershipTier { FREE PRO }
enum MembershipStatus { ACTIVE PAST_DUE CANCELED EXPIRED }
```

Absent row = free tier. Pro = `tier PRO` AND `status ACTIVE` AND `currentPeriodEnd > now`.

### TripSuggestion (US9)

```
id         String @id @default(cuid()) @map("_id")
tripId     String
authorId   String
day        Int
title      String
notes      String?
status     SuggestionStatus @default(OPEN)  // OPEN | APPROVED | DECLINED
resolvedAt DateTime?
createdAt  DateTime @default(now())

trip   Trip   @relation(fields: [tripId], references: [id], onDelete: Cascade)
author User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
votes  SuggestionVote[]

@@index([tripId])

enum SuggestionStatus { OPEN APPROVED DECLINED }
```

### SuggestionVote (US9)

```
id           String @id @default(cuid()) @map("_id")
suggestionId String
userId       String
createdAt    DateTime @default(now())

suggestion TripSuggestion @relation(fields: [suggestionId], references: [id], onDelete: Cascade)
user       User           @relation(fields: [userId], references: [id], onDelete: Cascade)

@@unique([suggestionId, userId])
```

### OfferClick (US2 — analytics only, intentionally relation-less)

```
id          String @id @default(cuid()) @map("_id")
userId      String?
tripId      String?
partner     String    // viator | getyourguide | booking | insurance | esim | car
kind        String    // activity | stay | insurance | esim | car
destination String?
createdAt   DateTime @default(now())

@@index([partner])
@@index([createdAt])
```

## Derived data (no models)

| Concept | Rule |
|---------|------|
| Trip phase | `upcoming` (now < startDate), `active` (start ≤ now ≤ end, destination tz), `completed` (now > end), `undated` (no dates) |
| Free quota | Trip rows for user with `createdAt` in current calendar month; limit 3; Pro unlimited |
| Pro status | Membership tier PRO + status ACTIVE + currentPeriodEnd in future |
| Recap | Assembled on read from Trip + AIResponse + CheckIn[] + JournalEntry[] (no stored recap) |
| Badge rules | After each check-in: total distinct trips ≥1 → FIRST_TRIP; distinct checked-in cities ≥5 → FIVE_CITIES; distinct countries ≥3 → THREE_COUNTRIES |

## Migration notes

- `prisma db push` only; no reset, no deletes (user constraint: never delete DB data).
- New Trip fields optional → existing trips unaffected; they show as `undated` (no day view).
- Seed script may **add** sample data for new features (e.g., a curated demo trip, badges for mock users) using upserts only.
- `Booking.copiedTripId` nullable → no impact on existing bookings.
