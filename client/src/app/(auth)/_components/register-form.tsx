"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import { LockIcon, MailIcon, User2 } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { RegisterRequest, registerSchema } from "@/core/schema/validator";
import { registerUserAction } from "@/server/actions/auth";
import {
  DisplayErrors,
  parseServerErrors,
} from "@/core/components/elements/error-display";
import { FullPageLoader } from "@/core/components/elements/loader";
import { RiLoader2Fill } from "react-icons/ri";

export default function RegisterForm() {
  const router = useRouter();
  const [errorResponse, setErrorResponse] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit: SubmitHandler<RegisterRequest> = async (data) => {
    setErrorResponse(null);

    const result = await registerUserAction(data);

    if (result.success) {
      router.push("/login");
      reset();
    } else {
      setErrorResponse(result.error?.message || "Registration failed");
    }
  };

  const serverErrors = parseServerErrors(errorResponse);

  if (isSubmitSuccessful) return <FullPageLoader />;

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <DisplayErrors serverErrors={serverErrors} />

      <div className="space-y-1">
        <Label htmlFor="username">Username</Label>
        <Input
          type="text"
          id="username"
          rightIcon={<User2 className="h-4 w-4" />}
          iconPosition="right"
          {...register("username")}
          disabled={isSubmitting}
        />
        {errors.username && (
          <span className="text-destructive text-sm font-medium">
            {errors.username.message}
          </span>
        )}
      </div>

      <div className="space-y-1">
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
          <span className="text-destructive text-sm font-medium">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="space-y-1">
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
          <span className="text-destructive text-sm font-medium">
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
        {isSubmitting && !errorResponse ? (
          <div className="flex items-center gap-2">
            <RiLoader2Fill className="animate-spin size-5" />
            <span>Registering...</span>
          </div>
        ) : (
          "Register"
        )}
      </Button>
    </form>
  );
}
