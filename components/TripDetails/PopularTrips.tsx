import { HandPickedTrips } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

const PopularTrips = () => {
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
    <section className="bg-[#F9FBFC] w-full pl-[50px] pt-[50px] pr-[50px]">
      <div className="flex flex-col gap-[8px] mb-[35px]">
        <h1 className="text-[36px] font-[700] leading-[44px]">Popular Trips</h1>
      </div>
      <div className="grid md:grid-cols-3 xl:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-[25px] max-[321px]:grid-cols-1">
        {HandPickedTrips.slice(0, 4).map((trip) => {
          let randomNum = Math.floor(Math.random() * BackGroundColors.length);
          const anotherRandomNum = Math.floor(
            Math.random() * BackGroundColors.length
          );

          if (randomNum === anotherRandomNum) {
            randomNum += 1;
          }

          return (
            <div
              key={trip.id}
              className="bg-[#FFFFFF] drop-shadow-xl rounded-[20px]"
            >
              <Image
                src={trip.imageDescription}
                width={300}
                height={300}
                alt="sample"
                className="rounded-tl-[20px] rounded-tr-[20px] h-[180px] object-cover w-full relative"
              />

              <span className="absolute pb-[4px] pl-[10px] pr-[10px] pt-[4px] bg-[#FFFFFF] rounded-[20px] text-[14px] font-[600] top-[10px] right-[10px]">
                {trip.price}
              </span>

              <div className="p-5 flex flex-col gap-4">
                <h1 className="text-[#1F1F36 text-[18px] font-[600]">
                  {trip.name}
                </h1>

                <span className="flex items-center gap-1">
                  <Image
                    src="/assets/icons/location-mark.svg"
                    width={20}
                    height={20}
                    alt="location"
                  />
                  <p className="text-[#7F7E83] text-[14px] font-[400]">
                    {trip.location}
                  </p>
                </span>

                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "pb-[8px] pr-[20px] pl-[20px] pt-[8px] rounded-[40px]",
                      `bg-[${BackGroundColors[randomNum]}]`
                    )}
                    style={{ backgroundColor: BackGroundColors[randomNum] }}
                  >
                    <p
                      className="text-[12px] font-[500]"
                      style={{ color: textColor[randomNum] }}
                    >
                      {trip.tags[0]}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "pb-[8px] pr-[20px] pl-[20px] pt-[8px] rounded-[40px]",
                      `bg-[${BackGroundColors[anotherRandomNum]}]`
                    )}
                    style={{
                      backgroundColor: BackGroundColors[anotherRandomNum],
                    }}
                  >
                    <p
                      className="text-[12px] font-[500]"
                      style={{ color: textColor[anotherRandomNum] }}
                    >
                      {trip.tags[1]}
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
