import Link from "next/link";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { sidebarItems } from "@/constants";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { ExtendedUser } from "@/next-auth";

const MobileNav = ({ user }: { user?: ExtendedUser }) => {
  const pathname = usePathname();
  return (
    <div className="hidden max-[768px]:block absolute z-[20] right-[10px] top-[110px]">
      <div className="flex items-center gap-6 flex-col bg-[#256FF1] p-3 rounded-[10px]">
        {sidebarItems.map((item) => (
          <div className="p-2 bg-white rounded-[13px]" key={item.id}>
            <Button
              asChild
              className={`flex items-center justify-start gap-3 pt-[18px] w-[220px] cursor-pointer
             h-[60px] pr-[14px] pl-[14px] pb-[18px] bg-transparent rounded-[10px]
              text-[#7F7E83] hover:bg-[#256FF1] hover:text-white
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
          </div>
        ))}

        <div className="flex items-center gap-3 p-2 bg-white rounded-[13px]">
          <div className="pl-[10px] pr-[10px] pb-[16px] pt-[16px] flex items-center gap-3 rounded-[10px]">
            <Image
              src={
                user?.image! ? user?.image : `/assets/images/default-pic.jpg`
              }
              alt="user"
              width={40}
              height={40}
              className="rounded-[40px]"
            />
            <div>
              <h1 className="text-[16px] text-[#141627] font-semibold">
                {user?.name}
              </h1>
              <p className="text-[14px] font-normal text-[#7F7E83]">
                {user?.email}
              </p>
            </div>

            <Image
              src="/assets/icons/logout.svg"
              width={24}
              height={24}
              alt="logout"
              onClick={() => signOut()}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
