"use client";

import { sidebarItems } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { ExtendedUser } from "@/next-auth";
import { signOut } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { ProBadge } from "@/features/membership/components/ProBadge";

const SideNavbar = ({
  user,
  isPro = false,
}: {
  user?: ExtendedUser;
  isPro?: boolean;
}) => {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  const visibleItems = sidebarItems.filter(
    (item) => !("adminOnly" in item) || item.adminOnly !== true || user?.role === "ADMIN"
  );

  return (
    <>
      {/* Mobile / tablet top bar */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-[56px] items-center gap-3 border-b border-[#ECF2EF] bg-white px-4 lg:hidden">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[#F3F6F8]"
        >
          <Menu className="size-5 text-[#141627]" />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/icons/logo.svg"
            alt="logo"
            width={24}
            height={24}
          />
          <span className="text-[18px] font-[700] text-[#141627]">
            Tourvisto
          </span>
        </Link>
      </header>

      {/* Drawer overlay (mobile / tablet only) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[#0D0A2C]/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — static on desktop, slides in from the side below lg */}
      <aside
        className={`z-50 flex w-[264px] flex-col justify-between border-r border-[#ECF2EF] bg-white transition-transform duration-300 ease-out max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:shadow-[0_0_40px_rgba(13,10,44,0.18)] lg:sticky lg:top-0 lg:h-dvh lg:w-[240px] lg:shrink-0 lg:translate-x-0 lg:transition-none ${
          open ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-center justify-between px-5 pb-5 pt-6">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/assets/icons/logo.svg"
                alt="logo"
                width={28}
                height={28}
              />
              <span className="text-[20px] font-[700] text-[#141627]">
                Tourvisto
              </span>
            </Link>

            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full text-[#7F7E83] transition-colors hover:bg-[#F3F6F8] lg:hidden"
            >
              <X className="size-4.5" />
            </button>
          </div>

          <div className="mx-4 h-px bg-[#ECF2EF]" />

          <nav className="flex flex-col gap-1.5 px-3 pt-5">
            {visibleItems.map((item) => {
              const active = pathname === item.href;

              return (
                <Button
                  key={item.id}
                  asChild
                  variant="ghost"
                  className={`h-[44px] w-full cursor-pointer justify-start gap-3 rounded-[10px] px-3.5 text-[15px] font-[400] ${
                    active
                      ? "bg-[#256FF1] text-white hover:bg-[#1D5AD9] hover:text-white"
                      : "bg-transparent text-[#5C5A70] hover:bg-[#F3F6F8] hover:text-[#141627]"
                  }`}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3"
                  >
                    <Image
                      src={item.icon}
                      alt=""
                      width={18}
                      height={18}
                      className={
                        active
                          ? "filter-[brightness(0)_invert(1)]"
                          : "opacity-55 filter-[brightness(0)]"
                      }
                    />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#ECF2EF] px-4 py-4">
          <div className="flex items-center gap-2.5">
            <Image
              src={user?.image ? user.image : `/assets/images/default-pic.jpg`}
              alt="user"
              width={36}
              height={36}
              className="shrink-0 rounded-full object-cover"
            />

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate text-[14px] font-semibold text-[#141627]">
                {user?.name ?? "Guest"}
                {isPro && <ProBadge />}
              </p>
              <p className="truncate text-[12px] text-[#7F7E83]">
                {user?.email ?? "Not signed in"}
              </p>
            </div>

            {user && (
              <button
                type="button"
                aria-label="Log out"
                onClick={() => signOut()}
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[#FDECEC]"
              >
                <Image
                  src="/assets/icons/logout.svg"
                  alt=""
                  width={18}
                  height={18}
                />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideNavbar;
