import {
  GetAllPopularTrips,
  getAverageRatingForTrip,
  getIndividualTrip,
  getTripRatingForAUser,
} from "@/actions/Trip";
import TheTripDetails from "@/components/TripDetails/TripDetails";
import { currentUser } from "@/lib/auth";
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

  return (
    <>
      <TheTripDetails
        individualTrip={individualTrip}
        userId={user?.id}
        TheRating={getTheUserRatingOfTrip}
        AverageRatingForTrip={AverageRating}
        ThePopularTripsData={PopularTrips}
      />
    </>
  );
};

export default TripDetails;
