"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MdCancel, MdMenu } from "react-icons/md";
import { signOut } from "next-auth/react";

export const Navbar = ({className, color}: {className?: string, color?: string }) => {
  const [clicked, setClicked] = useState(false);
  return (
    <nav className={`flex items-center gap-6 justify-between w-full pl-[140px] pt-[50px] max-[768px]:pr-[40px] max-[768px]:pl-[40px] pr-[140px] relative ${className}`}>
      <div className="flex items-center gap-2">
        <Image
          src="/assets/icons/logo.svg"
          alt="logo"
          width={30}
          height={30}
          className=""
        />
        <h1 className="font-[700] text-[24px] line-clamp-4">Tourvisto</h1>
      </div>

      {clicked ? (
        <>
          <MdCancel
            size={25}
            onClick={() => setClicked(!clicked)}
            className="max-[700px]:block hidden cursor-pointer"
            color={color || "white"}
          />
          <MobileNav />
        </>
      ) : (
        <MdMenu
          size={25}
          onClick={() => setClicked(!clicked)}
          color={color || "white"}
          className="max-[700px]:block hidden cursor-pointer"
        />
      )}

      <div className="flex items-center gap-6 max-[700px]:hidden">
        <Link href="/dashboard" className="font-[400] text-white text-[16px]">
          Admin Panel
        </Link>

        <Avatar>
          <AvatarImage
            height={40}
            width={40}
            src="https://github.com/shadcn.png"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div
          className="bg-[#FFFFFF4D] p-[8px] rounded-[26px] cursor-pointer"
          onClick={() => signOut()}
        >
          <Image
            src="/assets/icons/logout.svg"
            alt="logout"
            width={24}
            height={24}
          />
        </div>
      </div>
    </nav>
  );
};

export const MobileNav = () => {
  return (
    <div className="hidden max-[700px]:block absolute z-[20] right-[95px] top-[90px]">
      <div className="flex items-center gap-6 flex-col bg-[#256FF1] p-3 rounded-[10px]">
        <div className="p-3 bg-white rounded-[13px]">
          <Link href="/dashboard" className="font-[400] text-[16px]">
            Dashboard Panel
          </Link>
        </div>

        <div className="flex items-center gap-3 p-4 justify-between bg-white rounded-[13px] w-full">
          <Avatar>
            <AvatarImage
              height={40}
              width={40}
              src="https://github.com/shadcn.png"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div
            className="bg-blue-300 p-[8px] rounded-[26px] cursor-pointer"
            onClick={() => signOut()}
          >
            <Image
              src="/assets/icons/logout.svg"
              alt="logout"
              width={22}
              height={22}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
