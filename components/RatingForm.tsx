import { z } from "zod";
import { DemoStars, FormFieldType } from "@/constants";
import CustomFormForTrip from "@/FormsRelatedConfig/CustomFormForTripGeneration/CustomFormForTrip";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { SelectItem } from "./ui/select";
import { Form } from "./ui/form";
import { Button } from "./ui/button";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { setTripRating } from "@/actions/Trip";
export const RatingSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
});

interface RatingFormProps {
  tripId: string;
  userId: string;
}

const RatingForm = ({ tripId, userId,}: RatingFormProps) => {
  const [disabled, setDisabled] = useState(false);

  const form = useForm<z.infer<typeof RatingSchema>>({
    resolver: zodResolver(RatingSchema),
  });



  async function handleSubmit(values: z.infer<typeof RatingSchema>) {
    try {
      setDisabled(true);

      if (!userId) {
        return toast.error("Login To Rate a Trip");
      }

      const TheRating = await setTripRating(tripId, values.rating, userId);

      if (TheRating?.success) {
        return toast.success("Trip Rated Successfully");
      }
    } catch (error) {
      toast.error("something went wrong");
      console.log(error);
    }
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <p className="text-[14px] text-[#7F7E83] font-[400]">
          Select and click Rate
        </p>
        <div className="flex items-center gap-2 rounded-[10px]">
          <CustomFormForTrip
            fieldType={FormFieldType.SELECT}
            control={form.control}
            name="rating"
            placeholder="Select Rating 1-5"
          >
            {DemoStars.map((item, index) => (
              <SelectItem
                key={index}
                value={item.number}
                className={`flex items-center gap-3 cursor-pointer pt-[9px] pb-[9px] pr-[10px] pl-[10px] rounded-[6px] w-[652px] h-[38px]`}
              >
                <div className="flex items-center gap-2">
                  {DemoStars.slice(0, item.id).map((item) => (
                    <Image
                      key={item.id}
                      src={item.name}
                      alt="star"
                      width={18}
                      height={18}
                    />
                  ))}
                </div>
              </SelectItem>
            ))}
          </CustomFormForTrip>

          <Button
            disabled={disabled}
            type="submit"
            className="bg-blue-400 text-white p-2 mt-2 cursor-pointer"
          >
            Rate
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RatingForm;
