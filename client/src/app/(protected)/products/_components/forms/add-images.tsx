"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/core/components/ui/button";
import { X, Plus, Upload, Image } from "lucide-react";
import { Label } from "@/core/components/ui/label";
import { cn } from "@/core/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { ProductRequest } from "@/core/schema/validator";

interface ParamProps {
  form: UseFormReturn<ProductRequest>;
}

type ProductImageItem = File | { url: string };

export default function AddProductImages({ form }: ParamProps) {
  const [error, setError] = useState<string | null>(null);
  const maxFiles = 5;
  const images: ProductImageItem[] = form.watch("images") || [];

  const setImages = (newImages: ProductImageItem[]) => {
    form.setValue("images", newImages, { shouldValidate: true });
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);

      const validFiles = acceptedFiles.filter((file) => {
        const isImage = file.type.startsWith("image/");
        const isSizeValid = file.size <= 1 * 1024 * 1024;
        return isImage && isSizeValid;
      });

      if (validFiles.length !== acceptedFiles.length) {
        const invalidFiles = acceptedFiles.filter(
          (file) => !file.type.startsWith("image/")
        );
        const oversizedFiles = acceptedFiles.filter(
          (file) => file.size > 1 * 1024 * 1024
        );

        let errorMessage = "";
        if (invalidFiles.length > 0) {
          errorMessage += "Only image files are allowed. ";
        }
        if (oversizedFiles.length > 0) {
          errorMessage += `File too large. Maximum file size is 1MB`;
        }
        setError(errorMessage.trim());
      }

      if (images.length + validFiles.length > maxFiles) {
        setError(`You can only upload up to ${maxFiles} images`);
        return;
      }

      const newImages: ProductImageItem[] = [...images, ...validFiles];
      setImages(newImages);
    },
    [images, maxFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: maxFiles - images.length,
    disabled: images.length >= maxFiles,
  });

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const getImageSrc = (image: ProductImageItem): string => {
    if (image instanceof File) {
      return URL.createObjectURL(image);
    } else {
      return image.url;
    }
  };

  return (
    <section className="card">
      <div className="text-lg font-medium text-focus flex items-center gap-1 mb-4">
        <Image className="h-5 w-5" /> Images
      </div>
      <div>
        {error && (
          <div className="text-red-600 bg-red-50 p-2 text-center text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <Label>Add Images</Label>

          <p className="text-sm text-neutral font-medium">
            {images.length}/{maxFiles} images selected
          </p>
        </div>

        {images.length === 0 ? (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-neutral/40 hover:border-sky-400"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              {isDragActive ? (
                <p className="text-sm text-neutral/50">Drop images here...</p>
              ) : (
                <div className="text-sm text-neutral">
                  <p>Drag & drop images here, or click to upload files</p>
                  <p className="text-xs font-medium mt-1"></p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-2">
            <div
              {...getRootProps()}
              className={cn(
                "aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-neutral/40 hover:border-sky-400",
                images.length >= maxFiles && "opacity-50 cursor-not-allowed"
              )}
            >
              <input {...getInputProps()} />
              <Plus className="h-6 w-6 text-gray-400" />
            </div>

            {images.map((image, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={getImageSrc(image)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-sm border border-gray-200"
                />
                <Button
                  variant="destructive"
                  type="button"
                  size="icon"
                  className="absolute top-1.5 right-1.5 h-6 w-6"
                  onClick={() => removeImage(index)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
