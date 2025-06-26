import { Control } from "react-hook-form";

import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { E164Number } from "libphonenumber-js/core";

import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

import { FormFieldType } from "@/constants";
import { FaCalendarAlt } from "react-icons/fa";
import { JSX } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface CustomProps {
  control: Control<any>;
  fieldType: FormFieldType;
  name: string;
  label?: string;
  placeholder?: string;
  iconSrc?: JSX.Element;
  onChange?: (value: string | undefined) => void;
  iconAlt?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  dateFormat?: string;
  showTimeSelect?: boolean;
  children?: React.ReactNode;
  renderSkeleton?: (field: any) => React.ReactNode;
}

const RenderField = ({
  field,
  props,
  className,
}: {
  field: any;
  props: CustomProps;
  className?: string;
}) => {
  switch (props.fieldType) {
    case FormFieldType.NUMBER:
      return (
        <div className="flex rounded-md border items-center border-dark-500">
          {props.iconSrc && (
            <span className="ml-2 text-[23px]">{props.iconSrc}</span>
          )}

          <FormControl>
            <Input
              placeholder={props.placeholder}
              {...field}
              type="number"
              className="shad-input border-0"
            />
          </FormControl>
        </div>
      );

    case FormFieldType.INPUT:
      return (
        <div className="!p-1 rounded-full !bg-gradient-to-r bg-[#256FF1]">
          <div className="flex !p-1 rounded-full !outline-none !border-none items-center gap-2 bg-[#22282f]">
            {props.iconSrc && (
              <span className="!ml-2 text-[23px]">{props.iconSrc}</span>
            )}

            <FormControl>
              <Input
                placeholder={props.placeholder}
                {...field}
                className={
                  className
                    ? className
                    : "!border-none !rounded-lg bg-[#22282f] text-white !p-1 !outline-none  focus:!ring-transparent"
                }
              />
            </FormControl>
          </div>
        </div>
      );

    case FormFieldType.TEXTAREA:
      return (
        <div className="!p-1 rounded-xl !bg-gradient-to-r from-[#ff8000] to-[#e52d27]">
          <div className="flex !p-1 shadow-2xl rounded-lg !outline-none !border-none  items-center gap-2 bg-background">
            <FormControl>
              <Textarea
                placeholder={props.placeholder}
                {...field}
                className="!border-none !rounded-lg !p-1 !outline-none  focus:!ring-transparent"
                disabled={props.disabled}
              />
            </FormControl>
          </div>
        </div>
      );

    case FormFieldType.PHONE_INPUT:
      return (
        <FormControl>
          <div className="!p-1 rounded-full !bg-gradient-to-r bg-[#256FF1]">
            <div className="!p-1 rounded-full !outline-none !border-none bg-[#22282f]">
              <PhoneInput
                defaultCountry="US"
                placeholder={props.placeholder}
                {...field}
                international
                withCountryCallingCode
                value={(field.value as E164Number) || undefined}
                className="text-[#7F7E83] ml-[7px] !p-1 !rounded-xl"
                onChange={field.onChange}
              />
            </div>
          </div>
        </FormControl>
      );

    case FormFieldType.DATE_PICKER:
      return (
        <div className="flex rounded-md border items-center border-dark-500 bg-dark-400">
          <FaCalendarAlt className="ml-2 text-[23px]" />
          <FormControl>
            <DatePicker
              selected={field.value}
              onChange={(date) => field.onChange(date)}
              dateFormat={props.dateFormat ?? "MM/dd/yyyy"}
              showTimeSelect={props.showTimeSelect ?? false}
              timeInputLabel="Time:"
              wrapperClassName="date-picker"
            />
          </FormControl>
        </div>
      );

    case FormFieldType.SELECT:
      return (
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger className="shad-select-trigger">
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent className="shad-select-content">
            {props.children}
          </SelectContent>
        </Select>
      );

    case FormFieldType.CHECKBOX:
      return (
        <div className="flex !p-1 items-center gap-4">
          <Checkbox
            id={props.name}
            checked={field.value}
            onCheckedChange={field.onChange}
            className="!bg-white !rounded-sm h-5 w-5"
          />
          <label htmlFor={props.name} className="!p-1 text-white">
            {props.label}
          </label>
        </div>
      );

    case FormFieldType.SKELETON:
      return props.renderSkeleton ? props.renderSkeleton(field) : null;

    case FormFieldType.PASSWORD:
      return (
        <div className="!p-1 rounded-full !bg-gradient-to-r bg-[#256FF1]">
          <div className="flex !p-1 rounded-full !outline-none !border-none items-center gap-2 bg-[#22282f]">
            {props.iconSrc && (
              <span className="!ml-2 text-[23px]">{props.iconSrc}</span>
            )}

            <FormControl>
              <Input
                type="password"
                placeholder={props.placeholder}
                {...field}
                className="!border-none !rounded-lg text-white bg-[#22282f] !p-1 !outline-none  focus:!ring-transparent"
              />
            </FormControl>
          </div>
        </div>
      );
    default:
      return null;
  }
};

const CustomForm = (props: CustomProps) => {
  const { control, name, label, className } = props;
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1 !mt-2">
          {props.fieldType !== FormFieldType.CHECKBOX && label && (
            <FormLabel className="text-[#7F7E83]">{label}</FormLabel>
          )}

          <RenderField field={field} props={props} className={className} />

          <FormMessage className="shad-error" />
        </FormItem>
      )}
    />
  );
};

export default CustomForm;
