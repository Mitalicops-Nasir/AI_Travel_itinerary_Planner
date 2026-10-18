"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { RiLockPasswordFill } from "react-icons/ri";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/SubmitButton";
import { FormFieldType } from "@/constants";
import CustomForm from "@/FormsRelatedConfig/CustomForm";
import { NewPasswordSchema } from "@/FormsRelatedConfig/validationZod/loginUser";
import { NewPassword } from "@/actions/new-password";

interface NewPasswordFormProps {
  token: string;
}

export const NewPasswordForm = ({ token }: NewPasswordFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: { password: "" },
  });

  const onSubmit = async (values: z.infer<typeof NewPasswordSchema>) => {
    setIsLoading(true);

    try {
      const result = await NewPassword(values, token);

      if (result.error) {
        toast.error(result.error);
      }

      if (result.success) {
        toast.success(result.success);
        form.reset();
        router.push("/auth/login");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FBFC] p-6">
      <div className="w-[495px] max-[556px]:w-full rounded-[20px] border border-[#ECF2EF] bg-white p-[40px_25px]">
        <div className="mb-[25px] flex items-center justify-center gap-2">
          <Image
            src="/assets/icons/logo.svg"
            alt="logo"
            width={30}
            height={30}
          />
          <h1 className="text-[24px] font-[700]">Tourvisto</h1>
        </div>

        <h1 className="mb-6 text-center text-[26px] font-[600] text-[#1F1F36]">
          Enter a new password
        </h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col items-center"
          >
            <CustomForm
              fieldType={FormFieldType.PASSWORD}
              control={form.control}
              name="password"
              label="New Password"
              placeholder="********"
              iconSrc={<RiLockPasswordFill color="white" />}
              iconAlt="password"
            />

            <SubmitButton
              isLoading={isLoading}
              className="mt-4 w-full cursor-pointer rounded-full bg-[#256FF1] !text-white"
            >
              Reset password
            </SubmitButton>
          </form>
        </Form>

        <div className="mt-4 text-center">
          <Button variant="link" asChild className="cursor-pointer">
            <Link href="/auth/login">Back to login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
