import { GetAllTrips } from "@/actions/Trip";
import AITrips from "@/components/AdminDashboard/AITrips";
import React from "react";

export const dynamic = "force-dynamic";

const page = async () => {
  const trips = await GetAllTrips();

  return (
    <div className="w-full h-full">
      <AITrips theTrip={trips} />
    </div>
  );
};

export default page;
