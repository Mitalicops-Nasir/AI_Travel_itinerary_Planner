import Image from "next/image";
import Link from "next/link";
import { type TripCardView } from "@/lib/trip-view";
import { TagPill } from "@/components/TagPill";

const TripCard = ({ trip, index }: { trip: TripCardView; index: number }) => {
  const tags = [trip.tags[0], trip.tags[2]].filter(Boolean);

  return (
    <Link
      href={`/Trip/${trip.id}/Trip-Details`}
      className="bg-[#FFFFFF] cursor-pointer relative drop-shadow-xl rounded-[20px] block"
    >
      <Image
        src={trip.imageUrl}
        width={300}
        height={300}
        alt={trip.city}
        className="rounded-tl-[20px] rounded-tr-[20px] h-[180px] object-cover w-full"
      />

      <span className="absolute pb-[4px] pl-[10px] pr-[10px] pt-[4px] bg-[#FFFFFF] rounded-[20px] text-[14px] font-[600] top-[10px] right-[10px]">
        ${trip.estimatedPrice}
      </span>

      <div className="p-5 flex flex-col gap-4">
        <h1 className="text-[#1F1F36] text-[18px] font-[600]">{trip.city}</h1>

        <span className="flex items-center gap-1">
          <Image
            src="/assets/icons/location-mark.svg"
            width={20}
            height={20}
            alt="location"
          />
          <p className="text-[#7F7E83] text-[14px] font-[400]">
            {trip.city} {trip.country}
          </p>
        </span>

        <div className="flex items-center gap-2 w-full">
          {tags.map((tag, tagIndex) => (
            <TagPill
              key={tag}
              tag={tag}
              paletteIndex={index + tagIndex * 3}
            />
          ))}
        </div>
      </div>
    </Link>
  );
};

export default TripCard;
