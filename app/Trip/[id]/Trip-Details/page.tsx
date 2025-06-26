import {
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

  console.log(IndividualTrip);

  if (!IndividualTrip) {
    return <div>No trip found.</div>;
  }

  // Fix aiResponse.location type
  return (
    <>
      <TheTripDetails
        //@ts-expect-error Type  Fix aiResponse.location type
        individualTrip={IndividualTrip}
        userId={user?.id!}
        TheRating={getTheUserRatingOfTrip}
        AverageRatingForTrip={AverageRating}
      />
    </>
  );
};

export default TripDetails;
