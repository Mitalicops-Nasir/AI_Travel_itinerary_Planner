"use client";

import { HandPickedTrips, TotalPaginations } from "@/constants";
import { cn } from "@/lib/utils";
import { Trip } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import RatingForm from "../RatingForm";

const HandPickedTrip = ({ theTrip }: { theTrip: TheTripInDB[] }) => {
  const router = useRouter();

  const handleClick = (id: string) => {
    router.push(`/Trip/${id}/Trip-Details`);
  };

  const [currentPage, setPageNum] = useState(1);
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

  const itemsPerPage = 3;

  const startingIndex = (currentPage - 1) * itemsPerPage;
  let endingIndex = currentPage * itemsPerPage;

  if (endingIndex - startingIndex !== 3) {
    endingIndex = endingIndex - 1;
  }

  //const totalPaginations = Math.ceil(HandPickedTrips.length / itemsPerPage);

  return (
    <section className="bg-[#F9FBFC] w-full pl-[140px] pt-[50px] max-[768px]:pr-[40px] max-[768px]:pl-[40px] pr-[140px]">
      <div className="flex flex-col gap-[10px] mb-[35px]">
        <h1 className="text-[36px] font-[700] leading-[44px]">
          Handpicked Trips
        </h1>
        <p className="text-[18px] text-[#7F7E83] font-[400]">
          Browse well-planned trips designed for different travel styles and
          interests
        </p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-[30px] max-[321px]:grid-cols-1">
        {theTrip.slice(startingIndex, endingIndex).map((trip) => {
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
                      className="text-[10.5px] font-[500]"
                      style={{ color: textColor[randomNum] }}
                    >
                      {trip.aiResponse?.tags[0]}
                    </p>
                  </div>

                  <div
                    className={cn(
                      "pb-[8px] pr-[20px] pl-[20px] pt-[8px] rounded-[40px] w-fit",
                      `bg-[${BackGroundColors[anotherRandomNum]}]`
                    )}
                    style={{
                      backgroundColor: BackGroundColors[anotherRandomNum],
                    }}
                  >
                    <p
                      className="text-[10.5px] font-[500]"
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

      <div className="mt-8 pt-[16px] pb-[16px] border-t-2  border-t-[#EAECF0] flex items-center justify-between">
        <div
          className="pl-[14px] pr-[14px] pt-[8px] pb-[8px] cursor-pointer bg-[#FFFFFF] shadow-2xl rounded-[8px] border border-solid border-[#EAECF0]"
          onClick={() => setPageNum(currentPage - 1)}
        >
          <span className="flex gap-2 items-center">
            <FaArrowLeft size={14} />
            <p className="text-[#2E2C48] text-[14px] font-[500]">Previous</p>
          </span>
        </div>

        <div className="flex items-center gap-4 max-[580px]:hidden">
          {TotalPaginations.map((item) => (
            <div
              key={item.value}
              className={cn(
                "pl-[14px] pr-[14px] pt-[8px] pb-[8px] cursor-pointer shadow-2xl rounded-[8px] border border-solid border-[#EAECF0]",
                `${
                  currentPage === item.value
                    ? "bg-blue-500 text-[#fff]"
                    : "bg-transparent"
                }`
              )}
              onClick={() => setPageNum(item.value)}
            >
              <span>{item.valueInString}</span>
            </div>
          ))}
        </div>

        <div
          className="pl-[14px] pr-[14px] pt-[8px] pb-[8px] cursor-pointer bg-[#FFFFFF] shadow-2xl rounded-[8px] border border-solid border-[#EAECF0]"
          onClick={() => setPageNum(currentPage + 1)}
        >
          <span className="flex gap-2 items-center">
            <p className="text-[#2E2C48] text-[14px] font-[500]">Next</p>

            <FaArrowRight size={14} />
          </span>
        </div>
      </div>
    </section>
  );
};

export default HandPickedTrip;
