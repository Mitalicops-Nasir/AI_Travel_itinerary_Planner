"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { leaveTrip, removeMember } from "../actions";
import type { MemberView } from "../types";

function MemberRow({
  member,
  isViewerOwner,
  isCurrentUser,
  tripId,
}: {
  member: MemberView;
  isViewerOwner: boolean;
  isCurrentUser: boolean;
  tripId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function remove() {
    startTransition(async () => {
      const result = await removeMember(tripId, member.userId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`${member.name ?? "Member"} was removed from this trip.`);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3 py-2.5">
      <Image
        src={member.image ?? "/assets/images/default-pic.jpg"}
        alt=""
        width={36}
        height={36}
        className="shrink-0 rounded-full object-cover"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-[600] text-[#141627]">
          {member.name ?? "Traveler"}
          {isCurrentUser ? " (you)" : ""}
        </p>
        <p className="truncate text-[12.5px] text-[#7F7E83]">{member.email}</p>
      </div>

      {member.role === "OWNER" ? (
        <span className="rounded-full bg-[#E8F1FE] px-3 py-[4px] text-[11.5px] font-[600] text-[#256FF1]">
          Owner
        </span>
      ) : (
        isViewerOwner &&
        !isCurrentUser && (
          <button
            type="button"
            onClick={remove}
            disabled={isPending}
            className="h-[32px] cursor-pointer rounded-full border border-[#ECF2EF] px-3.5 text-[12.5px] text-[#B42318] transition-colors hover:bg-[#FDECEC] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Removing..." : "Remove"}
          </button>
        )
      )}
    </div>
  );
}

export function TripMembersModal({
  open,
  onOpenChange,
  tripId,
  members,
  currentUserId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  members: MemberView[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const viewer = members.find((member) => member.userId === currentUserId);
  const isViewerOwner = viewer?.role === "OWNER";
  const isViewerMember = viewer?.role === "MEMBER";

  function leave() {
    startTransition(async () => {
      const result = await leaveTrip(tripId);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("You left this trip.");
      onOpenChange(false);
      router.push("/AI-Trips");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[16px] border-[#ECF2EF] sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-[700] text-[#141627]">
            Trip crew
          </DialogTitle>
          <DialogDescription className="text-[14px] text-[#7F7E83]">
            {members.length} {members.length === 1 ? "person" : "people"} on
            this trip.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col divide-y divide-[#F0F4F2]">
          {members.map((member) => (
            <MemberRow
              key={member.userId}
              member={member}
              isViewerOwner={isViewerOwner}
              isCurrentUser={member.userId === currentUserId}
              tripId={tripId}
            />
          ))}
        </div>

        {isViewerMember && (
          <button
            type="button"
            onClick={leave}
            disabled={isPending}
            className="h-[42px] cursor-pointer rounded-full border border-[#ECF2EF] text-[14px] text-[#B42318] transition-colors hover:bg-[#FDECEC] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Leaving..." : "Leave this trip"}
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
