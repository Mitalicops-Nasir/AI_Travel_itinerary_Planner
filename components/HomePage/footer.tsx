import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <section className="bg-[#F9FBFC] w-full pl-[140px] pt-[50px] pb-[40px] max-[768px]:pr-[40px] max-[768px]:pl-[40px] pr-[140px]">
      <footer className="flex items-center justify-between max-[580px]:flex-col gap-4 max-[580px]:items-start">
        <div className="flex items-center gap-2">
          <Image
            src="/assets/icons/logo.svg"
            alt="logo"
            width={30}
            height={30}
            className=""
          />
          <h1 className="font-[700] text-[24px] line-clamp-4">Tourvisto</h1>
        </div>
        <div className="flex items-center gap-[24px]">
          <Link href="/" className="font-[400] text-[#7F7E83] text-[16px]">
            Terms & Condition
          </Link>

          <Link href="/" className="font-[400] text-[#7F7E83] text-[16px]">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </section>
  );
};

export default Footer;
