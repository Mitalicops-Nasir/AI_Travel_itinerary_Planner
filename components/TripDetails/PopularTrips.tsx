import { HandPickedTrips } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const PopularTrips = ({ theTrip }: { theTrip: TheTripInDB[] }) => {
  const router = useRouter();

  const handleClick = (id: string) => {
    router.push(`/Trip/${id}/Trip-Details`);
  };

  const BackGroundColors = [
    "#ECFDF3",
    "#F3F0FB",
    "#F0F9FF",
    "#F8F9FC",
    "#F7EDF6",
    "#FFF4ED",
    "#FFF1F3",
  ];

  const textColor = [
    "#027A48",
    "#6941C6",
    "#026AA2",
    "#363F72",
    "#C11574",
    "#B93815",
    "#C01048",
  ];

  return (
    <section
      className="bg-[#F9FBFC] w-full pl-[50px] pt-[50px] pb-[50px] pr-[50px]
    max-[768px]:pl-[15px] max-[768px]:pr-[15px]"
    >
      <div className="flex flex-col gap-[8px] mb-[35px]">
        <h1 className="text-[36px] font-[700] leading-[44px]">Popular Trips</h1>
      </div>
      <div className="grid grid-cols-4 max-[1025px]:grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-[20px] max-[321px]:grid-cols-1">
        {theTrip.slice(0, 4).map((trip) => {
          let randomNum = Math.floor(Math.random() * BackGroundColors.length);
          let anotherRandomNum = Math.floor(
            Math.random() * BackGroundColors.length
          );

          if (randomNum === anotherRandomNum) {
            randomNum += 1;
          }

          return (
            <div
              key={trip.id}
              onClick={() => handleClick(trip.id)}
              className="bg-[#FFFFFF] cursor-pointer relative drop-shadow-xl rounded-[20px]"
            >
              <Image
                src={
                  trip.aiResponse?.images[2]! ||
                  "/assets/images/sample-trip.jpg"
                }
                width={300}
                height={300}
                alt="sample"
                className="rounded-tl-[20px] rounded-tr-[20px] h-[180px] object-cover w-full"
              />

              <span className="absolute pb-[4px] pl-[10px] pr-[10px] pt-[4px] bg-[#FFFFFF] rounded-[20px] text-[14px] font-[600] top-[10px] right-[10px]">
                ${trip.aiResponse?.estimatedPrice || "0"}
              </span>

              <div className="p-5 flex flex-col gap-4">
                <h1 className="text-[#1F1F36 text-[18px] font-[600]">
                  {trip.aiResponse?.location?.city || "Unknown City"}
                </h1>

                <span className="flex items-center gap-1">
                  <Image
                    src="/assets/icons/location-mark.svg"
                    width={20}
                    height={20}
                    alt="location"
                  />
                  <p className="text-[#7F7E83] text-[14px] font-[400]">
                    {trip.aiResponse?.location?.city || "Unknown City"}{" "}
                    {trip.country}
                  </p>
                </span>

                <div className="flex items-center gap-2 w-full">
                  <div
                    className={cn(
                      "pb-[8px] pr-[20px] pl-[20px] pt-[8px] rounded-[40px] w-fit",
                      `bg-[${BackGroundColors[randomNum]}]`
                    )}
                    style={{ backgroundColor: BackGroundColors[randomNum] }}
                  >
                    <p
                      className="text-[10px] font-[500]"
                      style={{ color: textColor[randomNum] }}
                    >
                      {trip.aiResponse?.tags[0]}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "pb-[8px] pr-[15px] pl-[15px] pt-[8px] rounded-[40px] w-fit",
                      `bg-[${BackGroundColors[anotherRandomNum]}]`
                    )}
                    style={{
                      backgroundColor: BackGroundColors[anotherRandomNum],
                    }}
                  >
                    <p
                      className="text-[10px] font-[500]"
                      style={{ color: textColor[anotherRandomNum] }}
                    >
                      {trip.aiResponse?.tags[2]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PopularTrips;
