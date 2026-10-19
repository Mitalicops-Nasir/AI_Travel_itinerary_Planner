"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { MdCancel, MdMenu } from "react-icons/md";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ExtendedUser } from "@/next-auth";

type NavLink = { label: string; href: string };

const guestLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Destinations", href: "/#destinations" },
  { label: "Handpicked Trips", href: "/#trips" },
];

const memberLinks: NavLink[] = [
  { label: "My Trips", href: "/AI-Trips" },
  { label: "Create Trip", href: "/Create-Trips" },
  { label: "Profile", href: "/profile" },
  { label: "Dashboard", href: "/dashboard" },
];

export const Navbar = ({ user }: { user?: ExtendedUser | null }) => {
  const [clicked, setClicked] = useState(false);
  const pathname = usePathname();

  const links = !user
    ? guestLinks
    : user.role === "ADMIN"
      ? [...memberLinks, { label: "All Users", href: "/all-users" }]
      : memberLinks;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "T";

  return (
    <div className="fixed inset-x-0 top-3 z-50 px-4 pointer-events-none">
      <nav className="pointer-events-auto mx-auto flex h-[64px] w-full max-w-7xl items-center justify-between gap-4 rounded-full border border-[#ECF2EF] bg-white pl-5 pr-3 shadow-[0_10px_30px_rgba(13,10,44,0.10)] sm:pl-6 max-[480px]:h-[58px] max-[480px]:px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/assets/icons/logo.svg"
            alt="logo"
            width={30}
            height={30}
          />
          <h1 className="text-[22px] font-[700] max-[480px]:text-[20px]">
            Tourvisto
          </h1>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-full px-4 py-2 text-[15px] font-[400] transition-colors hover:text-[#256FF1] ${
                  isActive ? "text-[#256FF1]" : "text-[#141627]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-[#F3F6F8]"
              >
                <Avatar className="h-[38px] w-[38px]">
                  <AvatarImage
                    height={38}
                    width={38}
                    src={user.image || "/assets/images/default-pic.jpg"}
                  />
                  <AvatarFallback className="bg-[#E8F1FE] text-[13px] font-[600] text-[#256FF1]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="pl-0.5 pr-2 text-[15px] font-[400] text-[#141627] max-[1024px]:hidden">
                  {user.name?.split(" ")[0] || "Profile"}
                </span>
              </Link>

              <button
                type="button"
                onClick={() => signOut()}
                aria-label="Log out"
                className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-[#F9FBFC] transition-colors hover:bg-[#E8F1FE]"
              >
                <Image
                  src="/assets/icons/logout.svg"
                  alt="logout"
                  width={20}
                  height={20}
                />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-full px-4 py-2 text-[15px] font-[400] text-[#141627] transition-colors hover:bg-[#F3F6F8]"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-[#256FF1] px-5 py-[10px] text-[15px] font-[500] text-white transition-colors hover:bg-[#1D5AD9]"
              >
                Plan a trip free
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setClicked(!clicked)}
          aria-label="Toggle menu"
          className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-[#F9FBFC] md:hidden"
        >
          {clicked ? (
            <MdCancel size={22} color="#141627" />
          ) : (
            <MdMenu size={22} color="#141627" />
          )}
        </button>
      </nav>

      {clicked && (
        <div className="pointer-events-auto mx-auto mt-2 w-full max-w-7xl rounded-[24px] border border-[#ECF2EF] bg-white p-4 shadow-[0_18px_40px_rgba(13,10,44,0.14)] md:hidden">
          <div className="flex flex-col">
            {links.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setClicked(false)}
                className="rounded-[14px] px-3 py-3 text-[16px] font-[400] text-[#141627] hover:bg-[#F3F6F8]"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="my-3 h-px w-full bg-[#ECF2EF]" />

          {user ? (
            <div className="flex items-center justify-between gap-3 px-1">
              <div className="flex items-center gap-3">
                <Avatar className="h-[40px] w-[40px]">
                  <AvatarImage
                    height={40}
                    width={40}
                    src={user.image || "/assets/images/default-pic.jpg"}
                  />
                  <AvatarFallback className="bg-[#E8F1FE] text-[13px] font-[600] text-[#256FF1]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[15px] font-[600] text-[#141627]">
                    {user.name}
                  </p>
                  <p className="text-[13px] text-[#7F7E83]">{user.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => signOut()}
                className="flex h-[42px] cursor-pointer items-center gap-2 rounded-full bg-[#F9FBFC] px-4 transition-colors hover:bg-[#E8F1FE]"
              >
                <Image
                  src="/assets/icons/logout.svg"
                  alt="logout"
                  width={18}
                  height={18}
                />
                <span className="text-[14px] text-[#141627]">Log out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={() => setClicked(false)}
                className="flex h-[48px] items-center justify-center rounded-full border border-[#ECF2EF] text-[16px] font-[500] text-[#141627]"
              >
                Log in
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setClicked(false)}
                className="flex h-[48px] items-center justify-center rounded-full bg-[#256FF1] text-[16px] font-[500] text-white"
              >
                Plan a trip free
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
