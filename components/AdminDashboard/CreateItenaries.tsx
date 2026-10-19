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

import dynamic from "next/dynamic";
import { getName } from "country-list";
import { GenerateAITripIternary } from "@/actions/CreateTrip";
import { toast } from "sonner";
import { UpgradeModal } from "@/features/membership/components/UpgradeModal";
import type { QuotaView } from "@/features/membership/types";
import { useRouter } from "next/navigation";
import { ImportTripModal } from "@/features/trip-import/components/ImportTripModal";
import type { ImportDraft } from "@/features/trip-import/types";
import { Wand2 } from "lucide-react";

const ReactFlagsSelect = dynamic(() => import("react-flags-select"), {
  ssr: false, // avoids hydration mismatch error
  loading: () => <p>Loading...</p>, // Optional: show placeholder
});

// Leaflet touches window/document at import time, so it must never be SSR'd
const CountryMap = dynamic(() => import("./CountryMap"), {
  ssr: false,
  loading: () => (
    <p className="text-gray-500 mt-3 ml-2">Select a country to view it on the map</p>
  ),
});

const CreateItenaries = () => {
  const [disabled, setDisabled] = useState(false);
  const [selected, setSelectedCountry] = useState<string>("US"); //the state is being used to show the flag and name once clicked otherwise the "watch" updates state directly from the form value
  const [importOpen, setImportOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [limitQuota, setLimitQuota] = useState<QuotaView | null>(null);

  const router = useRouter();

  const form = useForm<z.infer<typeof NewTrip>>({
    resolver: zodResolver(NewTrip),
    defaultValues: {
      country: "",
      startDate: null,
    },
  });

  //react-hook-form feature method "watch" which works like use state but updates the state directly from the selected form value
  const selectedCountry = form.watch("country");

  const onSubmit = async (values: z.infer<typeof NewTrip>) => {
    setDisabled(true);
    try {
      const MakeAIResponseInDB = await GenerateAITripIternary(values);

      if (MakeAIResponseInDB?.success === false) {
        if (
          "limitReached" in MakeAIResponseInDB &&
          MakeAIResponseInDB.limitReached
        ) {
          setLimitQuota(MakeAIResponseInDB.quota ?? null);
          setUpgradeOpen(true);
          setDisabled(false);
          return;
        }

        toast.error("Failed to generate AI Iterinary. Please try again.");
        setDisabled(false);
        return;
      }

      if (MakeAIResponseInDB?.success === true) {
        toast.success("Trip Generated successfully!");

        router.push(`/Trip/${MakeAIResponseInDB.aiTrip?.tripId}/Trip-Details`);

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

  const applyImportDraft = (draft: ImportDraft) => {
    if (draft.country) {
      form.setValue("country", draft.country, { shouldValidate: true });
      setSelectedCountry("");
    }

    if (draft.suggestedDuration) {
      form.setValue("duration", draft.suggestedDuration, {
        shouldValidate: true,
      });
    }

    const matchedInterest = draft.suggestedInterests.find((tag) =>
      interests.includes(tag as (typeof interests)[number])
    );

    if (matchedInterest) {
      form.setValue(
        "interests",
        matchedInterest as (typeof interests)[number],
        { shouldValidate: true }
      );
    }

    toast.success("Details filled in — check them and generate your trip.");
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

        <button
          type="button"
          onClick={() => setImportOpen(true)}
          className="mt-4 flex h-[44px] w-fit cursor-pointer items-center gap-2 rounded-full bg-[#256FF1] px-5 text-[15px] font-[500] text-white transition-colors hover:bg-[#1D5AD9]"
        >
          <Wand2 className="size-4" />
          <p>Import from a link, text or photo</p>
        </button>
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
                fieldType={FormFieldType.DATE_PICKER}
                control={form.control}
                name="startDate"
                label="Start date (optional)"
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

              <CountryMap selectedCountry={selectedCountry ?? ""} />

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

      <ImportTripModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onApply={applyImportDraft}
      />

      <UpgradeModal
        open={upgradeOpen}
        onOpenChange={setUpgradeOpen}
        reason="limit"
        quota={limitQuota}
      />
    </section>
  );
};

export default CreateItenaries;
