"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Form } from "@/components/ui/form";
import { MdOutlineAlternateEmail } from "react-icons/md";

import { useEffect, useState } from "react";

import { RiLockPasswordFill } from "react-icons/ri";

import { useSearchParams } from "next/navigation";

import CustomForm from "./CustomForm";
import { loginSchema } from "./validationZod/loginUser";

import { toast } from "sonner";
import { SubmitButton } from "@/components/SubmitButton";
import { FormFieldType } from "@/constants";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { Login } from "@/actions/login";

function isRedirectError(error: unknown) {
  return (
    error instanceof Error && error.message.includes("NEXT_REDIRECT")
  );
}

export const LoginForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with a different provider!"
      : "";

  const [isLoading, setIsLoading] = useState(false);

  // RegisterForm links here with ?credentials=1 so the credentials panel
  // is already visible on the first render.
  const [credential, setCredential] = useState(
    searchParams.get("credentials") === "1"
  );

  useEffect(() => {
    if (urlError) {
      toast.error(urlError, {
        style: {
          backgroundColor: "#FF0000",
          border: "1px solid #FF0000",
          color: "white",
        },
      });
    }
  }, [urlError]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const redirectTarget = callbackUrl ?? DEFAULT_LOGIN_REDIRECT;

  const handleClick = () => {
    signIn("google", {
      redirectTo: redirectTarget,
    });
  };

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);

    try {
      const newUser = await Login(values, callbackUrl);

      if (newUser?.error) {
        toast.error(newUser.error);
      }

      if (newUser?.success) {
        toast.success(newUser.success);
        form.reset();
      }

      setIsLoading(false);
    } catch (error) {
      // A thrown NEXT_REDIRECT is how Auth.js reports a successful login
      // redirect; the router handles it, so swallow it here.
      if (isRedirectError(error)) return;

      console.log(error);
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 flex flex-col"
      >
        <section className="!p-[5%] bg-[url('/auth-img.webp')] bg-cover bg-center bg-no-repeat h-screen relative">
          <div className="absolute bg-[linear-gradient(to_right,_#CFF1FFCC_40%,_#CFF1FF33_100%)]  inset-0" />
          <h1 className="!text-[40px] z-10 relative text-black text-center !mb-7 !font-bold">
            Login
          </h1>
          <div className="w-full z-[10] relative flex flex-col justify-center items-center rounded-full">
            {credential ? (
              <div
                className="pt-[40px] pb-[40px] pl-[25px] w-[495px] max-[556px]:w-full 
                pr-[25px] border border-[#ECF2EF] bg-[#FFFFFF] rounded-[20px] border-solid"
              >
                <div className="flex items-center justify-center gap-2 mb-[25px]">
                  <Image
                    src="/assets/icons/logo.svg"
                    alt="logo"
                    width={30}
                    height={30}
                    className=""
                  />
                  <h1 className="font-[700] text-[24px] line-clamp-4">
                    Tourvisto
                  </h1>
                </div>
                <CustomForm
                  fieldType={FormFieldType.INPUT}
                  control={form.control}
                  name="email"
                  label="Email"
                  placeholder="johndoe@example.com"
                  iconSrc={<MdOutlineAlternateEmail color="white" />}
                  iconAlt="email"
                />
                <CustomForm
                  fieldType={FormFieldType.PASSWORD}
                  control={form.control}
                  name="password"
                  label="Password"
                  placeholder="********"
                  iconSrc={<RiLockPasswordFill color="white" />}
                  iconAlt="password"
                />

                <div className="flex flex-col items-center">
                  <SubmitButton
                    isLoading={isLoading}
                    className="bg-[#256FF1]
                 !text-white w-full !rounded-full cursor-pointer !mt-4"
                  >
                    Login
                  </SubmitButton>

                  <div className="flex justify-between max-[430px]:flex-col">
                    <Button
                      variant="link"
                      onClick={() => setCredential(false)}
                      className="rounded-[8px] mt-[5px]  cursor-pointer"
                    >
                      Sign In With Google
                    </Button>

                    <Button
                      variant="link"
                      asChild
                      className="rounded-[8px] mt-[5px]  cursor-pointer"
                    >
                      <Link href="/auth/reset">Forgot Password?</Link>
                    </Button>

                    <Button
                      variant="link"
                      asChild
                      className="rounded-[8px] mt-[5px]  cursor-pointer"
                    >
                      <Link href="/auth/signup">No Account? Register!</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="flex flex-col items-center
                pt-[40px] pb-[40px] pl-[25px] w-[495px] max-[556px]:w-full pr-[25px] border border-[#ECF2EF] bg-[#FFFFFF] rounded-[20px] border-solid"
              >
                <div className="flex items-center gap-2 mb-[25px]">
                  <Image
                    src="/assets/icons/logo.svg"
                    alt="logo"
                    width={30}
                    height={30}
                    className=""
                  />
                  <h1 className="font-[700] text-[24px] line-clamp-4">
                    Tourvisto
                  </h1>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <h1 className="text-[28px] text-center text-[#1F1F36] font-[600]">
                    Start Your Travel Journey
                  </h1>
                  <p className="text-[18px] text-center text-[#7F7E83] font-[400]">
                    Sign in with Google to explore AI-generated itineraries,
                    trending destinations, and much more
                  </p>

                  <Button
                    onClick={handleClick}
                    className="pt-[14px] cursor-pointer pr-[16px] pb-[14px] pl-[16px] w-[445px] max-[556px]:w-full h-[52px] gap-[10px]
                      mt-[15px] inline-flex items-center justify-center rounded-[8px] bg-[#256FF1]"
                  >
                    <Image
                      src="/assets/icons/google.svg"
                      alt="logo"
                      width={20}
                      height={20}
                      className=""
                    />
                    <span className="text-[18px]">Sign in with Google</span>
                  </Button>

                  <Button
                    variant="link"
                    onClick={() => setCredential(true)}
                    className="rounded-[8px] mt-[5px] cursor-pointer"
                  >
                    Sign In With Credentials?
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </form>
    </Form>
  );
};
