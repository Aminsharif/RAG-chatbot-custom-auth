import { ReactNode } from "react";
import clsx from "clsx";

type Elevation = "sm" | "md" | "lg";

type CardProps = {
  children: ReactNode;
  elevation?: Elevation;
  className?: string;
};

const elevationStyles: Record<Elevation, string> = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

export const Card = ({ children, elevation = "md", className }: CardProps) => {
  return (
    <div
      className={clsx(
        "rounded-xl border border-slate-200 bg-white/80 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80",
        elevationStyles[elevation],
        className,
      )}
    >
      {children}
    </div>
  );
};

