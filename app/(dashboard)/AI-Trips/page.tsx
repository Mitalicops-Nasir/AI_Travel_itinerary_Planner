import { GetAllTrips } from "@/actions/Trip";
import AITrips from "@/components/AdminDashboard/AITrips";
import React from "react";

const page = async () => {
  const TripRaw = await GetAllTrips();

  if (!TripRaw) {
    return <div>No trips found.</div>;
  }

  // Ensure aiResponse.location is always the expected object or null
  const Trip = TripRaw.map((trip) => ({
    ...trip,
    aiResponse: trip.aiResponse
      ? {
          ...trip.aiResponse,
          location:
            typeof trip.aiResponse.location === "string"
              ? JSON.parse(trip.aiResponse.location)
              : trip.aiResponse.location,
        }
      : null,
  }));

  return (
    <div className="w-full h-full">
      <AITrips theTrip={Trip} />
    </div>
  );
};

export default page;
