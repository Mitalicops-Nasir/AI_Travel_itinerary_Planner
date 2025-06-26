"use client";

import { sidebarItems } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { ExtendedUser } from "@/next-auth";
import { signOut } from "next-auth/react";
import { UserButton } from "../user-button";
import { MdCancel, MdMenu } from "react-icons/md";
import MobileNav from "./MobileNav";

const SideNavbar = ({ user }: { user?: ExtendedUser }) => {
  const pathname = usePathname();

  const [clicked, setClicked] = useState(false);

  return (
    <nav
      className="w-[270px] h-[1024px] bg-[#FFFFFF] border-r
     border-[#ECF2EF] flex flex-col justify-between max-[768px]:w-full max-[768px]:h-full max-[1025px]:w-[210px]"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mt-[36px] ml-[29px] mr-[29px]">
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
                className="max-[768px]:block hidden cursor-pointer"
                color="black"
              />
              <MobileNav user={user} />
            </>
          ) : (
            <MdMenu
              size={25}
              onClick={() => setClicked(!clicked)}
              color="black"
              className="hidden max-[768px]:block cursor-pointer"
            />
          )}
        </div>

        <div className="border border-[#ECF2EF] mt-[30px] mr-[20px] ml-[20px]" />

        <div className="pt-[50px] pl-[25px] pr-[25px] flex flex-col gap-[14px] max-[768px]:hidden">
          {sidebarItems.map((item) => (
            <Button
              key={item.id}
              asChild
              className={`flex items-center justify-start gap-3 pt-[18px] w-[220px] cursor-pointer
             h-[60px] pr-[14px] pl-[14px] pb-[18px] bg-transparent rounded-[10px]
              text-[#7F7E83] hover:bg-[#256FF1] hover:text-white max-[1025px]:w-[170px]
              ${pathname === item.href ? "bg-[#256FF1] text-white" : "bg-transparent"}`}
            >
              <Link href={item.href} className="">
                <Image
                  src={item.icon}
                  alt={item.label}
                  width={20}
                  height={20}
                  className={`${pathname === item.href ? "p-[2px] bg-white rounded-[10px] w-[22px] h-[22px]" : "bg-transparent"}`}
                />

                <p className="font-[400] text-[18px] leading-[24px]">
                  {item.label}
                </p>
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="pl-[26px] pr-[26px] pb-[16px] pt-[16px] flex items-center gap-3 rounded-[10px] max-[768px]:hidden max-[1025px]:pl-[8px]">
        <Image
          src={user?.image! ? user?.image : `/assets/images/default-pic.jpg`}
          alt="user"
          width={40}
          height={40}
          className="rounded-[40px] max-[768px]:hidden"
        />
        <div>
          <h1 className="text-[16px] text-[#141627] font-semibold max-[756px]:hidden">
            {user?.name}
          </h1>
          <p className="text-[14px] font-normal text-[#7F7E83] max-[756px]:hidden">
            {user?.email}
          </p>
        </div>

        <Image
          src="/assets/icons/logout.svg"
          width={24}
          height={24}
          alt="logout"
          onClick={() => signOut()}
          className="cursor-pointer max-[768px]:hidden"
        />
      </div>
    </nav>
  );
};

export default SideNavbar;
