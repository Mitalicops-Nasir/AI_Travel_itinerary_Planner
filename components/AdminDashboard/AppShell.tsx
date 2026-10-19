"use client";

import { usePathname } from "next/navigation";
import React from "react";
import { Toaster } from "sonner";
import { ExtendedUser } from "@/next-auth";
import SideNavbar from "./SideNavbar";

// Public follow-along pages are for family and friends — they get their own
// clean layout instead of the app sidebar.
const STANDALONE_PREFIXES = ["/Trip/share", "/api/"];

export function AppShell({
  user,
  isPro = false,
  children,
}: {
  user?: ExtendedUser;
  isPro?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const standalone = STANDALONE_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (standalone) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  return (
    <div className="flex min-h-dvh w-full">
      <SideNavbar user={user} isPro={isPro} />
      <main className="min-w-0 flex-1 max-lg:pt-[56px]">{children}</main>
      <Toaster />
    </div>
  );
}