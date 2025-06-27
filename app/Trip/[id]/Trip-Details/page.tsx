import {
  GetAllPopularTrips,
  getAverageRatingForTrip,
  getIndividualTrip,
  getTripRatingForAUser,
} from "@/actions/Trip";
import TheTripDetails from "@/components/TripDetails/TripDetails";
import { currentUser } from "@/lib/auth";
import React from "react";

const TripDetails = async ({ params }: any) => {
  const { id } = await params;
  const user = await currentUser();
  const IndividualTrip = await getIndividualTrip(id);
  const getTheUserRatingOfTrip = await getTripRatingForAUser(id, user?.id!);
  const AverageRating = await getAverageRatingForTrip(id);
  const PopularTrips = await GetAllPopularTrips();

  if (!IndividualTrip) {
    return <div>No trip found.</div>;
  }

  const PopularTripParsed = PopularTrips?.map((trip) => ({
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

  // Fix aiResponse.location type
  return (
    <>
      <TheTripDetails
        //@ts-expect-error Type  Fix aiResponse.location type
        individualTrip={IndividualTrip}
        userId={user?.id!}
        TheRating={getTheUserRatingOfTrip}
        AverageRatingForTrip={AverageRating}
        ThePopularTripsData={PopularTripParsed!}
      />
    </>
  );
};

export default TripDetails;
