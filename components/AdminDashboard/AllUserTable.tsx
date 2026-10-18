"use client";

import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { RiDeleteBin6Line } from "react-icons/ri";
import { ExtendedUser } from "@/next-auth";
import { cn } from "@/lib/utils";
import { deleteUser } from "@/actions/user.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { usePagination } from "@/hooks/usePagination";
import Pagination from "@/components/Pagination";

export type UserTableRow = {
  id: string;
  name: string;
  email: string;
  createdAt: Date | null;
  role: "ADMIN" | "USER";
  image: string | null;
  _count: {
    trip: number;
  };
};

const ITEMS_PER_PAGE = 8;

const AllUser = ({
  users,
  CurrentUser,
}: {
  users: UserTableRow[];
  CurrentUser: ExtendedUser;
}) => {
  const router = useRouter();
  const { page, totalPages, pageItems, goToPage } = usePagination(
    users,
    ITEMS_PER_PAGE
  );
  const isAdmin = CurrentUser.role === "ADMIN";

  const handleDelete = async (id: string) => {
    try {
      const deleteTheUser = await deleteUser(id);

      if (deleteTheUser?.error) {
        toast.error(deleteTheUser.error);
        return;
      }

      toast("User Deleted Sucessfully", {
        style: {
          backgroundColor: "limegreen",
          color: "white",
        },
      });

      router.refresh();
    } catch (error) {
      toast("Failed to delete user", {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      });
      console.log(error);
    }
  };
  return (
    <section className="bg-[#F9FBFC] w-full h-full p-[4%]">
      <div className="flex flex-col gap-[10px] mb-[35px]">
        <div className="flex items-center justify-between mb-5 gap-3">
          <h1 className="text-[24px] font-[700] leading-[44px]">
            Manage Users
          </h1>

          <Button
            className="pt-[12px] pr-[16px] pb-[12px] pl-[16px] w-[233px] h-[44px] max-[500px]:w-fit cursor-pointer bg-[#256FF1]"
            asChild
          >
            <Link href="/Create-Trips" className="flex items-center gap-2">
              <Image
                src="/assets/icons/plus.svg"
                width={20}
                height={20}
                alt=""
              />
              <p>Create a Trip</p>
            </Link>
          </Button>
        </div>

        <p className="text-[18px] text-[#7F7E83] font-[400]">
          Filter, sort, and access detailed user profiles
        </p>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="table-auto w-full rounded-xl border bg-[#FFFFFF] border-[#ECF2EF]">
          <thead>
            <tr className="bg-[#FFFFFF] text-[12px] text-[#7F7E83]">
              <th className="pt-[18px] text-left  pb-[18px] pl-[24px] pr-[24px] rounded-tl-[10px] rounded-tr-[10px]">
                NAME
              </th>
              <th className="pt-[18px] text-left  pb-[18px] pl-[24px] pr-[24px]">
                EMAIL ADDRESS
              </th>
              <th className="pt-[18px] text-left  pb-[18px] pl-[24px] pr-[24px]">
                DATE JOINED
              </th>
              <th className="pt-[18px] text-left  pb-[18px] pl-[24px] pr-[24px]">
                ITINERARY CREATED
              </th>
              <th className="pt-[18px] text-left  pb-[18px] pl-[24px] pr-[24px] rounded-tl-[10px] rounded-tr-[10px]">
                STATUS
              </th>

              {isAdmin && (
                <th className="pt-[18px] text-left  pb-[18px] pl-[24px] pr-[24px] rounded-tl-[10px] rounded-tr-[10px]"></th>
              )}
            </tr>
          </thead>
          <tbody>
            {pageItems.map((user) => (
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
                    {user.email}
                  </h1>
                </td>
                <td className="pt-[18px] pb-[18px] pl-[24px] pr-[24px] border-t-2 border-b-2 border-[#EEF9FF]">
                  <span className="text-[#2E2C48] text-[14px] font-normal">
                    {user.createdAt?.toDateString()}
                  </span>
                </td>

                <td className="pt-[18px] pb-[18px] pl-[24px] pr-[24px] border-t-2 border-b-2 border-[#EEF9FF]">
                  <span className="text-[#2E2C48] text-[14px] font-normal">
                    {user._count.trip}
                  </span>
                </td>

                <td className="pt-[18px] pb-[18px] pl-[24px] pr-[24px] border-t-2 border-b-2 border-[#EEF9FF]">
                  <span
                    className={cn(
                      "text-[14px] font-medium pt-[2px] pb-[2px] pr-[8px] pl-[8px] rounded-[16px]",
                      user.role === "ADMIN"
                        ? "bg-[#F2F4F7] text-[#344054]"
                        : "bg-[#ECFDF3] text-[#027A48]"
                    )}
                  >
                    {user.role}
                  </span>
                </td>

                {isAdmin && (
                  <td className="pt-[18px] pb-[18px] pl-[24px] pr-[24px] border-t-2 border-b-2 border-[#EEF9FF]">
                    <RiDeleteBin6Line
                      size={20}
                      color="red"
                      className="cursor-pointer"
                      onClick={() => handleDelete(user.id)}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={goToPage}
        className="pt-[16px] pb-[16px] pr-[22px] pl-[22px] rounded-bl-[13px] rounded-br-[13px] border-1 bg-[#fff] border-[#EAECF0]"
      />
    </section>
  );
};

export default AllUser;
