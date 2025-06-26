import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";

const Hero = () => {
  return (
    <>
      <section className="w-full pl-[140px] pt-[50px] max-[768px]:pr-[40px] max-[768px]:pl-[40px] pr-[140px] pb-[50px]">
        <div className="grid grid-cols-2 relative max-[768px]:grid-cols-1 z-[10]">
          <div className="flex flex-col gap-[24px]">
            <h1 className="font-[700] text-[72px] max-[1025px]:text-[55px] leading-[110.00000000000001%]">
              Plan Your Trip With Ease
            </h1>

            <p className="text-[18px] leading-[30px]">
              Customize your travel itinerary in minutes—pick your destination,
              set your preferences, and explore with confidence.
            </p>

            <Button
              asChild
              className="bg-[#256FF1] pt-[16px] h-[56px] w-[209px] pr-[56px] pb-[16px] pl-[56px] rounded-[8px] cursor-pointer"
            >
              <Link href="/Create-Trips">Get Started</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
