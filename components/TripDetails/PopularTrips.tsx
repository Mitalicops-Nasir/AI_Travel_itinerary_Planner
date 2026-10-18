import TripCard from "@/components/TripCard";
import { type TripCardView } from "@/lib/trip-view";

const PopularTrips = ({ theTrip }: { theTrip: TripCardView[] }) => {
  return (
    <section
      className="bg-[#F9FBFC] w-full pl-[50px] pt-[50px] pb-[50px] pr-[50px]
    max-[768px]:pl-[15px] max-[768px]:pr-[15px]"
    >
      <div className="flex flex-col gap-[8px] mb-[35px]">
        <h1 className="text-[36px] font-[700] leading-[44px]">Popular Trips</h1>
      </div>

      <div className="grid grid-cols-4 max-[1025px]:grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-[20px] max-[321px]:grid-cols-1">
        {theTrip.slice(0, 4).map((trip, index) => (
          <TripCard key={trip.id} trip={trip} index={index} />
        ))}
      </div>
    </section>
  );
};

export default PopularTrips;
