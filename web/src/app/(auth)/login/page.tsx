"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginSchema } from "@/validation/authSchemas";
import { useAuth } from "@/providers/Auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/config/routes";
import { Button } from "@/components/ui/button_1"
import { InputField } from "@/components/ui/InputField";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card_1";

type LoginValues = z.infer<typeof loginSchema>;

const demoCredentials = {
  email: "bob@gmail.com",
  password: "123456",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, status } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isLoading) return;
    if (status === "authenticated") {
      const next = searchParams.get("next") || DEFAULT_LOGIN_REDIRECT;
      router.replace(next);
    }
  }, [isLoading, status, searchParams, router]);

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    try {
      await login(values);
      const next = searchParams.get("next") || DEFAULT_LOGIN_REDIRECT;
      router.replace(next);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Unable to sign in. Please try again.";
      setError(message);
    }
  };

  const handleDemoCredentials = () => {
    setValue("email", demoCredentials.email);
    setValue("password", demoCredentials.password);
  };

  const isBusy = isSubmitting || isLoading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 px-4 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 lg:flex-row">
        <div className="flex-1 space-y-4 text-center lg:text-left">
          <p className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-indigo-200 ring-1 ring-indigo-500/40">
            LangGraph Chatbot Dashboard
          </p>
          <h1 className="bg-gradient-to-r from-indigo-200 via-white to-indigo-300 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
            Secure access to your conversational analytics.
          </h1>
          <p className="max-w-xl text-sm text-indigo-100/80 sm:text-base">
            Monitor sessions, manage API keys, and control access for your
            LangGraph-powered chatbot in a single, secure dashboard.
          </p>
        </div>

        <Card elevation="lg" className="w-full max-w-md border-indigo-500/30">
          <div className="mb-6 space-y-2 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Sign in to your account
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Use your work email to access the LangGraph dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <InputField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              error={errors.password?.message}
              rightIcon={
                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              }
              {...register("password")}
            />

            <div className="flex items-center justify-between">
              <Checkbox label="Remember me" {...register("remember")} />
              <button
                type="button"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <div className="rounded-md border border-red-500/40 bg-red-500/5 px-3 py-2 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isBusy}
            >
              Continue
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="md"
              fullWidth
              onClick={handleDemoCredentials}
              disabled={isBusy}
            >
              Use demo credentials
            </Button>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Or continue with
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isBusy}
                >
                  Google
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isBusy}
                >
                  GitHub
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isBusy}
                >
                  SSO
                </Button>
              </div>
            </div>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Do not have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-500 hover:text-indigo-400"
            >
              Create one
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
