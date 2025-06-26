import { Navbar } from "@/components/HomePage/Navbar";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Navbar className="bg-amber-[#ffff] pb-[30px] !pt-[30px]" color="black"/>
      {children}

      <Toaster />
    </div>
  );
}
