import { useState } from "react";
import { Layers2, Plus, Tag, X } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ProductRequest } from "@/core/schema/validator";
import { RiExpandUpDownLine } from "react-icons/ri";
import { getAllCategories } from "@/core/services/products";
import { TbTagsFilled } from "react-icons/tb";
import { Label } from "@/core/components/ui/label";
import { Checkbox } from "@/core/components/ui/checkbox";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Badge } from "@/core/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { cn } from "@/core/lib/utils";

interface ParamProps {
  form: UseFormReturn<ProductRequest>;
}

export default function AddProductCategories({ form }: ParamProps) {
  const { data: categories, isLoading, error } = getAllCategories();
  const [newCategory, setNewCategory] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { watch, setValue } = form;
  const selectedCategories = watch("categories") || [];

  const toggleCategory = (categoryName: string) => {
    const updatedCategories = selectedCategories.includes(categoryName)
      ? selectedCategories.filter((cat) => cat !== categoryName)
      : [...selectedCategories, categoryName];
    setValue("categories", updatedCategories, { shouldValidate: true });
  };

  const addNewCategory = () => {
    const categoryName = newCategory.trim();
    if (categoryName && !selectedCategories.includes(categoryName)) {
      const updatedCategories = [...selectedCategories, categoryName];
      setValue("categories", updatedCategories, { shouldValidate: true });
      setNewCategory("");
    }
  };

  return (
    <section className="card">
      <div className="text-lg font-medium text-focus flex items-center gap-1 mb-4">
        <Layers2 className="h-5 w-5" /> Categories
      </div>

      <div>
        <div className="mb-4">
          <Label className="text-neutral">Add Categories</Label>
          {selectedCategories.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedCategories.map((categoryName, index) => (
                <Badge
                  key={`${categoryName}-${index}`}
                  variant="outline"
                  className="flex items-center gap-1 px-3 py-1 text-sm cursor-pointer rounded-full hover:border-destructive hover:text-destructive"
                  onClick={() => toggleCategory(categoryName)}
                >
                  {categoryName}
                  <X className="h-5 w-5" />
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral/60 mt-1">
              No categories added or selected
            </p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className={cn(
              categories?.length === 0
                ? "hidden"
                : "bg-muted rounded-sm text-secondary font-normal border border-neutral/20"
            )}
          >
            <div className="inline-flex items-center justify-between gap-4 w-full tracking-wide border-neutral">
              <span className="flex items-center gap-4">
                <TbTagsFilled className="size-5" />
                <p>Select categories to add</p>
              </span>
              <RiExpandUpDownLine className="size-5" />
            </div>
          </Button>

          <div className="flex items-center gap-2">
            <Input
              className="border-neutral/80"
              placeholder="Add new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addNewCategory())
              }
            />

            <Button
              className="rounded-sm h-10 w-10"
              variant="secondary"
              size="icon"
              type="button"
              onClick={addNewCategory}
              disabled={!newCategory.trim()}
            >
              <Plus className="size-6" />
            </Button>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-primary">
            <DialogHeader>
              <DialogTitle>Select Categories</DialogTitle>
            </DialogHeader>
            <div
              className={cn(
                "grid gap-4 py-4",
                (categories?.length ?? 0) > 10 ? "grid-cols-3" : "grid-cols-2"
              )}
            >
              {(categories ?? []).map((category) => (
                <div
                  key={category.id}
                  className="flex items-center space-x-2"
                  onClick={() => toggleCategory(category.name)}
                >
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.name)}
                    onCheckedChange={() => toggleCategory(category.name)}
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
            <Button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="mt-4"
            >
              Continue
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
