"use client";

import { InputHTMLAttributes } from "react";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export const Checkbox = ({ label, ...props }: CheckboxProps) => {
  return (
    <label className="inline-flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-200">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
};

