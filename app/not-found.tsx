import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F9FBFC] p-6 text-center">
      <h1 className="text-[40px] font-[700] text-[#1F1F36]">404</h1>
      <p className="text-[18px] text-[#7F7E83]">
        This page could not be found.
      </p>
      <Link
        href="/"
        className="rounded-[8px] bg-[#256FF1] px-[20px] py-[12px] text-white"
      >
        Go back home
      </Link>
    </div>
  );
}
