"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { newVerification } from "@/actions/new-verification";

interface NewVerificationFormProps {
  token: string;
}

export const NewVerificationForm = ({ token }: NewVerificationFormProps) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const onSubmit = useCallback(() => {
    if (success || error) return;

    newVerification(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
      })
      .catch(() => {
        setError("Something went wrong!");
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  }, [onSubmit]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FBFC] p-6">
      <div className="w-[495px] max-[556px]:w-full rounded-[20px] border border-[#ECF2EF] bg-white p-[40px_25px] text-center">
        <div className="mb-[25px] flex items-center justify-center gap-2">
          <Image
            src="/assets/icons/logo.svg"
            alt="logo"
            width={30}
            height={30}
          />
          <h1 className="text-[24px] font-[700]">Tourvisto</h1>
        </div>

        <h1 className="mb-4 text-[26px] font-[600] text-[#1F1F36]">
          {!success && !error && "Confirming your email..."}
          {success && "Email verified!"}
          {error && "Verification failed"}
        </h1>

        <p className="mb-6 text-[16px] text-[#7F7E83]">
          {!success && !error && "Please wait while we verify your email."}
          {success && "Your email has been verified. You can now log in."}
          {error && error}
        </p>

        <Button asChild className="w-full bg-[#256FF1] text-white">
          <Link href={success ? "/auth/login" : "/auth/signup"}>
            {success ? "Back to login" : "Back to sign up"}
          </Link>
        </Button>
      </div>
    </div>
  );
};
