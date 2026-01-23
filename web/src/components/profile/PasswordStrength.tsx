"use client";

type PasswordStrengthProps = {
  password: string;
};

const getStrength = (value: string) => {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
};

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const score = getStrength(password);
  const percentage = (score / 5) * 100;
  const label =
    score <= 2 ? "Weak" : score === 3 ? "Medium" : score === 4 ? "Strong" : "Very strong";

  return (
    <div className="space-y-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-slate-400">Password strength: {label}</p>
    </div>
  );
};

