import SideNavbar from "@/components/AdminDashboard/SideNavbar";
import { currentUser } from "@/lib/auth";
import { Toaster } from "sonner";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const TheUser = await currentUser();
  return (
    <div className="flex max-[768px]:flex-col w-full h-full">
      <SideNavbar user={TheUser} />
      {children}

      <Toaster />
    </div>
  );
}
