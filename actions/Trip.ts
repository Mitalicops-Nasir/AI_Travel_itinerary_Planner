"use server";

import { RatingSchema } from "@/components/RatingForm";
import { db } from "@/data/db";
import { calculateTrendPercentage } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function GetAllTrips() {
  try {
    const data = await db.trip.findMany({
      include: {
        aiResponse: {
          select: {
            images: true,
            estimatedPrice: true,
            location: true,
            tags: true,
          },
        },
      },
    });

    return data;
  } catch (error) {
    console.log(error);
  }
}

export async function GetAllPopularTrips() {
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
      include: {
        aiResponse: {
          select: {
            images: true,
            estimatedPrice: true,
            location: true,
            tags: true,
          },
        },
      },
    });

    return data 
  } catch (error) {
    console.log(error);
  }
}

export async function getIndividualTrip(id: string) {
  try {
    const data = await db.trip.findUnique({
      where: {
        id: id,
      },
      include: {
        aiResponse: true,
      },
    });

    return data;
  } catch (error) {
    console.log(error);
  }
}

export async function setTripRating(
  TripID: string,
  rating: number,
  userId: string
) {
  try {
    const data = await db.tripRating.create({
      data: {
        tripId: TripID,
        userId: userId,
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
  }
}

export async function getTripRatingForAUser(TripID: string, userID: string) {
  try {
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
      const percentage = ((count / totalTrips) * 100).toFixed(2);
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

  const trip = await db.trip.groupBy({
    by: ["createdAt"],
    _count: true,
    where: {
      createdAt: {
        gte: new Date(`${currentYear}-01-01`),
        lte: new Date(`${currentYear}-12-31`),
      },
    },
  });

  // Group by month manually
  const monthlyCounts = Array.from({ length: 12 }, (_, i) => {
    // 'i' represents the month index (0 = Jan, 11 = Dec)

    const month = i;

    // Count how many trips were created in this month
    const count = trip.filter(
      (u) => new Date(u.createdAt!).getMonth() === month
    ).length;

    // Return an object with:
    // - the month's short name (e.g., "Jan", "Feb")
    // - the number of trips in that month
    return {
      month: new Date(2024, month).toLocaleString("default", {
        month: "short",
      }),
      count,
    };
  });

  // 3. Get last 2 months' counts
  const currentMonth = new Date().getMonth();
  const thisMonthCount = monthlyCounts[currentMonth]?.count || 0;
  const lastMonthCount = monthlyCounts[currentMonth - 1]?.count || 0;

  // 4. Calculate trend using your function
  const trend = calculateTrendPercentage(thisMonthCount, lastMonthCount);

  // 5. Return both separately
  return {
    monthlyCounts: monthlyCounts,
    trend,
  };
}
