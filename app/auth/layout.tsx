import { Toaster } from "sonner";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <main className="flex flex-col min-h-screen">
        {children}
      </main>

      <Toaster/>
    </div>
  );
}
