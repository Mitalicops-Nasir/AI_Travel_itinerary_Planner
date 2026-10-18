"use client";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Image from "next/image";
import { signOut } from "next-auth/react";

export const UserButton = ({
  image,
}: {
  image?: string | null | undefined;
}) => {
  const avatarSrc = image || "/assets/images/default-pic.jpg";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="hidden max-[756px]:block cursor-pointer">
        <Avatar>
          <AvatarImage src={avatarSrc} alt="user" />
          <AvatarFallback className="bg-sky-500">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarSrc}
              alt="user"
              className="h-[40px] w-[40px] rounded-[40px]"
            />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="!min-w-[45px] m-[30px] p-2 border-[2px] border-solid border-gray-700 hidden max-[756px]:block">
        <Image
          src="/assets/icons/logout.svg"
          width={24}
          height={24}
          alt="logout"
          onClick={() => signOut()}
          className="cursor-pointer"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
