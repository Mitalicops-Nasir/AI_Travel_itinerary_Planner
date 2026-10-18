"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";

import "react-phone-number-input/style.css";

import { FaRegUserCircle } from "react-icons/fa";
import { MdOutlineAlternateEmail } from "react-icons/md";

import { RiLockPasswordFill } from "react-icons/ri";
import CustomForm from "./CustomForm";
import { RegisterUser } from "./validationZod/registerUser";

import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/SubmitButton";
import { FormFieldType } from "@/constants";
import { signUpUser } from "@/actions/register";
import { useRouter } from "next/navigation";

const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof RegisterUser>>({
    resolver: zodResolver(RegisterUser),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof RegisterUser>) => {
    setIsLoading(true);

    try {
      const newUser = await signUpUser(values);

      if (newUser.success) {
        toast.success("User registered successfully");

        form.reset();
        router.push("/auth/login?credentials=1");
      }

      if (newUser.error) {
        toast.error(newUser.error);
      }
    } catch (error) {
      toast.error(`User registration failed ERR:${error}`);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 !flex flex-col"
      >
        <section className="!p-[5%] bg-[url('/auth-img.webp')] bg-cover bg-center bg-no-repeat h-screen relative">
          <div className="absolute bg-[linear-gradient(to_right,_#CFF1FFCC_40%,_#CFF1FF33_100%)]  inset-0" />
          <h1 className="!text-[40px] z-10 relative text-black text-center !mb-7 !font-bold">
            Register
          </h1>

          <div className="w-full relative z-10 flex flex-col justify-center items-center rounded-full">
            <div
              className="pt-[40px] pb-[40px] pl-[25px] w-[495px] max-[556px]:w-full 
                pr-[25px] border border-[#ECF2EF] bg-[#FFFFFF] rounded-[20px] border-solid shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shadow-[#1F1F3633]"
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
                name="name"
                label="Full Name"
                placeholder="John Doe"
                iconSrc={<FaRegUserCircle color="white" />}
                iconAlt="user"
              />
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

              <CustomForm
                fieldType={FormFieldType.PHONE_INPUT}
                control={form.control}
                name="phone"
                label="Phone Number"
                placeholder="(123) 456-7890"
              />

              <div className="flex flex-col items-center">
                <SubmitButton
                  isLoading={isLoading}
                  className="bg-[#256FF1]
                 !text-white w-full mt-[30px] !rounded-full cursor-pointer"
                >
                  Register
                </SubmitButton>

                <Button
                  variant="link"
                  asChild
                  className="rounded-[8px] mt-[5px] cursor-pointer"
                >
                  <Link href="/auth/login">Already have an account? Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </form>
    </Form>
  );
};

export default RegisterForm;
