import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/core/components/ui/card";
import { ProductRequest } from "@/core/schema/validator";
import { UseFormReturn } from "react-hook-form";
import { RiLoader2Fill } from "react-icons/ri";
import AddProductCategories from "./add-categories";
import AddProductDetails from "./add-details";
import AddProductImages from "./add-images";
import { Check, X } from "lucide-react";
import Link from "next/link";

interface ParamProps {
  form: UseFormReturn<ProductRequest>;
  errorResponse: any;
}

export function CreateProductForm({ form, errorResponse }: ParamProps) {
  const {
    formState: { isSubmitting },
  } = form;

  return (
    <Card>
      <CardHeader>
        <div className="card flex items-center justify-between mb-6">
          <CardTitle className="text-xl lg:text-2xl">New Product</CardTitle>

          <div className="hidden lg:flex items-center gap-2">
            <Button type="submit" disabled={isSubmitting} variant="secondary">
              {isSubmitting ? (
                <span className="flex items-center gap-1 text-sm">
                  <RiLoader2Fill className="size-5 animate-spin" />
                  <p>Adding product...</p>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm">
                  <Check className="size-4" />
                  <p>Confirm</p>
                </span>
              )}
            </Button>

            <Button
              type="button"
              disabled={isSubmitting}
              className="min-w-24 px-4 h-10 bg-primary border border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
              variant="secondary"
              asChild
            >
              <Link href="/products">Cancel</Link>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <div className="">
            <AddProductDetails form={form} errorResponse={errorResponse} />
          </div>

          <div className="h-full flex flex-col gap-6 lg:gap-8">
            <AddProductImages form={form} />
            <AddProductCategories form={form} />
          </div>
        </div>
      </CardContent>

      <CardFooter className="block md:hidden">
        <div className="card flex items-center justify-end w-full mt-6 gap-2">
          <Button type="submit" disabled={isSubmitting} variant="secondary">
            {isSubmitting ? (
              <span className="flex items-center gap-1 text-sm">
                <RiLoader2Fill className="size-5 animate-spin" />
                <p>Adding product...</p>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm">
                <Check className="size-4" />
                <p>Confirm</p>
              </span>
            )}
          </Button>

          <Button
            type="button"
            disabled={isSubmitting}
            className="min-w-24 px-4 h-10 bg-primary border border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
            variant="secondary"
            asChild
          >
            <Link href="/products">Cancel</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
