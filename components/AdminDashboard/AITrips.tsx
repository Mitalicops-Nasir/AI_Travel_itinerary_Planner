"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import TripCard from "@/components/TripCard";
import Pagination from "@/components/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { type TripCardView } from "@/lib/trip-view";

const AITrips = ({ theTrip }: { theTrip: TripCardView[] }) => {
  const { page, totalPages, pageItems, goToPage } = usePagination(theTrip, 6);

  return (
    <section className="bg-[#F9FBFC] w-full h-full p-[4%]">
      <div className="flex flex-col gap-[10px] mb-[35px]">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[36px] font-[700] leading-[44px]">Trips</h1>

          <Button
            className="pt-[12px] pr-[16px] pb-[12px] pl-[16px] w-[233px] h-[44px] max-[500px]:w-fit cursor-pointer bg-[#256FF1]"
            asChild
          >
            <Link href="/Create-Trips" className="flex items-center gap-2">
              <Image
                src="/assets/icons/plus.svg"
                width={20}
                height={20}
                alt=""
              />
              <p>Create a Trip</p>
            </Link>
          </Button>
        </div>

        <p className="text-[18px] text-[#7F7E83] font-[400]">
          View and Generate AI Travel Plans
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-[10px] max-[321px]:grid-cols-1">
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

export default AITrips;
