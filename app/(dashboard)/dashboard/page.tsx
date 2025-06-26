import { getTotalTripGrowthPerMonth, TripTrends } from "@/actions/Trip";
import {
  getActiveUserToday,
  getAllUsers,
  getUserGrowthPerMonth,
} from "@/actions/user.actions";
import {
  AdminDasboardTable,
  AdminDasboardTableSecond,
} from "@/components/AdminDashboard/AdminDasboardTable";

import { ChartArea } from "@/components/Charts/AreaChart";
import { ChartBarDefault } from "@/components/Charts/BarCharts";
import React from "react";

const page = async () => {
  const TheTripTrends = await TripTrends();
  const UserGrowthPerMonth = await getUserGrowthPerMonth();
  const TotalTripGrowthPerMonth = await getTotalTripGrowthPerMonth();
  const ActiveUserTodayVSLastMonthSameDay = await getActiveUserToday();

  const LatestUsers = await getAllUsers();
  return (
    <div className="w-full p-[2%]">
      <ChartArea
        ThePerMonthComparisonUser={UserGrowthPerMonth}
        ThePerMonthComparisonTrip={TotalTripGrowthPerMonth}
        ThePerMontActiveUserTodayCompare={ActiveUserTodayVSLastMonthSameDay}

        
        TotalUsersTrendStat={UserGrowthPerMonth.trend.trend}
        TotalTripsTrendStat={TotalTripGrowthPerMonth.trend.trend}
        TotalActiveUserTrendStat={
          ActiveUserTodayVSLastMonthSameDay?.trend.trend
        }
      />

      <ChartBarDefault
        TheChartDataSecond={TheTripTrends}
        TheChartDataFirst={UserGrowthPerMonth}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <div className="p-[19px] drop-shadow-2xl drop-shadow-[#0D0A2C14] mt-5 rounded-[16px] bg-white w-full">
          <AdminDasboardTable users={LatestUsers} />
        </div>

        <div className="p-[19px] drop-shadow-2xl drop-shadow-[#0D0A2C14] mt-5 rounded-[16px] bg-white w-full">
          <AdminDasboardTableSecond users={LatestUsers} />
        </div>
      </div>
    </div>
  );
};

export default page;
