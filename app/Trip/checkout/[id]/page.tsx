import SuccessPageChckout from "@/components/SuccessPageChckout";
import React from "react";

const page = async ({ params }: any) => {
  const { id } = await params;
  return (
    <div>
      <SuccessPageChckout TripId={id} />
    </div>
  );
};

export default page;
