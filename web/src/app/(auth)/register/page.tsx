"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { registerSchema } from "@/validation/authSchemas";
import { checkEmailAvailability } from "@/validation/asyncValidators";
import { Button } from "@/components/ui/button_1";
import { InputField } from "@/components/ui/InputField";
import { Card } from "@/components/ui/card_1";
import { api } from "@/lib/httpClient";

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit = async (values: RegisterValues) => {
    await api.post("/auth/register", values);
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8">
      <Card elevation="lg" className="w-full max-w-lg border-indigo-500/30">
        <div className="mb-6 space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-50">
            Create your account
          </h2>
          <p className="text-sm text-slate-400">
            Connect your LangGraph chatbot and start monitoring activity.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <InputField
            label="Full name"
            placeholder="Alex Rivera"
            error={errors.name?.message}
            {...register("name")}
          />
          <InputField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            error={errors.email?.message}
            {...register("email", {
              validate: {
                availability: async (value) => {
                  const available = await checkEmailAvailability(value);
                  return available || "Email is already in use";
                },
              },
            })}
          />
          <InputField
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            error={errors.password?.message}
            {...register("password")}
          />
          <InputField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting}
          >
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
