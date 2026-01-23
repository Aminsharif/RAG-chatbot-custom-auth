"use client";

import { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import clsx from "clsx";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
        <div
          className={clsx(
            "flex items-center rounded-md border bg-white px-3 py-2 text-sm ring-indigo-500 transition focus-within:ring-2 dark:border-slate-700 dark:bg-slate-900",
            error
              ? "border-red-500 focus-within:border-red-500"
              : "border-slate-300 focus-within:border-indigo-500",
          )}
        >
          {leftIcon && (
            <span className="mr-2 flex h-4 w-4 items-center justify-center text-slate-400">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={clsx(
              "flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-50",
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <button
              type="button"
              tabIndex={-1}
              className="ml-2 flex h-4 w-4 items-center justify-center text-slate-400"
            >
              {rightIcon}
            </button>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

InputField.displayName = "InputField";

