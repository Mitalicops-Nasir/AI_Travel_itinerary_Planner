# Feature Specification: Travel Engagement & Monetization Suite

**Feature Branch**: `001-travel-engagement-suite`

**Created**: 2026-10-18

**Status**: Draft

**Input**: User description: "yes go ahead with all those features every one of em, although the later ones dont do em now, keep in as archive, we may do em in future. but ye proceed. remember to use feature based architecture folder and components and types alike. all of it. so code base is organized. also remember use the apps theme. do not drift away from app theme."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Personal Travel Memory (Priority: P1)

A traveler saves their travel taste once — pace, budget style, interests, food needs, accessibility needs — and every new trip plan is automatically adapted to them. They never re-type the same preferences again. Places they have already visited can be remembered so future plans avoid (or intentionally include) them.

**Why this priority**: This is the personalization foundation. Research shows a "memory layer" is a 2026 must-have, and competitor reviews rank shallow personalization as the biggest weakness in rival planners. It also feeds every other feature (import, recommendations, group trips).

**Independent Test**: Create a profile with specific preferences (e.g., vegetarian food, slow pace, museums), generate a trip, and confirm the resulting plan reflects those preferences without re-entering them.

**Acceptance Scenarios**:

1. **Given** a new user with no profile, **When** they create a trip, **Then** the trip generation still works, and they are offered (optionally) to save preferences afterward.
2. **Given** a user with saved preferences, **When** they generate a new trip, **Then** the plan is adapted to those preferences without asking the same questions again.
3. **Given** a user updates their preferences, **When** they generate a new trip, **Then** the new preferences are used, and previously created trips are not changed.
4. **Given** a user marks a destination as "already visited", **When** planning a new trip, **Then** that destination is treated as known context (e.g., not suggested as a first-time highlight).

---

### User Story 2 - Bookable Recommendations & Travel Essentials (Priority: P1)

Every itinerary day shows real, bookable options — tours, activities, stays — through trusted partner links, so a plan is never "dead text". Before a trip, a "travel essentials" area offers relevant extras such as travel insurance, eSIM, and car rental. The traveler is clearly told that booking happens on the partner's site.

**Why this priority**: This is the first revenue stream and it is low effort (tracked links, no in-app booking engine). Research shows tours/activities carry the highest commissions (roughly 8–30%) versus hotels and flights, and "bookable plan" is the top user complaint about planner apps.

**Independent Test**: Open any saved trip with itinerary days and confirm each day shows at least one bookable recommendation with title, image, rating, price range, and a working partner link — and that a trip with no partner coverage shows no broken block.

**Acceptance Scenarios**:

1. **Given** a saved trip with itinerary days, **When** the traveler views a day, **Then** at least one bookable recommendation (activity or stay) is shown for that location with a clear price signal.
2. **Given** upcoming trip dates and a destination, **When** the traveler views the essentials area, **Then** insurance, eSIM, and car rental options are available.
3. **Given** a traveler clicks a bookable recommendation, **When** the partner page opens, **Then** it opens with the correct destination context and the referral is tracked.
4. **Given** a location has no partner coverage, **When** the day is viewed, **Then** no empty or broken offer block appears.

---

### User Story 3 - Import a Trip From Anywhere (Priority: P2)

A traveler pastes a link (video, blog, social post), a screenshot, or a simple list of places, and the app drafts a trip from that content: destination detected, places extracted, form prefilled. The traveler reviews and edits the draft before saving.

**Why this priority**: This is the standout "wow" feature of the category (rival "start anywhere" features are repeatedly named as the killer differentiator). It gives the fastest path from inspiration to a saved trip.

**Independent Test**: Paste a travel blog link containing recognizable places and confirm a draft trip is proposed with the right destination and places, fully editable.

**Acceptance Scenarios**:

1. **Given** pasted content with recognizable places, **When** import runs, **Then** a draft trip is proposed with destination and places, and the traveler can edit everything before saving.
2. **Given** content the app cannot understand, **When** import fails, **Then** a clear, plain-language message appears and manual trip creation remains available.
3. **Given** a draft created by import, **When** the traveler continues editing, **Then** the normal trip creation flow is used (no separate dead-end path).

---

### User Story 4 - Trip Day View (Priority: P2)

When the trip dates arrive, the trip opens directly to a "Today" view: today's plan, the next stop, local time at the destination, and the day's details. Before the trip it shows a countdown; after it ends it shows a completed state.

**Why this priority**: Research shows trip planners lose users exactly when the trip starts. In-trip usefulness is what creates loyalty and daily active use.

**Independent Test**: Create a trip whose dates include today and confirm the trip page opens on a "Today" view with the current day's plan and destination local time.

**Acceptance Scenarios**:

1. **Given** a trip with dates where today is inside the range, **When** the trip is opened, **Then** the "Today" view is shown by default with today's plan and destination local time.
2. **Given** a trip that starts in the future, **When** it is opened, **Then** a clear countdown is shown alongside the normal planning view.
3. **Given** a trip that already ended, **When** it is opened, **Then** a completed state is shown.

---

### User Story 5 - Check-ins, Badges & Follow-Along Sharing (Priority: P2)

During the trip, the traveler checks in at stops ("I'm here"), optionally with a photo or note. Friends and family open a public share link — with no account and no app install — and follow the journey on a map, seeing visited stops and the latest updates. The traveler earns simple milestone badges from their travel history. The traveler can pause, revoke, or regenerate the share link at any time.

**Why this priority**: This is the strongest emotional feature in the category (family-following loops drive daily loyalty in rival products), and it drives organic growth — every shared link is free marketing.

**Independent Test**: Start a trip, check in at a stop, open the share link in a private browser window with no account, and confirm the visited stop and update appear on the map; then revoke the link and confirm the public view stops showing details.

**Acceptance Scenarios**:

1. **Given** an active trip, **When** the traveler checks in at a stop, **Then** the stop is marked as visited with a timestamp and appears in the traveler's trip history.
2. **Given** sharing is enabled, **When** a friend opens the share link without an account, **Then** they see the route, visited stops, and shared updates — and nothing private (no email, no payment info).
3. **Given** the traveler revokes or pauses the share link, **When** someone opens the link, **Then** the public view no longer shows trip details and says sharing is unavailable.
4. **Given** a traveler accumulates check-ins, **When** they reach milestones (e.g., first trip, first 5 cities, first 3 countries), **Then** a badge is awarded and visible on their profile.

---

### User Story 6 - Trip Journal & End-of-Trip Recap (Priority: P3)

Each evening during a trip, the traveler is gently prompted (skippable) to add a journal entry: photos plus a short note. When the trip ends, the app automatically creates a beautiful recap — route on the map, places visited, photos, and small stats — that the traveler can share.

**Why this priority**: The recap is a keepsake that pulls the traveler back after the trip and is freely shareable, giving organic marketing. Rival products have proven this retention loop for years.

**Independent Test**: Run a trip to its end with at least one journal entry and confirm a recap is generated showing the route, entries, and stats, with a working share action.

**Acceptance Scenarios**:

1. **Given** a day of an active trip has ended, **When** the traveler opens the trip, **Then** they are prompted (non-blocking, skippable) to add a journal entry for that day.
2. **Given** a trip has ended, **When** the traveler opens it, **Then** a recap is generated automatically showing route, places, entries, and basic stats.
3. **Given** a recap exists, **When** the traveler shares it, **Then** a shareable page and/or image is produced that non-users can view.
4. **Given** a trip has no journal entries, **When** the recap is generated, **Then** it is still created from check-ins and the plan (never empty or broken).

---

### User Story 7 - Pro Membership (Priority: P3)

Free accounts get a generous but limited experience: a monthly cap on AI trip generations and limited group size. Pro members get unlimited trip generations, unlimited group members, and export options (e.g., PDF itineraries), so heavy planners have a clear reason to pay. Usage remaining is always visible, and hitting a limit never deletes or locks existing trips.

**Why this priority**: Subscriptions are proven in this category (roughly $5–10/month benchmarks). The free tier must stay strong so growth is not hurt; Pro targets power users.

**Independent Test**: As a free user, reach the monthly generation limit, confirm the upgrade path appears and existing trips are untouched; then activate Pro and confirm the limit disappears; then cancel and confirm access lasts until the period ends.

**Acceptance Scenarios**:

1. **Given** a free user who reached the monthly trip-generation limit, **When** they try to generate another trip, **Then** remaining usage and an upgrade option are shown, and all existing trips remain fully accessible.
2. **Given** a Pro member, **When** they generate trips or invite group members, **Then** no free-tier caps apply.
3. **Given** a member cancels Pro, **When** the paid period ends, **Then** access returns to free-tier limits without data loss.

---

### User Story 8 - Curated Paid Trips (Priority: P3)

Administrators can publish premium ready-made trips with a price (e.g., expert-designed multi-day itineraries). Travelers preview them and buy them; after purchase, the full plan is unlocked and copied into the traveler's own trips, where they can personalize it.

**Why this priority**: This is the highest revenue per user and reuses the existing trip purchase flow and admin tools almost entirely.

**Independent Test**: As an admin, mark a trip as premium with a price; as a traveler, see only a preview, purchase it successfully, and confirm the full plan appears in the traveler's trips.

**Acceptance Scenarios**:

1. **Given** an admin, **When** they create or edit a trip, **Then** they can mark it as premium with a price and choose to publish or unpublish it.
2. **Given** a traveler who has not purchased a premium trip, **When** they open it, **Then** they see a preview (not the full plan) with a clear purchase option.
3. **Given** a successful purchase, **When** the traveler returns to the trip, **Then** the full plan is unlocked and a personal, editable copy is in their trips.
4. **Given** a failed or abandoned payment, **When** the traveler returns, **Then** the trip stays locked and no charge occurred.

---

### User Story 9 - Group Trips With Suggestions & Voting (Priority: P3)

A trip owner invites friends to a trip. Members view the same plan, suggest new stops or changes, and vote on each other's suggestions. The owner approves suggestions to merge them into the plan, so group trips end arguments instead of starting them.

**Why this priority**: Group planning is where rival products win users (multiple users per trip makes growth cheaper), but it depends on the earlier stories, so it comes last.

**Independent Test**: Invite a second account to a trip, submit a suggestion from that account, vote from another, and confirm the owner can merge it into the plan.

**Acceptance Scenarios**:

1. **Given** a trip owner, **When** they invite members, **Then** invitees can join the trip and see the same plan.
2. **Given** a trip member, **When** they suggest a stop, **Then** other members can vote on the suggestion.
3. **Given** a suggestion with votes, **When** the owner approves it, **Then** it is merged into the itinerary; declined suggestions are clearly marked.
4. **Given** a group trip on the free tier, **When** the member limit is reached, **Then** additional invites require Pro, and existing members keep access.

---

### Edge Cases

- **Import ambiguity**: imported content mentions multiple destinations — the app must ask or propose the most likely destination, never silently guess wrong.
- **Share privacy**: public views must show only route, visited stops, and explicitly shared updates; traveler location precision is limited to checked-in stops (no live GPS tracking); expired, paused, or revoked links show a clear "sharing unavailable" state.
- **Time zones**: "Today" is determined by the destination's local time, not the traveler's device time zone.
- **Date changes**: if trip dates move while a trip is active, the day view must recalculate immediately.
- **Weak or no connectivity during a trip**: the traveler gets a friendly plain-language notice; the app must not corrupt or lose check-ins made just before connectivity drops.
- **Payment failures**: failed subscription payments and failed trip purchases must never remove access mid-period or leave trip data in a locked-corrupt state.
- **Journal upload failures**: a failed photo upload must keep the written note and allow retry.
- **Partner outage**: if one partner service is unavailable, other blocks still render; no blank or broken sections.
- **Account deletion**: deleting an account revokes its share links and stops public views; purchased content follows the existing deletion rules.

## Requirements *(mandatory)*

### Functional Requirements

**Travel Memory**

- **FR-001**: The system MUST let registered travelers save travel preferences: pace, budget style, interests, dietary needs, and accessibility needs.
- **FR-002**: The system MUST automatically apply saved preferences when generating a new trip, without re-asking what is already known.
- **FR-003**: Travelers MUST be able to update preferences at any time; updated preferences MUST affect only future generations.
- **FR-004**: Profile setup MUST be optional and skippable — the app remains fully usable without it.
- **FR-005**: The system MUST let travelers mark destinations as already visited and use that as context in future plans.

**Bookable Recommendations & Essentials**

- **FR-006**: The system MUST show at least one bookable partner recommendation (activity or stay) per itinerary day where partner coverage exists, including a title, image, rating when available, price signal, and a booking link.
- **FR-007**: Recommendation links MUST open the partner's site with the correct destination/date context and MUST carry referral tracking.
- **FR-008**: The system MUST present a travel essentials area (travel insurance, eSIM, car rental) when a trip has upcoming dates.
- **FR-009**: Where no partner coverage exists, the system MUST hide the offer area entirely (no empty or broken blocks).
- **FR-010**: The user interface MUST clearly indicate that external bookings complete on the partner's site.

**Import From Anywhere**

- **FR-011**: Travelers MUST be able to import trip ideas by pasting text or a link, or by uploading an image.
- **FR-012**: The system MUST detect the main destination and places from imported content and preface the trip creation workflow with them.
- **FR-013**: Travelers MUST be able to review and edit everything imported before saving the trip.
- **FR-014**: When imported content cannot be understood, the system MUST show a clear plain-language message and fall back to manual creation.

**Trip Day View**

- **FR-015**: The system MUST open an in-progress trip on a "Today" view (today's plan, next stop, destination local time) based on trip dates and destination local time.
- **FR-016**: The system MUST show a countdown for upcoming trips and a completed state for ended trips.
- **FR-017**: Travelers MUST be able to mark stops as visited ("check in") with a timestamp, and optionally a photo or note.

**Sharing & Follow-Along**

- **FR-018**: Travelers MUST be able to create a public share link for a trip that anyone can open without an account.
- **FR-019**: The public view MUST show only: route, visited stops, and traveler-shared updates — never private data (email, payments, unshared notes).
- **FR-020**: Travelers MUST be able to pause, revoke, and regenerate share links; revoked links MUST stop showing trip details.
- **FR-021**: Check-ins and shared journal updates MUST appear on the public view while sharing is active.

**Milestones**

- **FR-022**: The system MUST award simple milestone badges from check-in history (e.g., first trip, first 5 cities, first 3 countries), visible on the traveler's profile.

**Journal & Recap**

- **FR-023**: Travelers MUST be able to add journal entries (photos and/or text) per trip day.
- **FR-024**: The system MUST prompt (non-blocking, skippable) for a daily journal entry during active trips.
- **FR-025**: The system MUST automatically generate an end-of-trip recap containing route, places visited, journal entries, and basic stats.
- **FR-026**: Recaps MUST be shareable via a viewable page and/or image; sharing a recap never exposes private data.

**Membership**

- **FR-027**: Free accounts MUST have a monthly limit on AI trip generations and a group-size limit; limits MUST never remove access to existing trips or content.
- **FR-028**: Pro members MUST get unlimited trip generations, unlimited group members, and itinerary export options.
- **FR-029**: Travelers MUST be able to start and cancel a subscription; after cancellation, Pro access lasts until the paid period ends.
- **FR-030**: The interface MUST always show remaining usage to free users and present the upgrade path when a limit is reached.

**Curated Paid Trips**

- **FR-031**: Administrators MUST be able to mark trips as premium with a price and publish or unpublish them.
- **FR-032**: Unpurchased premium trips MUST show only a preview to travelers, with a clear purchase option.
- **FR-033**: A successful purchase MUST unlock the full plan and create a personal, editable copy in the buyer's trips.
- **FR-034**: Failed or abandoned payments MUST leave the trip locked with no charge recorded.

**Group Trips**

- **FR-035**: Trip owners MUST be able to invite members; invited members MUST see the same plan state.
- **FR-036**: Members MUST be able to suggest stops/changes and vote on suggestions.
- **FR-037**: The owner MUST be able to approve (merge) or decline suggestions; declines MUST be clearly marked.
- **FR-038**: Owners MUST be able to remove members, and members MUST be able to leave; free-tier group size is limited (default 3 members), Pro is unlimited.

**Cross-Cutting**

- **FR-039**: All new user-facing copy MUST be simple, plain English (non-native-speaker friendly).
- **FR-040**: All new interfaces MUST use the app's existing theme (colors, typography, spacing, components) in both light and dark mode — no new design system may be introduced.
- **FR-041**: Public views (share links, recaps) MUST NOT require login and MUST NOT leak private user data.
- **FR-042**: The app MUST degrade gracefully when any single external service is unavailable; other features keep working.
- **FR-043**: All existing functionality (authentication, trip creation, trip purchase, ratings, admin dashboard) MUST continue to work with no data loss.
- **FR-044**: Focused quick actions (e.g., check-in, journal entry, import, share-link settings, upgrade prompts, voting) MUST open in inline dialogs (modals) so travelers stay in context instead of navigating away from the page.
- **FR-045**: User actions MUST give visible feedback within 1 second and MUST NOT require full page reloads; the app must feel fluid and responsive like a modern SaaS product.

### Key Entities

- **Traveler Profile**: a traveler's saved travel preferences and visited-destination history; optional.
- **Trip**: a planned journey; now includes dates, status (upcoming / active / completed), share settings, premium flag (with price when curated), and group membership.
- **Itinerary Stop**: one place in a day's plan; has a visited state and can receive suggestions/votes.
- **Check-in**: a record that a stop was visited, with time and optional note/photo.
- **Journal Entry**: a dated memory attached to a trip (photos and/or text).
- **Share Link**: a public access token for a trip; can be active, paused, or revoked.
- **Membership**: a traveler's plan tier (free/pro), state, and period.
- **Curated Trip Offer**: a premium trip with a price and publish state.
- **Group Member / Suggestion / Vote**: people attached to a trip, their proposed changes, and votes on those changes.
- **Partner Offer**: a bookable partner recommendation tied to a location, with a tracked link.
- **Essentials Offer**: a non-trip-specific partner offer (insurance, eSIM, car rental).
- **Badge / Milestone**: an earned traveler achievement from check-in history.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new traveler can go from idea to a saved, personalized trip in under 3 minutes, with zero re-entry of previously saved preferences.
- **SC-002**: Every itinerary day with partner coverage presents at least one bookable recommendation; there are zero broken or empty offer blocks.
- **SC-003**: At least 60% of travelers who import content keep the drafted trip (import feels accurate and useful).
- **SC-004**: During an active trip, the app opens directly to today's plan in under 1 second on a typical phone.
- **SC-005**: Friends and family can follow a trip with zero account creation; at least 25% of active trips enable the share link.
- **SC-006**: At least 40% of active trip days receive a journal entry, and a recap is generated within 24 hours of trip end in 99% of completed trips.
- **SC-007**: Free-to-Pro conversion reaches 2–5% of monthly active planners (category benchmark).
- **SC-008**: At least 99% of bookable link clicks open the correct partner page with referral tracking intact.
- **SC-009**: In group trips, all members see the same plan state within 5 seconds of each other's changes.
- **SC-010**: After rollout, all pre-existing user flows (sign-up, login, trip creation, trip purchase, admin management) continue to pass with no regressions and no user data loss.

## Assumptions

- **Affiliate programs (business context)**: monetization launches with tracked affiliate links through free-to-join industry programs (e.g., Viator/GetYourGuide for tours ~8% commission with ~30-day cookies, Booking.com for stays, insurance/eSIM/car-rental networks). The product owner must register these accounts; links function before any enhanced partner access is granted.
- **Pricing defaults**: Pro priced around $5/month (category range $5–10); free tier defaults to 3 AI trip generations per month and 3 group members per trip. These are defaults, adjustable at launch.
- **No-account viewing**: share links and recaps are viewable without an account (validated by category leaders such as Polarsteps).
- **Group editing**: members need an account to suggest or vote; following a trip does not.
- **Offline**: full offline mode is not in scope for this release; only friendly degradation on weak connectivity.
- **Destination time**: "today" logic uses the destination's local time.
- **Theme constraint**: all new screens reuse the existing app theme and component style (existing design tokens and components, light + dark) — no visual drift. Every new interface is designed through the project's UI/UX design workflow and skills, not ad-hoc styling.
- **UX constraint (from user)**: quick, focused actions use modals/dialogs where necessary; interactions are fluid with smooth transitions and instant feedback, matching a modern SaaS app feel.
- **Architecture constraint (from user)**: new code is organized feature-by-feature (each feature owns its components, types, and logic in its own folder), consistent with the project's feature-based organization goal.
- **Reuse**: existing authentication, payment processing, and admin capabilities are reused; seed data is preserved (non-destructive database updates only).
- **Platform**: responsive web experience first; native mobile apps are out of scope.

## Out of Scope — Archived for Future

The user explicitly asked to archive these for possible future work, **not build now**:

- **Real in-app bookings**: completing flight/hotel/activity checkout inside the app (requires full booking-grade partner access).
- **Live price/availability data**: real-time supplier pricing feeds and price-drop alerts.
- **Printed photo books**: physical keepsakes made from trip journals.
- **Guide marketplace**: third-party local guides selling their own trip plans through the platform.
