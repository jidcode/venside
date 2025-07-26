import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { Label } from "@/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import { AlertCircle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { WarehouseRequest } from "@/core/schema/validator";

interface FormFieldsProps {
  form: UseFormReturn<WarehouseRequest>;
}

export default function WarehouseFormFields({ form }: FormFieldsProps) {
  const {
    register,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = form;

  const storageType = watch("storageType");

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Warehouse Name *</Label>
        <Input
          id="name"
          {...register("name")}
          className={errors.name ? "border-red-500" : ""}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="mt-6 space-y-2">
        <Label htmlFor="location">Location</Label>
        <Textarea
          id="location"
          {...register("location")}
          className={errors.location ? "border-red-500" : ""}
          disabled={isSubmitting}
        />
        {errors.location && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.location.message}
          </p>
        )}
      </div>

      <div className="mt-6 space-y-2">
        <div className="space-y-2">
          <Label htmlFor="capacity">Storage Capacity *</Label>

          <div className="flex items-center">
            <div>
              <Input
                id="capacity"
                type="number"
                min="0"
                {...register("capacity", { valueAsNumber: true })}
                className={
                  errors.capacity
                    ? "border-red-500 rounded-r-none focus:ring-0 focus:shadow-xs focus:border-focus"
                    : "w-full rounded-r-none focus:ring-0 focus:shadow-xs focus:border-focus"
                }
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Select
                value={storageType || "units"}
                onValueChange={(value) => setValue("storageType", value as any)}
                disabled={isSubmitting}
              >
                <SelectTrigger
                  className={
                    errors.storageType
                      ? "border-red-500"
                      : "text-base min-w-20 rounded-l-none border-l-0 bg-muted focus:ring-0"
                  }
                >
                  <SelectValue placeholder="Select storage type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="units">Units</SelectItem>
                  <SelectItem value="slots">Slots</SelectItem>
                  <SelectItem value="boxes">Boxes</SelectItem>
                  <SelectItem value="shelves">Shelves</SelectItem>
                  <SelectItem value="racks">Racks</SelectItem>
                  <SelectItem value="pallets">Pallets</SelectItem>
                  <SelectItem value="sections">Sections</SelectItem>
                  <SelectItem value="containers">Containers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {errors.capacity && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.capacity.message}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <Label htmlFor="manager">Warehouse Manager</Label>
        <Input
          id="manager"
          {...register("manager")}
          className={errors.manager ? "border-red-500" : ""}
          disabled={isSubmitting}
        />
        {errors.manager && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.manager.message}
          </p>
        )}
      </div>

      <div className="mt-6 space-y-2">
        <Label htmlFor="contact">Phone Contact</Label>
        <Input
          id="contact"
          type="tel"
          {...register("contact")}
          className={errors.contact ? "border-red-500" : ""}
          disabled={isSubmitting}
          placeholder="e.g., +1 (555) 123-4567"
        />
        {errors.contact && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.contact.message}
          </p>
        )}
      </div>
    </>
  );
}
