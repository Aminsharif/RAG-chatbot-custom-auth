"use client";

import { InputHTMLAttributes } from "react";
import clsx from "clsx";

type ToggleProps = InputHTMLAttributes<HTMLInputElement>;

export const Toggle = ({ className, ...props }: ToggleProps) => {
  return (
    <label className="inline-flex items-center">
      <input type="checkbox" className="peer sr-only" {...props} />
      <span
        className={clsx(
          "relative inline-flex h-5 w-9 items-center rounded-full bg-slate-700 transition peer-checked:bg-indigo-600",
          className,
        )}
      >
        <span className="inline-block h-4 w-4 translate-x-0 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
};

