"use client";

import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { AlertCircle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { VendorRequest } from "@/core/schema/validator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/core/components/ui/accordion";
import { BiSolidPlusCircle } from "react-icons/bi";

interface ParamProps {
  form: UseFormReturn<VendorRequest>;
}

export default function VendorFormFields({ form }: ParamProps) {
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <div className="space-y-6">
      {/* Main Section */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <Input
            id="companyName"
            {...register("companyName")}
            className={errors.companyName ? "border-red-500" : ""}
            disabled={isSubmitting}
            placeholder="e.g., Acme Supplies Inc."
          />
          {errors.companyName && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.companyName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Name</Label>
          <Input
            id="contactName"
            {...register("contactName")}
            className={errors.contactName ? "border-red-500" : ""}
            disabled={isSubmitting}
            placeholder="e.g., John Doe"
          />
          {errors.contactName && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.contactName.message}
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
              <span> Add Additional Details</span>
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
                placeholder="e.g., contact@acmesupplies.com"
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
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                {...register("website")}
                className={errors.website ? "border-red-500" : ""}
                disabled={isSubmitting}
                placeholder="e.g., https://acmesupplies.com"
              />
              {errors.website && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.website.message}
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
                placeholder="e.g., 123 Business St, City, Country"
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
