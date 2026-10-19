# Quickstart & Validation — Travel Engagement & Monetization Suite

**Feature**: `001-travel-engagement-suite`

## One-time setup

1. **Dependencies** (new):
   ```powershell
   npm install @radix-ui/react-dialog countries-and-timezones
   ```
2. **Schema**: `npx prisma db push` (additive only — safe for existing data; never run `db reset`).
3. **Seed** (optional sample data, upsert-only): `npm run seed`.
4. **New env vars** (add to `.env` and `.env.example`):
   ```text
   STRIPE_PRO_PRICE_ID=price_...            # Pro subscription price (Stripe dashboard)
   VIATOR_PARTNER_ID=                       # optional; empty = offer blocks hidden
   GETYOURGUIDE_PARTNER_ID=                 # optional
   BOOKING_AID=                             # optional
   ```
5. **Dev server**: `npm run dev` → http://localhost:3000 (admin: `admin@example.com` / `password123`).

## Quality gates (no test runner in repo)

```powershell
npx tsc --noEmit      # must be clean
npm run lint          # 0 errors (2 pre-existing benign warnings ok)
npm run build         # all routes build
```

Scripted HTTP smoke (PowerShell `WebRequestSession` pattern for login) — same approach as the previous e2e pass.

## Per-story validation walkthroughs

| Story | Steps | Pass condition |
|-------|-------|----------------|
| US1 Travel memory | Profile → set pace/interests/diet → generate trip → check prompt output; update profile → regenerate | New plan reflects profile without re-asking; old trips unchanged |
| US2 Bookable offers | Open trip with dates → inspect each day block; click an offer | ≥1 offer/day when partner ids set; correct destination URL; click logged (`OfferClick`); block hidden when ids unset |
| US2 Essentials | Open upcoming trip | Insurance/eSIM/car rows visible; links open partner pages |
| US3 Import | Generate → "Import from link/text/image" modal → paste travel blog URL / text / photo | Draft prefills form (country, interests); unrecognized input shows friendly error, manual form still works |
| US4 Day view | Set trip dates to include today (destination tz) | Trip opens on Today view with destination local time; countdown when future; completed state after end; undated trips show normal view |
| US4 Check-in | Today view → Check in on a stop (modal, note optional) | Stop marked visited with timestamp; appears on owner view; badge toast on first trip |
| US5 Share | Enable share → open link in private window (logged out) | Route/visited/journal visible, no email/payment data; pause → "paused" page; regenerate → old token dead; revoke → gone |
| US5 Badges | Check in across 5 distinct cities / 3 countries | FIVE_CITIES / THREE_COUNTRIES badges appear on profile; awarded once |
| US6 Journal | During trip: add entry (photos+note) via evening prompt modal; end trip → open Recap | Recap shows route, entries, stats; entry with failed photo upload keeps note + retry works |
| US7 Membership | As free user generate 4th trip in a month | 3rd works; 4th shows limit modal + upgrade; existing trips still open; after Pro checkout (test mode) → unlimited; cancel via portal → reverts at period end |
| US8 Curated | Admin marks trip premium + price + publish → open as other user | Preview-only + buy button; after Stripe test payment → full plan + personal copy in "my trips"; cancel payment → still locked, no charge |
| US9 Groups | Share with `joinEnabled` → second account joins → suggest stop → vote → owner approves | Suggestion merges into day's activities; decline marks DECLINED; member removed can no longer see trip; free tier 4th member blocked |
| FR-044/045 | Any quick action (check-in, journal, import, share, upgrade) | Opens in modal, stays on page; feedback < 1 s; sonner toast; no full reload |
| FR-040 | All new screens in light + dark | No theme drift; tokens only; screenshot compare |

## Share-link safety spot checks

```powershell
# 1) Create share link as owner → copy token from UI
# 2) Fetch public payload logged OUT:
Invoke-RestMethod "http://localhost:3000/api/public/trips/<token>"
# 3) Assert: no email/userId/booking/estimatedPrice fields in JSON
# 4) Pause link → payload must be { state: "paused", ... } only
# 5) Revoke link → state "revoked"; increase token length attempts → invalid
```

## Webhook spot checks (Stripe CLI)

```powershell
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# membership: checkout.session.completed (subscription) → Membership row PRO/ACTIVE
# curated: checkout.session.completed (metadata.kind=curated) → Booking PAID + copiedTripId set + buyer's Trip exists
# replay same event → no duplicate copy (idempotent)
```

## Rollout order

Workstreams in spec priority order (each independently shippable): offers → memory → import → day view → sharing/badges → journal/recap → membership → curated → groups. Existing `tsc`/`lint`/`build` gates must pass after every workstream; DB pushes are additive only.
