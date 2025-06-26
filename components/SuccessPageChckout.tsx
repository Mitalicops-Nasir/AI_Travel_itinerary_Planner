"use client";

import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import ReactConfetti from "react-confetti";

const SuccessPageChckout = ({ TripId }: { TripId: string }) => {
  const { width, height } = window.screen;
  return (
    <section className="bg-[#F9FBFC] h-screen p-[5%] w-full overflow-x-hidden">
      <ReactConfetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={200}
        gravity={0.95}
        run={true}
        colors={["#ff0", "#ff7f00", "#ff0044", "#4c94f4", "#f4f4f4"]}
      />
      <div className="flex flex-col items-center mx-auto w-[488px] mt-7 max-[756px]:w-full text-center">
        <Image
          src="/assets/icons/check.svg"
          width={100}
          height={100}
          alt="check"
        />
        <h1 className="text-[30px] font-semibold text-[#2E2C48] mt-4">
          Thank You & Welcome Aboard!
        </h1>

        <p className="text-[18px] font-normal text-[#2E2C48] mt-4">
          Your trip’s booked — can’t wait to have you on this adventure! 🌍️ Get
          ready to explore & make memories.✨
        </p>

        <Button
          asChild
          className="pt-[14px] pb-[14px] pr-[16px] pl-[16px] rounded-[8px] w-full mb-3 mt-5 bg-[#256FF1] text-white"
        >
          <Link href={`/Trip/${TripId}/Trip-Details`}>View Trip Details</Link>
        </Button>

        <Button
          asChild
          className="pt-[14px] pb-[14px] pr-[16px] pl-[16px] rounded-[8px] w-full drop-shadow-2xl drop-shadow-[#0D0A2C14] hover:text-white bg-[#FFFFFF] text-[#1F1F36]"
        >
          <Link href="/">
            <Image
              src="/assets/icons/arrow-left.svg"
              width={17}
              height={17}
              alt="arrow-right"
            />
            Return to homepage
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default SuccessPageChckout;
