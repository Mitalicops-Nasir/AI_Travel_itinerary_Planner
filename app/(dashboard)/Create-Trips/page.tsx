
import CreateItenaries from "@/components/AdminDashboard/CreateItenaries";
import { currentUser } from "@/lib/auth";
import React from "react";

const page = async () => {
  const user = await currentUser()
  return (
    <div className="w-full">
      <CreateItenaries userId={user?.id}/>
    </div>
  );
};

export default page;
