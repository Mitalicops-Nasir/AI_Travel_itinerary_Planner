"use server";

import { db } from "@/data/db";
import { requireUser } from "@/lib/guards";
import { buildMonthlyTrend } from "@/lib/monthly-trend";
import {
  toTripCard,
  toTripDetails,
  type TripCardView,
  type TripDetailsView,
} from "@/lib/trip-view";
import { revalidatePath } from "next/cache";

const TRIP_CARD_SELECT = {
  aiResponse: {
    select: {
      images: true,
      estimatedPrice: true,
      location: true,
      tags: true,
    },
  },
};

export async function GetAllTrips(): Promise<TripCardView[]> {
  try {
    const data = await db.trip.findMany({
      include: TRIP_CARD_SELECT,
    });

    return data.map(toTripCard);
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function GetAllPopularTrips(): Promise<TripCardView[]> {
  try {
    const data = await db.trip.findMany({
      where: {
        ratings: {
          some: {
            rating: {
              gte: 4,
            },
          },
        },
      },
      include: TRIP_CARD_SELECT,
    });

    return data.map(toTripCard);
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getIndividualTrip(
  id: string
): Promise<TripDetailsView | null> {
  try {
    const data = await db.trip.findUnique({
      where: {
        id: id,
      },
      include: {
        aiResponse: true,
      },
    });

    return data ? toTripDetails(data) : null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function setTripRating(TripID: string, rating: number) {
  try {
    const { user, error: authError } = await requireUser("Login to rate a trip");

    if (!user) {
      return { error: authError };
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { error: "Rating must be between 1 and 5" };
    }

    const data = await db.tripRating.upsert({
      where: {
        userId_tripId: {
          userId: user.id,
          tripId: TripID,
        },
      },
      update: {
        rating: rating,
      },
      create: {
        tripId: TripID,
        userId: user.id,
        rating: rating,
      },
    });

    revalidatePath(`/Trip/${TripID}/Trip-Details`);

    return {
      data: data,
      success: "Rated Successfully",
    };
  } catch (error) {
    console.log(error);
    return { error: "Could not save your rating" };
  }
}

export async function getTripRatingForAUser(TripID: string, userID?: string) {
  try {
    if (!userID) {
      return { UserRatingOfATrip: null };
    }

    const UserRatingOfATrip = await db.tripRating.findFirst({
      where: {
        userId: userID,
        tripId: TripID,
      },

      select: {
        rating: true,
      },
    });

    return {
      UserRatingOfATrip: UserRatingOfATrip,
    };
  } catch (error) {
    console.log(error);
    return { UserRatingOfATrip: null };
  }
}

export async function getAverageRatingForTrip(tripId: string) {
  try {
    const ratings = await db.tripRating.findMany({
      where: { tripId },
      select: { rating: true },
    });

    if (ratings.length === 0) return null;

    const total = ratings.reduce((sum, entry) => sum + entry.rating, 0);
    const average = total / ratings.length;

    return parseFloat(average.toFixed(2)); // round to 2 decimal place
  } catch (error) {
    console.log(error);
  }
}

export async function TripTrends() {
  try {
    const data = await db.trip.findMany({
      select: {
        id: true,
        createdAt: true,
        interests: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const TrendTrips = await db.trip.groupBy({
      by: ["interests"],
      _count: {
        _all: true,
      },
    });

    const PercentageTrends = TrendTrips.map((trend) => {
      const totalTrips = data.length;
      const count = trend._count._all;
      const percentage =
        totalTrips > 0 ? ((count / totalTrips) * 100).toFixed(2) : "0";
      return {
        interest: trend.interests,
        count: count,
        percentage: parseFloat(percentage),
      };
    });

    return PercentageTrends;
  } catch (error) {
    console.log(error);
  }
}

export async function getTotalTripGrowthPerMonth() {
  const currentYear = new Date().getFullYear();

  try {
    const trips = await db.trip.findMany({
      select: { createdAt: true },
      where: {
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31`),
        },
      },
    });

    return buildMonthlyTrend(trips.map((trip) => trip.createdAt));
  } catch (error) {
    console.log(error);
    return buildMonthlyTrend([]);
  }
}
