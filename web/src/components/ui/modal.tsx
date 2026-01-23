"use client";

import { ReactNode } from "react";
import clsx from "clsx";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  onClose: () => void;
};

export const Modal = ({
  open,
  title,
  description,
  children,
  primaryAction,
  secondaryAction,
  onClose,
}: ModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        aria-hidden
        onClick={onClose}
      />
      <div
        className={clsx(
          "relative z-10 w-full max-w-md rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-xl",
        )}
      >
        <h2 className="text-base font-semibold text-slate-50">{title}</h2>
        {description && (
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        )}
        <div className="mt-4">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          {secondaryAction}
          {primaryAction}
        </div>
      </div>
    </div>
  );
};

