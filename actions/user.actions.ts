"use server";

import { db } from "@/data/db";
import { currentUser } from "@/lib/auth";
import { calculateTrendPercentage } from "@/lib/utils";
import { revalidatePath } from "next/cache";

import { subMonths, startOfDay, endOfDay, format } from "date-fns";

export async function getAllUsers() {
  try {
    const GetCurrentUser = await currentUser();

    if (!GetCurrentUser) return null;

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,

        _count: {
          select: {
            trip: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      users,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function deleteUser(userId: string) {
  try {
    const GetCurrentUser = await currentUser();

    if (!GetCurrentUser) return null;

    await db.user.delete({
      where: {
        id: userId,
      },
    });

    revalidatePath("/all-users");

    return { success: "User deleted successfully" };
  } catch (error) {
    console.log(error);
  }
}

export async function getUserGrowthPerMonth() {
  const currentYear = new Date().getFullYear();

  const users = await db.user.groupBy({
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
    const month = i; // 0 to 11
    const count = users.filter(
      (u) => new Date(u.createdAt!).getMonth() === month
    ).length;

    return {
      month: new Date(2024, month).toLocaleString("default", {
        month: "short",
      }), // Jan, Feb, etc.
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

export async function getActiveUserToday() {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Same day last month
    const lastMonthSameDay = subMonths(now, 1);
    const lastMonthSameDayStart = startOfDay(lastMonthSameDay);
    const lastMonthSameDayEnd = endOfDay(lastMonthSameDay);

    // Count users registered today
    const usersToday = await db.user.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // Count users registered on same day last month
    const usersLastMonthSameDay = await db.user.count({
      where: {
        createdAt: {
          gte: lastMonthSameDayStart,
          lte: lastMonthSameDayEnd,
        },
      },
    });

    const trend = calculateTrendPercentage(usersToday, usersLastMonthSameDay);

    const monthlyCounts = [
      {
        label: format(lastMonthSameDay, "MMM dd"),
        count: usersLastMonthSameDay,
      },
      {
        label: format(now, "MMM dd"),
        count: usersToday,
      },
    ];

    return {
      activeUserToday: usersToday,
      monthlyCounts: monthlyCounts,
      trend: trend,
    };
  } catch (error) {
    console.log(error);
  }
}
