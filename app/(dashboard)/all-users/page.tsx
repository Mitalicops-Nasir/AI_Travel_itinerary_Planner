import { getAllUsers } from "@/actions/user.actions";
import AllUser from "@/components/AdminDashboard/AllUserTable";
import { currentUser } from "@/lib/auth";
import React from "react";

export const dynamic = "force-dynamic";

const page = async () => {
  const [ManyUsers, TheCurrentUser] = await Promise.all([
    getAllUsers(),
    currentUser(),
  ]);

  if (!TheCurrentUser) {
    return <div>Please log in to view this page.</div>;
  }

  return (
    <div className="w-full">
      <AllUser users={ManyUsers} CurrentUser={TheCurrentUser} />
    </div>
  );
};

export default page;
