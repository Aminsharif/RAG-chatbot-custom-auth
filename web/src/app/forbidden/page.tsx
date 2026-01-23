export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">
          403
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-50">
          You do not have access to this area
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          Your account is missing the required role for this section of the
          dashboard. Contact an administrator if you believe this is an error.
        </p>
      </div>
    </div>
  );
}

