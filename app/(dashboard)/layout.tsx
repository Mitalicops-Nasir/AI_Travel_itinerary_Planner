import { AppShell } from "@/components/AdminDashboard/AppShell";
import { currentUser } from "@/lib/auth";
import { isPro } from "@/features/membership/lib";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const TheUser = await currentUser();

  const userIsPro = TheUser?.id ? await isPro(TheUser.id) : false;

  return (
    <AppShell user={TheUser} isPro={userIsPro}>
      {children}
    </AppShell>
  );
}