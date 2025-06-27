"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { DemoStars } from "@/constants";
import PopularTrips from "./PopularTrips";

import RatingForm from "../RatingForm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createCheckoutSession } from "@/actions/create-checkout-session";
import { TripMap } from "./TripMap";

//const md = markdownit();

const TheTripDetails = ({
  individualTrip,
  userId,
  TheRating,
  AverageRatingForTrip,
  ThePopularTripsData,
}: {
  individualTrip: TheSingleTrip;
  userId: string;
  TheRating: any;
  ThePopularTripsData: TheTripInDB[];
  AverageRatingForTrip: number | null | undefined;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  //const tripDetails = parseMarkdownToJson(markdownText);

  //const tripDetails = MoreMarkdown;

  // const parsedContent = md.render(tripDetails || "");
  //console.log(parsedContent);

  let BackGroundColors = [
    "#ECFDF3",
    "#F3F0FB",
    "#F0F9FF",
    "#F8F9FC",
    "#F7EDF6",
    "#FFF4ED",
    "#FFF1F3",
  ];

  let textColor = [
    "#027A48",
    "#6941C6",
    "#026AA2",
    "#363F72",
    "#C11574",
    "#B93815",
    "#C01048",
  ];

  const TheCoordinates = individualTrip.aiResponse.location.coordinates as [
    number,
    number,
  ];

  const onSubmit = async () => {
    try {
      setIsLoading(true);

      if (!userId) {
        toast.error("Make sure you are logged in to make a payment.");

        setIsLoading(false);

        router.push("/auth/login");
      }

      const url = await createCheckoutSession(
        individualTrip.id,
        individualTrip.aiResponse.title,
        individualTrip.aiResponse.images,
        individualTrip.aiResponse.estimatedPrice
      );

      if (url) {
        setIsLoading(false);

        router.push(url);
      }
    } catch (error) {
      toast(`Payment Request Failed:${error}`, {
        style: {
          backgroundColor: "red",
          color: "black",
        },
      });

      setIsLoading(false);

      console.log(error);
    }
  };

  return (
    <>
      <section className="bg-[#F9FBFC] pl-[50px] pr-[50px] pt-[30px] max-[768px]:pl-[15px] max-[768px]:pr-[15px] h-full">
        <div className="flex gap-[10px] max-[770px]:flex-col">
          <Button
            className="bg-[#FFFFFF] pt-[12px] h-[56px] w-[147px] pr-[30px] pb-[12px] pl-[30px] rounded-[1px]"
            asChild
          >
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/assets/icons/arrow-left.svg"
                alt="back"
                width={17}
                height={17}
              />

              <p className="text-[16px] text-black font-semibold">Go Back</p>
            </Link>
          </Button>
          <div>
            <h1 className="text-[40px] font-[600] text-[#1F1F36]">
              {individualTrip.aiResponse.title}
            </h1>

            <div className="flex items-center justify-between gap-6 mt-4 mb-4">
              <span className="flex items-center gap-2 max-[770px]:hidden">
                <Image
                  src="/assets/icons/calendar.svg"
                  width={20}
                  height={20}
                  alt="calendar"
                />

                <p className="text-[18px] text-[#7F7E83] font-[400]">
                  {individualTrip.duration} day plan
                </p>
              </span>

              {TheRating.UserRatingOfATrip !== null ? (
                <></>
              ) : (
                <RatingForm tripId={individualTrip.id!} userId={userId} />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(200px,auto)]">
              <div className="col-span-1 md:col-span-2 row-span-1">
                <Image
                  src={individualTrip.aiResponse?.images[0]}
                  width={500}
                  height={500}
                  alt="trip-details"
                  className="w-full h-full object-cover rounded-[16px]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="col-span-1 row-span-1">
                  <Image
                    src={individualTrip.aiResponse?.images[1]}
                    width={500}
                    height={500}
                    alt="trip-details"
                    className="w-full h-full object-cover rounded-[16px]"
                  />
                </div>

                <div className="col-span-1 row-span-1">
                  <Image
                    src={individualTrip.aiResponse?.images[2]}
                    width={500}
                    height={500}
                    alt="trip-details"
                    className="w-full h-full object-cover rounded-[16px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-[9px] max-[1025px]:flex-col mt-6 mb-4 justify-between">
              <div className="flex gap-3 items-center max-[450px]:grid max-[450px]:grid-cols-4">
                {individualTrip.aiResponse.tags.map((tags, index) => {
                  let randomNum = Math.floor(
                    Math.random() * BackGroundColors.length
                  );
                  let anotherRandomNum = Math.floor(
                    Math.random() * BackGroundColors.length
                  );

                  if (randomNum === anotherRandomNum) {
                    randomNum += 1;
                  }

                  if (randomNum > BackGroundColors.length) {
                    randomNum -= 1;
                  }
                  if (anotherRandomNum > BackGroundColors.length) {
                    anotherRandomNum -= 1;
                  }
                  return (
                    <div
                      key={index}
                      className={cn(
                        "pb-[8px] pr-[20px] pl-[20px] pt-[8px] rounded-[40px] h-fit w-fit max-[450px]:col-span-2 max-[450px]:w-full",
                        `!bg-[${BackGroundColors[randomNum]}]`
                      )}
                      style={{ backgroundColor: BackGroundColors[randomNum] }}
                    >
                      <p
                        className="text-[12px] font-[500] max-[440px]:text-[10px]"
                        style={{ color: textColor[randomNum] }}
                      >
                        {tags}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center max-[1025px]:justify-between gap-4 m-2">
                <div className="flex items-center gap-4 mb-1">
                  {DemoStars.slice(0, AverageRatingForTrip!).map((star) => {
                    return (
                      <div key={star.id}>
                        <Image
                          src={star.name}
                          alt="star"
                          width={18}
                          height={18}
                          className="w-full h-full"
                        />
                      </div>
                    );
                  })}
                </div>

                <div
                  className={cn(
                    "pb-[8px] pr-[20px] pl-[20px] w-fit pt-[8px] rounded-[40px]",
                    `bg-[#FFF4ED]`
                  )}
                >
                  <p className="text-[12px] font-[500] text-[#B93815]">
                    {AverageRatingForTrip}/5.0
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-row justify-between items-center">
                <h1 className="text-[30px] font-semibold">
                  {individualTrip.aiResponse.title}
                </h1>

                <span className="pb-[4px] pl-[10px] pr-[10px] pt-[4px] text-black bg-[#FFFFFF] rounded-[20px] text-[14px] font-[600]">
                  ${individualTrip.aiResponse.estimatedPrice}
                </span>
              </div>

              <p className="text-[18px] text-[#2E2C48] leading-[30px]">
                {individualTrip.aiResponse.description}
              </p>

              {individualTrip.aiResponse.itinerary.day.map((item, index) => (
                <div key={index}>
                  {item.gettingThere !== "" ? (
                    <div className="flex items-center gap-2 max-[770px]:flex-col max-[770px]:items-start">
                      <h1 className="text-[20px] font-semibold text-[#2E2C48]">
                        Day {item.day}: {item.location}
                      </h1>

                      <div
                        key={index}
                        className={cn(
                          "pb-[8px] pr-[20px] pl-[20px] bg-[#F7EDF6] pt-[8px] rounded-[40px]"
                        )}
                      >
                        <p className="text-[11.5px] font-[500] text-[#C11574]">
                          Getting Here Could Take Time From Previous Place
                        </p>
                      </div>
                    </div>
                  ) : (
                    <h1 className="text-[20px] font-semibold text-[#2E2C48]">
                      Day {item.day}: {item.location}
                    </h1>
                  )}

                  {item.gettingThere !== "" && (
                    <h2 className="text-[20px] mb-4 mt-4 font-semibold text-[#C11574]">
                      {item.gettingThere}
                    </h2>
                  )}

                  {item.activities.map((activity, index) => (
                    <p
                      key={index}
                      className="text-[18px] text-[#2E2C48] leading-[30px] font-[400] m-[10px]"
                    >
                      • {activity.description}
                    </p>
                  ))}

                  <div className="border border-[#E3F1FF] mt-9" />
                </div>
              ))}

              <div>
                <h1 className="text-[20px] font-semibold text-[#2E2C48]">
                  Best Time To Visit:
                </h1>

                {individualTrip.aiResponse.bestTimeToVisit.map(
                  (theBestTime, index) => (
                    <p
                      key={index}
                      className="text-[18px] text-[#2E2C48] leading-[30px] font-[400] m-[10px]"
                    >
                      {theBestTime}
                    </p>
                  )
                )}
              </div>

              <div className="border border-[#E3F1FF]" />

              <div>
                <h1 className="text-[20px] font-semibold text-[#2E2C48]">
                  Weather Info:
                </h1>

                {individualTrip.aiResponse.weatherInfo.map(
                  (weatherInfo, index) => (
                    <p
                      key={index}
                      className="text-[18px] text-[#2E2C48] leading-[30px] font-[400] m-[10px]"
                    >
                      {weatherInfo}
                    </p>
                  )
                )}
              </div>

              {/*TODO: ADD MAPS HERE WITH COORDINATES */}

              <TripMap
                coordinates={TheCoordinates}
                city={individualTrip.aiResponse.location.city}
              />

              <Button
                onClick={onSubmit}
                disabled={isLoading}
                className="bg-[#256FF1] pt-[14px] h-[50px] w-full pr-[16px] pb-[14px] pl-[16x] rounded-[8px]
             border-2 border-[#ECF2EF] cursor-pointer mt-[16px]"
              >
                Pay and Join Trip{" "}
                <span className="pb-[3px] pl-[10px] pr-[10px] pt-[3px] text-black bg-[#FFFFFF] rounded-[20px] text-[14px] font-[600]">
                  ${individualTrip.aiResponse.estimatedPrice}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <PopularTrips theTrip={ThePopularTripsData}/>
    </>
  );
};

export default TheTripDetails;
