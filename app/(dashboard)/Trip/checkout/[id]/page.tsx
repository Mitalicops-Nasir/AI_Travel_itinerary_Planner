import SuccessPageChckout from "@/components/SuccessPageChckout";
import { redirect } from "next/navigation";
import React from "react";

const page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) => {
  const { id } = await params;
  const { success } = await searchParams;

  // Only show the success page when Stripe redirected here after a payment;
  // direct visits go back to the trip details.
  if (success !== "true") {
    redirect(`/Trip/${id}/Trip-Details`);
  }

  return (
    <div>
      <SuccessPageChckout TripId={id} />
    </div>
  );
};

export default page;
