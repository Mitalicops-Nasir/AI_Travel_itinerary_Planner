import {
  GetAllPopularTrips,
  getAverageRatingForTrip,
  getIndividualTrip,
  getTripRatingForAUser,
} from "@/actions/Trip";
import TheTripDetails from "@/components/TripDetails/TripDetails";
import { currentUser } from "@/lib/auth";
import { buildDayOffers, buildEssentialsOffers } from "@/features/bookable-offers/lib";
import { db } from "@/data/db";
import { buildTripDayViewModel, destinationTimeZone } from "@/features/trip-day-view/lib";
import { getShareState } from "@/features/trip-sharing/actions";
import { getTripAccess } from "@/lib/trip-access";
import { hasCuratedAccess } from "@/features/curated-trips/lib";
import type { DayOffersMap } from "@/features/bookable-offers/types";
import { notFound } from "next/navigation";
import React from "react";

const TripDetails = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const [user, individualTrip] = await Promise.all([
    currentUser(),
    getIndividualTrip(id),
  ]);

  if (!individualTrip) {
    notFound();
  }

  const [getTheUserRatingOfTrip, AverageRating, PopularTrips] =
    await Promise.all([
      getTripRatingForAUser(id, user?.id),
      getAverageRatingForTrip(id),
      GetAllPopularTrips(),
    ]);

  // Bookable offers are built server-side so partner ids never reach the client
  const dayOffers: DayOffersMap = Object.fromEntries(
    (individualTrip.aiResponse?.itineraryDays ?? []).map((day) => [
      day.day,
      buildDayOffers({
        country: individualTrip.country,
        city: day.location,
        dayNumber: day.day,
        interests: individualTrip.aiResponse?.interests,
      }),
    ])
  );

  const isUpcoming =
    individualTrip.startDate !== null &&
    individualTrip.startDate.getTime() > Date.now();

  const essentialsOffers = isUpcoming ? buildEssentialsOffers() : [];

  // Live trip state (today view / countdown / completed) — undated trips are untouched
  const checkIns = await db.checkIn.findMany({
    where: { tripId: id },
    orderBy: { checkedInAt: "asc" },
  });

  const tripDayView = buildTripDayViewModel({
    tripId: individualTrip.id,
    country: individualTrip.country,
    city: individualTrip.aiResponse?.location?.city ?? individualTrip.country,
    startDate: individualTrip.startDate,
    endDate: individualTrip.endDate,
    itineraryDays: individualTrip.aiResponse?.itineraryDays ?? [],
    checkIns,
  });

  // Sharing controls only for the trip owner
  const shareState = await getShareState(id);

  const access = user?.id ? await getTripAccess(db, id, user.id) : null;

  const journalEntries = access
    ? await db.journalEntry.findMany({
        where: { tripId: id },
        orderBy: { createdAt: "asc" },
      })
    : [];

  let journalPromptDay: number | null = null;

  if (access && tripDayView.phase === "active") {
    const timeZone = destinationTimeZone(individualTrip.country) ?? "UTC";
    const hour = Number(
      new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        hour12: false,
        timeZone,
      }).format(new Date())
    );

    const dayHasEntry = journalEntries.some(
      (entry) => entry.day === tripDayView.dayNumber
    );

    if (hour >= 18 && !dayHasEntry) {
      journalPromptDay = tripDayView.dayNumber;
    }
  }

  const share = shareState.success
    ? {
        state: shareState.state,
        joinEnabled: shareState.joinEnabled,
        url: shareState.url,
      }
    : null;

  // Premium curated trips: preview only until the viewer owns them (FR-032)
  const curatedInfo = await db.trip.findUnique({
    where: { id },
    select: {
      userId: true,
      isCurated: true,
      isPublished: true,
      curatedPriceInCents: true,
      user: { select: { name: true, email: true, image: true } },
    },
  });

  const curatedLocked =
    curatedInfo?.isCurated === true && !(await hasCuratedAccess(id, user?.id));

  // Group tools — only for people on the trip (FR-036/038)
  const groupSuggestions = access
    ? await db.tripSuggestion.findMany({
        where: { tripId: id },
        include: {
          author: { select: { name: true } },
          votes: { select: { userId: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const groupMembers = access
    ? await db.tripMember.findMany({
        where: { tripId: id },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { joinedAt: "asc" },
      })
    : [];

  const group =
    access && user?.id && curatedInfo
      ? {
          isOwner: access === "owner",
          suggestions: groupSuggestions.map((suggestion) => ({
            id: suggestion.id,
            day: suggestion.day,
            title: suggestion.title,
            notes: suggestion.notes,
            status: suggestion.status as
              | "OPEN"
              | "APPROVED"
              | "DECLINED",
            authorId: suggestion.authorId,
            authorName: suggestion.author?.name ?? "Traveler",
            voteCount: suggestion.votes.length,
            votedByMe: suggestion.votes.some(
              (vote) => vote.userId === user.id
            ),
            createdAt: suggestion.createdAt.toISOString(),
            resolvedAt: suggestion.resolvedAt
              ? suggestion.resolvedAt.toISOString()
              : null,
          })),
          members: [
            {
              userId: curatedInfo.userId,
              name: curatedInfo.user.name,
              email: curatedInfo.user.email,
              image: curatedInfo.user.image,
              role: "OWNER" as const,
              joinedAt: "",
            },
            ...groupMembers.map((member) => ({
              userId: member.userId,
              name: member.user.name,
              email: member.user.email,
              image: member.user.image,
              role: "MEMBER" as const,
              joinedAt: member.joinedAt.toISOString(),
            })),
          ],
        }
      : null;

  // Locked viewers never receive the full plan in the payload
  const tripForView =
    curatedLocked && individualTrip.aiResponse
      ? {
          ...individualTrip,
          aiResponse: {
            ...individualTrip.aiResponse,
            itineraryDays: [],
            bestTimeToVisit: [],
            weatherInfo: [],
            location: null,
          },
        }
      : individualTrip;

  return (
    <>
      <TheTripDetails
        individualTrip={tripForView}
        userId={user?.id}
        TheRating={getTheUserRatingOfTrip}
        AverageRatingForTrip={AverageRating}
        ThePopularTripsData={PopularTrips}
        dayOffers={curatedLocked ? {} : dayOffers}
        essentialsOffers={curatedLocked ? [] : essentialsOffers}
        tripDayView={curatedLocked ? undefined : tripDayView}
        share={share}
        journalEntries={journalEntries}
        journalPromptDay={journalPromptDay}
        curated={
          curatedInfo?.isCurated
            ? {
                priceInCents: curatedInfo.curatedPriceInCents,
                locked: curatedLocked,
                isPublished: curatedInfo.isPublished,
              }
            : null
        }
        group={curatedLocked ? null : group}
      />
    </>
  );
};

export default TripDetails;
