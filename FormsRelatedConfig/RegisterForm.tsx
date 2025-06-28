"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form";

import "react-datepicker/dist/react-datepicker.css";
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
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { signUpUser } from "@/actions/register";
import { useRouter } from "next/navigation";
import { TheModalSwitch } from "./validationZod/Modal";
import { useAuthFlowStore } from "./useAuthFlowStore";

const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  //const [error, setError] = useState<string | undefined>("");
  //const [success, setSuccess] = useState<string | undefined>("");
  //const [imageUrl, setImageUrl] = useState<any>();
  const router = useRouter();

  const { setFromRegister } = useAuthFlowStore();

  const form = useForm<z.infer<typeof RegisterUser>>({
    resolver: zodResolver(RegisterUser),
    defaultValues: {
      ...RegisterUser.default,
    },
  });

  //useEffect(() => {
  //if (imageUrl?.secure_url) {
  //form.setValue("identificationDocumentUrl", imageUrl?.secure_url);
  //}
  //}, [imageUrl, form]);

  const onSubmit = async (values: z.infer<typeof RegisterUser>) => {
    setIsLoading(true);

    // Store file info in form data as
    //let formData;
    //if (
    //values.identificationDocument &&
    //values.identificationDocument?.length > 0
    //) {
    //const blobFile = new Blob([values.identificationDocument[0]], {
    //type: values.identificationDocument[0].type,
    //});

    //formData = new FormData();
    //formData.append("blobFile", blobFile);
    //formData.append("fileName", values.identificationDocument[0].name);
    //}

    // Store file info in form data as

    try {
      const user = {
        id: "",
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      };

      const newUser = await signUpUser(user);

      if (newUser.success) {
        //setSuccess("Patient registered successfully");
        toast.success("User registered successfully");

        form.reset();
        setIsLoading(false);
        setFromRegister(true);
        router.push("/auth/login");

        //THIS MODAL USES LOCAL STROAGE FOR STATE MANAGEMENT OF GOOGLE SIGN IN AND CREDENTIAL
        // SEE LOGIN FORM TOO IF WANNA USE IT. The Modal.ts file is the one to use

        //TheModalSwitch(true);

        ///////////////
      }

      if (newUser.error) {
        toast.error(newUser.error as string);
        console.log("error", newUser.error);
        setIsLoading(false);
      }
    } catch (error) {
      toast.error(`User registration failed ERR:${error}`);

      console.log(error);
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
                placeholder="johndoe@jsmastery.pro"
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
                  <Link href="/auth/login">Sign In with Google</Link>
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
