"use client";

import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { AlertCircle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { CustomerRequest } from "@/core/schema/validator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/core/components/ui/radio-group";
import { BiSolidPlusCircle } from "react-icons/bi";

interface ParamProps {
  form: UseFormReturn<CustomerRequest>;
}

export default function CustomerFormFields({ form }: ParamProps) {
  const {
    register,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = form;

  const customerType = watch("customerType") || "individual";

  const handleCustomerTypeChange = (value: string) => {
    setValue("customerType", value as any, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Main Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Customer Type *</Label>
          <RadioGroup
            value={customerType}
            onValueChange={handleCustomerTypeChange}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="individual"
                id="individual"
                className="border-2 border-neutral/50 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
              />
              <Label
                htmlFor="individual"
                className="cursor-pointer font-normal"
              >
                Individual
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="business"
                id="business"
                className="border-2 border-neutral/50 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
              />
              <Label htmlFor="business" className="cursor-pointer font-normal">
                Business
              </Label>
            </div>
          </RadioGroup>
          {errors.customerType && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.customerType.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Customer Name *</Label>
          <Input
            id="name"
            {...register("name")}
            className={errors.name ? "border-red-500" : ""}
            disabled={isSubmitting}
            placeholder={
              customerType === "individual"
                ? "e.g., John Doe"
                : "e.g., Acme Inc."
            }
          />
          {errors.name && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.name.message}
            </p>
          )}
        </div>
      </div>

      {/* Optional Contact Details Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="contact-details">
          <AccordionTrigger>
            <div className="flex items-center gap-2 text-base font-medium">
              <BiSolidPlusCircle />
              <span> Add Contact Details</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4 mx-1">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
                disabled={isSubmitting}
                placeholder="e.g., customer@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                {...register("phone")}
                className={errors.phone ? "border-red-500" : ""}
                disabled={isSubmitting}
                placeholder="e.g., +1 (555) 123-4567"
              />
              {errors.phone && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                {...register("address")}
                className={errors.address ? "border-red-500" : ""}
                disabled={isSubmitting}
                placeholder="e.g., 123 Main St, City, Country"
              />
              {errors.address && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.address.message}
                </p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
