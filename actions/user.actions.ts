"use server";

import { db } from "@/data/db";
import { requireAdmin, requireUser } from "@/lib/guards";
import { buildMonthlyTrend } from "@/lib/monthly-trend";
import { calculateTrendPercentage } from "@/lib/utils";
import { revalidatePath } from "next/cache";

import { subMonths, startOfDay, endOfDay, format } from "date-fns";

export async function getAllUsers() {
  try {
    const { user } = await requireUser();

    if (!user) return [];

    return await db.user.findMany({
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
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function deleteUser(userId: string) {
  try {
    const { user: admin, error: authError } = await requireAdmin(
      "Only admins can delete users"
    );

    if (!admin) return { error: authError };

    if (admin.id === userId) {
      return { error: "You cannot delete your own account" };
    }

    await db.user.delete({
      where: {
        id: userId,
      },
    });

    revalidatePath("/all-users");

    return { success: "User deleted successfully" };
  } catch (error) {
    console.log(error);
    return { error: "Could not delete user" };
  }
}

export async function getUserGrowthPerMonth() {
  const currentYear = new Date().getFullYear();

  try {
    const users = await db.user.findMany({
      select: { createdAt: true },
      where: {
        createdAt: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31`),
        },
      },
    });

    return buildMonthlyTrend(
      users
        .map((user) => user.createdAt)
        .filter((date): date is Date => date != null)
    );
  } catch (error) {
    console.log(error);
    return buildMonthlyTrend([]);
  }
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
