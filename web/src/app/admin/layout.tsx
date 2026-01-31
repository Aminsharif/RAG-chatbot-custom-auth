import Link from "next/link";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r bg-muted/40">
        <div className="flex h-16 items-center px-6 text-lg font-semibold">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Chat 
          </Link>
        </div>
        <nav className="flex flex-col gap-1 px-4 pb-6">
          <Link
            href="/admin"
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/roles"
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Roles
          </Link>
          <Link
            href="/admin/permissions"
            className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
          >
            Permissions
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  );
}
