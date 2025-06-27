"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Form } from "../ui/form";
import CustomFormForTrip from "@/FormsRelatedConfig/CustomFormForTripGeneration/CustomFormForTrip";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  budgetOptions,
  FormFieldType,
  groupTypes,
  interests,
  travelStyles,
} from "@/constants";
import { SelectItem } from "../ui/select";
import { NewTrip } from "@/FormsRelatedConfig/validationZod/TripGenerateSchema";

import TripMapForGeneration from "../TripDetails/TripMap";
import dynamic from "next/dynamic";
import { getName } from "country-list";
import { createTrip, GenerateAITripIternary } from "@/actions/CreateTrip";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ReactFlagsSelect = dynamic(() => import("react-flags-select"), {
  ssr: false, // avoids hydration mismatch error
  loading: () => <p>Loading...</p>, // Optional: show placeholder
});

const CreateItenaries = ({ userId }: { userId: string | undefined }) => {
  const [disabled, setDisabled] = useState(false);
  const [selected, setSelectedCountry] = useState<string>("US"); //the state is being used to show the flag and name once clicked otherwise the "watch" updates state directly from the form value

  const router = useRouter();

  const form = useForm<z.infer<typeof NewTrip>>({
    resolver: zodResolver(NewTrip),
    defaultValues: {
      ...NewTrip.default,
    },
  });

  //react-hook-form feature method "watch" which works like use state but updates the state directly from the selected form value
  const selectedCountry = form.watch("country");

  const onSubmit = async (values: z.infer<typeof NewTrip>) => {
    setDisabled(true);
    try {
      const TheTrip = {
        id: "",
        country: values.country,
        duration: values.duration,
        groupType: values.groupType,
        travelStyle: values.travelStyle,
        interests: values.interests,
        budgetEstimate: values.budgetEstimate,
      };

     // console.log("TheTrip", TheTrip);

      const MakeTripInDB = await createTrip(TheTrip, userId!);

      const MakeAIResponseInDB = await GenerateAITripIternary(
        values,
        MakeTripInDB.trip.id
      );

      if (!MakeAIResponseInDB.success) {
        toast.error("Failed to generate AI Iterinary. Please try again.");
        setDisabled(false);
        return;
      }

      if (MakeTripInDB.success) {
        toast.success("Trip Generated successfully!");

        router.push(`/Trip/${MakeTripInDB.trip.id}/Trip-Details`);

        setDisabled(false);
        return;
      }

      return MakeAIResponseInDB;
    } catch (error) {
      toast.error("Failed to generate trip. Please try again.");
      setDisabled(false);
      console.log(error);
    }
  };
  return (
    <section className="bg-[#F9FBFC] w-full h-full p-[4%]">
      <div className="flex flex-col gap-[10px] mb-[35px]">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[36px] font-[700]">Add new Trips</h1>

          <Button
            className="pt-[12px] pr-[16px] pb-[12px] pl-[16px] w-[233px] h-[44px] max-[500px]:w-fit cursor-pointer bg-[#256FF1]"
            asChild
          >
            <Link href="/Create-Trips" className="flex items-center gap-2">
              <Image
                src="/assets/icons/plus.svg"
                width={20}
                height={20}
                alt=""
              />
              <p>Create a Trip</p>
            </Link>
          </Button>
        </div>

        <p className="text-[18px] text-[#7F7E83] font-[400]">
          View and Generate AI Travel Plans
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 !flex flex-col"
        >
          <div className="w-full relative z-10 flex flex-col justify-center items-center p-5 rounded-full">
            <div
              className="pt-[40px] pb-[40px] pl-[25px] w-[700px] max-[768px]:w-full max-[556px]:w-full 
                pr-[25px] border border-[#ECF2EF] bg-[#FFFFFF] rounded-[20px] border-solid shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shadow-[#1F1F3633]"
            >
              <CustomFormForTrip
                fieldType={FormFieldType.SKELETON} // Use SKELETON to bypass built-in field rendering
                control={form.control}
                name="country"
                label="Country"
                renderSkeleton={() => (
                  <ReactFlagsSelect
                    selected={selected}
                    onSelect={(code) => {
                      const fullCountryName = getName(code); // "United States"
                      setSelectedCountry(code); // Update selected country code
                      form.setValue("country", fullCountryName!); // Save full name in form
                    }}
                    className="!border-[#EBEEED] !rounded-[8px]"
                    fullWidth={true}
                    searchable
                  />
                )}
              />

              <CustomFormForTrip
                fieldType={FormFieldType.NUMBER}
                control={form.control}
                name="duration"
                label="Duration"
                placeholder="Enter number of days (e.g., 5, 12)"
              />

              <CustomFormForTrip
                fieldType={FormFieldType.SELECT}
                control={form.control}
                name="groupType"
                label="Group Type"
                placeholder="Select a group type"
              >
                {groupTypes.map((item, index) => (
                  <SelectItem
                    key={index}
                    value={item}
                    className={`flex items-center gap-3 cursor-pointer pt-[9px] pb-[9px] pr-[10px] pl-[10px] rounded-[6px] w-[652px] h-[38px]`}
                  >
                    <div>
                      <p className="text-[14px] font-medium text-[#1F1F36]">
                        {item}
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </CustomFormForTrip>

              <CustomFormForTrip
                fieldType={FormFieldType.SELECT}
                control={form.control}
                name="travelStyle"
                label="Travel Style"
                placeholder="Select your travel style"
              >
                {travelStyles.map((item, index) => (
                  <SelectItem
                    key={index}
                    value={item}
                    className={`flex items-center cursor-pointer gap-3 pt-[9px] pb-[9px] pr-[10px] pl-[10px] rounded-[6px] w-[652px] h-[38px]`}
                  >
                    <div>
                      <p className="text-[14px] font-medium text-[#1F1F36]">
                        {item}
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </CustomFormForTrip>

              <CustomFormForTrip
                fieldType={FormFieldType.SELECT}
                control={form.control}
                name="interests"
                label="Interests"
                placeholder="Select your travel style"
              >
                {interests.map((item, index) => (
                  <SelectItem
                    key={index}
                    value={item}
                    className={`flex items-center cursor-pointer gap-3 pt-[9px] pb-[9px] pr-[10px] pl-[10px] rounded-[6px] w-[652px] h-[38px]`}
                  >
                    <div>
                      <p className="text-[14px] font-medium text-[#1F1F36]">
                        {item}
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </CustomFormForTrip>

              <CustomFormForTrip
                fieldType={FormFieldType.SELECT}
                control={form.control}
                name="budgetEstimate"
                label="Budget Estimate"
                placeholder="Select your budget preference"
              >
                {budgetOptions.map((item, index) => (
                  <SelectItem
                    key={index}
                    value={item}
                    className={`flex items-center gap-3 cursor-pointer pt-[9px] pb-[9px] pr-[10px] pl-[10px] rounded-[6px] w-[652px] h-[38px]`}
                  >
                    <div>
                      <p className="text-[14px] font-medium text-[#1F1F36]">
                        {item}
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </CustomFormForTrip>

              <p className="text-[#7F7E83] font-normal text-[14px] mt-4 mb-3">
                Map
              </p>

              <TripMapForGeneration selectedCountry={selectedCountry} />

              <div className="border border-[#EAECF0] mt-7 w-full" />

              <Button
                type="submit"
                disabled={disabled}
                className="pt-[12px] pr-[16px] w-full pb-[12px] pl-[16px] h-[44px]
                   max-[500px]:w-fit cursor-pointer bg-[#256FF1] flex items-center gap-2 mt-4"
              >
                {disabled ? (
                  <>
                    <Image
                      src="/assets/icons/loader.svg"
                      alt="loader"
                      width={24}
                      height={24}
                      className="animate-spin"
                    />
                    <p className="text-[16px] font-normal">Loading</p>
                  </>
                ) : (
                  <>
                    <Image
                      src="/assets/icons/magic-star.svg"
                      width={15}
                      height={15}
                      alt="magic-star"
                    />
                    <p className="text-[16px] font-normal">Generate a Trip</p>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};

export default CreateItenaries;
