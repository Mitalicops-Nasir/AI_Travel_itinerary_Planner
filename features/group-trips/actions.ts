"use server";

import { db } from "@/data/db";
import { requireUser } from "@/lib/guards";
import { getTripAccess } from "@/lib/trip-access";
import { revalidatePath } from "next/cache";
import { parseJsonField, type TripItineraryDay } from "@/lib/trip-view";
import { suggestionInput, type SuggestionInput } from "./schemas";
import type { GroupActionResult, MemberView, SuggestionView } from "./types";

const memberUserSelect = {
  select: { id: true, name: true, email: true, image: true },
};

type SuggestionRow = {
  id: string;
  day: number;
  title: string;
  notes: string | null;
  status: string;
  authorId: string;
  createdAt: Date;
  resolvedAt: Date | null;
  author: { name: string | null } | null;
  votes: { userId: string }[];
};

function toSuggestionView(
  row: SuggestionRow,
  viewerId: string
): SuggestionView {
  return {
    id: row.id,
    day: row.day,
    title: row.title,
    notes: row.notes,
    status: row.status as SuggestionView["status"],
    authorId: row.authorId,
    authorName: row.author?.name ?? "Traveler",
    voteCount: row.votes.length,
    votedByMe: row.votes.some((vote) => vote.userId === viewerId),
    createdAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt ? row.resolvedAt.toISOString() : null,
  };
}

export async function listMembers(
  tripId: string
): Promise<GroupActionResult<{ members: MemberView[] }>> {
  const { user, error } = await requireUser("Log in to see this group.");
  if (!user) return { success: false, error };

  const access = await getTripAccess(db, tripId, user.id);
  if (!access) return { success: false, error: "You need access to this trip." };

  const [trip, members] = await Promise.all([
    db.trip.findUnique({
      where: { id: tripId },
      select: { userId: true, user: memberUserSelect },
    }),
    db.tripMember.findMany({
      where: { tripId },
      include: { user: memberUserSelect },
      orderBy: { joinedAt: "asc" },
    }),
  ]);

  if (!trip) return { success: false, error: "Trip not found." };

  const owner: MemberView = {
    userId: trip.userId,
    name: trip.user.name,
    email: trip.user.email,
    image: trip.user.image,
    role: "OWNER",
    joinedAt: "",
  };

  return {
    success: true,
    members: [
      owner,
      ...members.map((member) => ({
        userId: member.userId,
        name: member.user.name,
        email: member.user.email,
        image: member.user.image,
        role: "MEMBER" as const,
        joinedAt: member.joinedAt.toISOString(),
      })),
    ],
  };
}

export async function removeMember(
  tripId: string,
  memberUserId: string
): Promise<GroupActionResult> {
  const { user, error } = await requireUser("Log in to manage this group.");
  if (!user) return { success: false, error };

  const trip = await db.trip.findUnique({
    where: { id: tripId },
    select: { userId: true },
  });

  if (!trip) return { success: false, error: "Trip not found." };

  if (trip.userId !== user.id) {
    return { success: false, error: "Only the trip owner can remove members." };
  }

  const deleted = await db.tripMember.deleteMany({
    where: { tripId, userId: memberUserId },
  });

  if (deleted.count === 0) {
    return { success: false, error: "That person is not on this trip." };
  }

  revalidatePath(`/Trip/${tripId}/Trip-Details`);

  return { success: true };
}

export async function leaveTrip(tripId: string): Promise<GroupActionResult> {
  const { user, error } = await requireUser("Log in to leave this trip.");
  if (!user) return { success: false, error };

  const trip = await db.trip.findUnique({
    where: { id: tripId },
    select: { userId: true },
  });

  if (!trip) return { success: false, error: "Trip not found." };

  if (trip.userId === user.id) {
    return {
      success: false,
      error: "Trip owners cannot leave their own trip.",
    };
  }

  const deleted = await db.tripMember.deleteMany({
    where: { tripId, userId: user.id },
  });

  if (deleted.count === 0) {
    return { success: false, error: "You are not a member of this trip." };
  }

  revalidatePath("/AI-Trips");

  return { success: true };
}

export async function suggestStop(
  input: SuggestionInput
): Promise<GroupActionResult<{ suggestion: SuggestionView }>> {
  const { user, error } = await requireUser("Log in to suggest a stop.");
  if (!user) return { success: false, error };

  const parsed = suggestionInput.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form.",
    };
  }

  const { tripId, day, title, notes } = parsed.data;

  const access = await getTripAccess(db, tripId, user.id);
  if (!access) {
    return { success: false, error: "Only trip members can suggest stops." };
  }

  const suggestion = await db.tripSuggestion.create({
    data: {
      tripId,
      authorId: user.id,
      day,
      title,
      notes: notes && notes.length > 0 ? notes : null,
    },
    include: {
      author: { select: { name: true } },
      votes: { select: { userId: true } },
    },
  });

  revalidatePath(`/Trip/${tripId}/Trip-Details`);

  return { success: true, suggestion: toSuggestionView(suggestion, user.id) };
}

export async function voteSuggestion(
  suggestionId: string
): Promise<GroupActionResult<{ voted: boolean; voteCount: number }>> {
  const { user, error } = await requireUser("Log in to vote.");
  if (!user) return { success: false, error };

  const suggestion = await db.tripSuggestion.findUnique({
    where: { id: suggestionId },
    select: { id: true, tripId: true, status: true },
  });

  if (!suggestion) return { success: false, error: "Suggestion not found." };
  if (suggestion.status !== "OPEN") {
    return { success: false, error: "This suggestion is already decided." };
  }

  const access = await getTripAccess(db, suggestion.tripId, user.id);
  if (!access) {
    return { success: false, error: "Only trip members can vote." };
  }

  const existing = await db.suggestionVote.findUnique({
    where: {
      suggestionId_userId: { suggestionId, userId: user.id },
    },
    select: { id: true },
  });

  if (existing) {
    await db.suggestionVote.delete({ where: { id: existing.id } });
  } else {
    await db.suggestionVote.create({ data: { suggestionId, userId: user.id } });
  }

  const voteCount = await db.suggestionVote.count({
    where: { suggestionId },
  });

  revalidatePath(`/Trip/${suggestion.tripId}/Trip-Details`);

  return { success: true, voted: !existing, voteCount };
}

export async function resolveSuggestion(
  suggestionId: string,
  decision: "approve" | "decline"
): Promise<GroupActionResult<{ suggestion: SuggestionView }>> {
  const { user, error } = await requireUser("Log in to manage suggestions.");
  if (!user) return { success: false, error };

  const suggestion = await db.tripSuggestion.findUnique({
    where: { id: suggestionId },
    include: {
      trip: { select: { userId: true } },
      author: { select: { name: true } },
      votes: { select: { userId: true } },
    },
  });

  if (!suggestion) return { success: false, error: "Suggestion not found." };

  if (suggestion.trip.userId !== user.id) {
    return {
      success: false,
      error: "Only the trip owner can decide on suggestions.",
    };
  }

  if (suggestion.status !== "OPEN") {
    return { success: false, error: "This suggestion is already decided." };
  }

  if (decision === "approve") {
    const aiResponse = await db.aIResponse.findUnique({
      where: { tripId: suggestion.tripId },
      select: { id: true, itinerary: true },
    });

    if (!aiResponse) {
      return {
        success: false,
        error: "This trip has no plan yet, so the idea cannot be added.",
      };
    }

    const raw = parseJsonField<unknown>(aiResponse.itinerary);
    const days: TripItineraryDay[] = Array.isArray(raw)
      ? (raw as TripItineraryDay[])
      : ((raw as { day?: TripItineraryDay[] } | null)?.day ?? []);

    const targetDay = days.find((entry) => entry.day === suggestion.day);

    if (targetDay) {
      const description = suggestion.notes
        ? `${suggestion.title} — ${suggestion.notes}`
        : suggestion.title;

      targetDay.activities = [
        ...(targetDay.activities ?? []),
        { time: "Flexible", description },
      ];

      await db.aIResponse.update({
        where: { id: aiResponse.id },
        data: { itinerary: days },
      });
    }
  }

  const updated = await db.tripSuggestion.update({
    where: { id: suggestionId },
    data: {
      status: decision === "approve" ? "APPROVED" : "DECLINED",
      resolvedAt: new Date(),
    },
    include: {
      author: { select: { name: true } },
      votes: { select: { userId: true } },
    },
  });

  revalidatePath(`/Trip/${suggestion.tripId}/Trip-Details`);

  return { success: true, suggestion: toSuggestionView(updated, user.id) };
}
