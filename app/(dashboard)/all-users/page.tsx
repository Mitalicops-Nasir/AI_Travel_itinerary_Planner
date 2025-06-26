import { deleteUser, getAllUsers } from "@/actions/user.actions";
import AllUser from "@/components/AdminDashboard/AllUserTable";
import { currentUser } from "@/lib/auth";
import React from "react";

export const dynamic = "force-dynamic";

const page = async () => {
  const ManyUsers = await getAllUsers();
  const TheCurrentUser = await currentUser();

  return (
    <div className="w-full">
      <AllUser users={ManyUsers} CurrentUser={TheCurrentUser!} />
    </div>
  );
};

export default page;
