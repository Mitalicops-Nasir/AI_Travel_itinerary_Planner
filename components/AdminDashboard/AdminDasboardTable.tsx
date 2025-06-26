"use client";

import React from "react";
import Image from "next/image";

import { TheUsersInfo } from "./AllUserTable";

export const AdminDasboardTable = ({ users }: { users: TheUsersInfo }) => {
  return (
    <div>
      <table className="table-auto w-full rounded-xl">
        <thead>
          <tr className="bg-[#FFFFFF] text-[12px] text-[#7F7E83]">
            <th className="pt-[18px] text-left  pb-[18px] pl-[24px] pr-[24px] rounded-tl-[10px] rounded-tr-[10px]">
              NAME
            </th>
            <th className="pt-[18px] text-left  pb-[18px] pl-[24px] pr-[24px]">
              ITINEARY CREATED
            </th>
          </tr>
        </thead>
        <tbody>
          {users?.users.slice(0, 3).map((user) => (
            <tr key={user.id} className="bg-[#F9FBFC]">
              <td className="pt-[18px] pb-[18px] pl-[24px] pr-[24px] align-top border-t-2 border-b-2 border-[#EEF9FF]">
                <div className="flex items-center gap-[12px] max-[500px]:flex-col max-[500px]:text-center">
                  <Image
                    src={"/assets/images/default-pic.jpg"}
                    alt="user"
                    width={40}
                    height={40}
                    className="rounded-[40px] max-[500px]:w-[30px] max-[500px]:h-[30px]"
                  />
                  <h1 className="font-semibold text-[14px] text-[#1F1F36]">
                    {user.name}
                  </h1>
                </div>
              </td>
              <td className="pt-[18px] pb-[18px] pl-[24px] pr-[24px] border-t-2 border-b-2 border-[#EEF9FF]">
                <h1 className="text-[#2E2C48] text-[14px] font-normal">
                  {user._count.trip}
                </h1>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const AdminDasboardTableSecond = ({
  users,
}: {
  users: TheUsersInfo;
}) => {
  return (
    <div>
      <table className="table-auto w-full rounded-xl">
        <thead>
          <tr className="bg-[#FFFFFF] text-[12px] text-[#7F7E83]">
            <th className="pt-[18px] text-left  pb-[18px] pl-[24px] pr-[24px] rounded-tl-[10px] rounded-tr-[10px]">
              BOOKING
            </th>
            <th className="pt-[18px] text-left  pb-[18px] pl-[24px] pr-[24px]">
              TRAVEL DATES
            </th>
          </tr>
        </thead>
        <tbody>
          {users?.users.slice(0, 3).map((user) => (
            <tr key={user.id} className="bg-[#F9FBFC]">
              <td className="pt-[18px] pb-[18px] pl-[24px] pr-[24px] align-top border-t-2 border-b-2 border-[#EEF9FF]">
                <div className="flex items-center gap-[12px] max-[500px]:flex-col max-[500px]:text-center">
                  <Image
                    src={"/assets/images/default-pic.jpg"}
                    alt="user"
                    width={40}
                    height={40}
                    className="rounded-[40px] max-[500px]:w-[30px] max-[500px]:h-[30px]"
                  />
                  <h1 className="font-semibold text-[14px] text-[#1F1F36]">
                    {user.name}
                  </h1>
                </div>
              </td>
              <td className="pt-[18px] pb-[18px] pl-[24px] pr-[24px] border-t-2 border-b-2 border-[#EEF9FF]">
                <h1 className="text-[#2E2C48] text-[14px] font-normal">
                  {user._count.trip}
                </h1>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
