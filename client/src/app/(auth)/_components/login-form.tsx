"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { LockIcon, MailIcon } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { LoginRequest, loginSchema } from "@/core/schema/validator";
import { useAuthStore } from "@/core/stores/auth-store";
import { Label } from "@/core/components/ui/label";
import { loginUserAction } from "@/server/actions/auth";
import useInventoryStore from "@/core/stores/inventory-store";
import { AuthResponse } from "@/core/schema/types";
import {
  DisplayErrors,
  parseServerErrors,
} from "@/core/components/elements/error-display";
import { RiLoader2Fill } from "react-icons/ri";
import { FullPageLoader } from "@/core/components/elements/loader";

export default function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const setInventory = useInventoryStore((state) => state.setInventory);
  const [errorResponse, setErrorResponse] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginRequest> = async (formData) => {
    setErrorResponse(null);

    try {
      const response = await loginUserAction(formData);

      if (response.success) {
        const data: AuthResponse = response.data;

        // Set user data in store
        setUser({
          id: data.userId,
          username: data.username,
          email: data.email,
          role: data.role,
          avatar: data.avatar,
          inventories: data.inventories,
        });

        // Set current inventory if available
        if (data.inventories && data.inventories.length > 0) {
          setInventory(data.inventories[0]);
        }

        router.push("/dashboard");
      } else if (response.error) {
        setErrorResponse(response.error.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorResponse(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    }
  };

  const serverErrors = parseServerErrors(errorResponse);

  if (isSubmitSuccessful) return <FullPageLoader />;

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <DisplayErrors serverErrors={serverErrors} />

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          rightIcon={<MailIcon className="h-4 w-4" />}
          iconPosition="right"
          {...register("email")}
          disabled={isSubmitting}
        />
        {errors.email && (
          <span className="text-red-500 text-sm">{errors.email.message}</span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          id="password"
          rightIcon={<LockIcon className="h-4 w-4" />}
          iconPosition="right"
          {...register("password")}
          disabled={isSubmitting}
        />
        {errors.password && (
          <span className="text-red-500 text-sm">
            {errors.password.message}
          </span>
        )}
      </div>

      <Button
        variant="secondary"
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <RiLoader2Fill className="animate-spin size-5" />
            <span>Signing in...</span>
          </div>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
