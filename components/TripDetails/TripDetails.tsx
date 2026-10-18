"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { DemoStars } from "@/constants";
import PopularTrips from "./PopularTrips";

import RatingForm from "@/components/RatingForm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createCheckoutSession } from "@/actions/create-checkout-session";
import dynamic from "next/dynamic";
import {
  FALLBACK_TRIP_IMAGE,
  type TripCardView,
  type TripDetailsView,
} from "@/lib/trip-view";
import { TagPill } from "@/components/TagPill";

// Leaflet touches window/document at import time, so it must never be SSR'd
const TripMap = dynamic(
  () => import("./TripMap").then((mod) => mod.TripMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full rounded-[10px] bg-[#ECF2EF]" />
    ),
  }
);

const TheTripDetails = ({
  individualTrip,
  userId,
  TheRating,
  AverageRatingForTrip,
  ThePopularTripsData,
}: {
  individualTrip: TripDetailsView;
  userId?: string;
  TheRating: { UserRatingOfATrip: { rating: number } | null } | null | undefined;
  ThePopularTripsData: TripCardView[];
  AverageRatingForTrip: number | null | undefined;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const aiResponse = individualTrip.aiResponse;

  const onSubmit = async () => {
    try {
      setIsLoading(true);

      if (!userId) {
        toast.error("Make sure you are logged in to make a payment.");
        setIsLoading(false);
        router.push("/auth/login");
        return;
      }

      if (!aiResponse) {
        toast.error("This trip is missing its details.");
        setIsLoading(false);
        return;
      }

      const url = await createCheckoutSession(individualTrip.id);

      if (url) {
        router.push(url);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Payment Request Failed: ${message}`, {
        style: {
          backgroundColor: "red",
          color: "black",
        },
      });

      setIsLoading(false);
      console.log(error);
    }
  };

  if (!aiResponse) {
    return (
      <section className="bg-[#F9FBFC] p-[50px] h-full">
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
        <h1 className="text-[28px] font-[600] text-[#1F1F36] mt-8">
          This trip hasn&apos;t finished generating its details. Please try
          again later.
        </h1>
      </section>
    );
  }

  const location = aiResponse.location;

  const TheCoordinates =
    location && location.coordinates.length === 2
      ? (location.coordinates as [number, number])
      : null;

  const images = aiResponse.images ?? [];
  const itineraryDays = aiResponse.itineraryDays;

  const userHasRated = TheRating?.UserRatingOfATrip != null;

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
              {aiResponse.title}
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

              {userHasRated ? (
                <p className="text-[14px] text-[#7F7E83] font-[400]">
                  You rated this trip {TheRating?.UserRatingOfATrip?.rating}/5
                </p>
              ) : userId ? (
                <RatingForm tripId={individualTrip.id} userId={userId} />
              ) : (
                <Link
                  href="/auth/login"
                  className="text-[14px] text-[#256FF1] font-[500]"
                >
                  Log in to rate this trip
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(200px,auto)]">
              <div className="col-span-1 md:col-span-2 row-span-1">
                <Image
                  src={images[0] ?? FALLBACK_TRIP_IMAGE}
                  width={500}
                  height={500}
                  alt="trip-details"
                  className="w-full h-full object-cover rounded-[16px]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="col-span-1 row-span-1">
                  <Image
                    src={images[1] ?? FALLBACK_TRIP_IMAGE}
                    width={500}
                    height={500}
                    alt="trip-details"
                    className="w-full h-full object-cover rounded-[16px]"
                  />
                </div>

                <div className="col-span-1 row-span-1">
                  <Image
                    src={images[2] ?? FALLBACK_TRIP_IMAGE}
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
                {aiResponse.tags.map((tag, index) => (
                  <TagPill
                    key={tag}
                    tag={tag}
                    paletteIndex={index}
                    className="h-fit max-[450px]:col-span-2 max-[450px]:w-full"
                    textClassName="text-[12px] max-[440px]:text-[10px]"
                  />
                ))}
              </div>

              <div className="flex items-center max-[1025px]:justify-between gap-4 m-2">
                <div className="flex items-center gap-4 mb-1">
                  {AverageRatingForTrip
                    ? DemoStars.slice(
                        0,
                        Math.round(AverageRatingForTrip)
                      ).map((star) => {
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
                      })
                    : null}
                </div>

                <div
                  className={cn(
                    "pb-[8px] pr-[20px] pl-[20px] w-fit pt-[8px] rounded-[40px]",
                    `bg-[#FFF4ED]`
                  )}
                >
                  <p className="text-[12px] font-[500] text-[#B93815]">
                    {AverageRatingForTrip
                      ? `${AverageRatingForTrip}/5.0`
                      : "No ratings yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-row justify-between items-center">
                <h1 className="text-[30px] font-semibold">
                  {aiResponse.title}
                </h1>

                <span className="pb-[4px] pl-[10px] pr-[10px] pt-[4px] text-black bg-[#FFFFFF] rounded-[20px] text-[14px] font-[600]">
                  ${aiResponse.estimatedPrice}
                </span>
              </div>

              <p className="text-[18px] text-[#2E2C48] leading-[30px]">
                {aiResponse.description}
              </p>

              {itineraryDays.map((item, index) => {
                const hasTransit = item.gettingThere !== "";

                return (
                  <div key={index}>
                    {hasTransit ? (
                      <div className="flex items-center gap-2 max-[770px]:flex-col max-[770px]:items-start">
                        <h1 className="text-[20px] font-semibold text-[#2E2C48]">
                          Day {item.day}: {item.location}
                        </h1>

                        <div className="pb-[8px] pr-[20px] pl-[20px] bg-[#F7EDF6] pt-[8px] rounded-[40px]">
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

                    {hasTransit && (
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
                );
              })}

              <div>
                <h1 className="text-[20px] font-semibold text-[#2E2C48]">
                  Best Time To Visit:
                </h1>

                {aiResponse.bestTimeToVisit.map((theBestTime, index) => (
                  <p
                    key={index}
                    className="text-[18px] text-[#2E2C48] leading-[30px] font-[400] m-[10px]"
                  >
                    {theBestTime}
                  </p>
                ))}
              </div>

              <div className="border border-[#E3F1FF]" />

              <div>
                <h1 className="text-[20px] font-semibold text-[#2E2C48]">
                  Weather Info:
                </h1>

                {aiResponse.weatherInfo.map((weatherInfo, index) => (
                  <p
                    key={index}
                    className="text-[18px] text-[#2E2C48] leading-[30px] font-[400] m-[10px]"
                  >
                    {weatherInfo}
                  </p>
                ))}
              </div>

              {TheCoordinates && location ? (
                <TripMap coordinates={TheCoordinates} city={location.city} />
              ) : null}

              <Button
                onClick={onSubmit}
                disabled={isLoading}
                className="bg-[#256FF1] pt-[14px] h-[50px] w-full pr-[16px] pb-[14px] pl-[16px] rounded-[8px]
             border-2 border-[#ECF2EF] cursor-pointer mt-[16px]"
              >
                Pay and Join Trip{" "}
                <span className="pb-[3px] pl-[10px] pr-[10px] pt-[3px] text-black bg-[#FFFFFF] rounded-[20px] text-[14px] font-[600]">
                  ${aiResponse.estimatedPrice}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <PopularTrips theTrip={ThePopularTripsData} />
    </>
  );
};

export default TheTripDetails;
