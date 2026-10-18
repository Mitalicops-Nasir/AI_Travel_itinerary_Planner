"use client";

import React from "react";
import TripCard from "@/components/TripCard";
import Pagination from "@/components/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { type TripCardView } from "@/lib/trip-view";

const HandPickedTrip = ({ theTrip }: { theTrip: TripCardView[] }) => {
  const { page, totalPages, pageItems, goToPage } = usePagination(theTrip, 3);

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
        {pageItems.map((trip, index) => (
          <TripCard key={trip.id} trip={trip} index={index} />
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={goToPage}
        className="mt-8 pt-[16px] pb-[16px] border-t-2 border-t-[#EAECF0]"
      />
    </section>
  );
};

export default HandPickedTrip;
