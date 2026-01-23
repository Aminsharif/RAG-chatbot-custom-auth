"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/routing/ProtectedRoute";
import { UserInfoSignOut } from "@/features/user-auth-status";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

type AppShellProps = {
  title: string;
  children: ReactNode;
};
export const AppShell = () => {
  return (
    <ProtectedRoute>
      <div className="border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link
          href="/"
          className="mr-6 flex items-center"
        >
          <span className="text-xl font-bold">
            Agent with Auth
          </span>
        </Link>
  
        <div className="ml-auto flex items-center space-x-4">
          <div className="hidden items-center space-x-3 md:flex">
            <UserInfoSignOut />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4">
                <div className="mb-4">
                 
                </div>
                <Link
                  href="/"
                  className="text-lg font-medium"
                >
                  Chat
                </Link>
                {/* <Link
                  href="/pricing"
                  className="text-lg font-medium"
                >
                  Pricing
                </Link> */}

                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    asChild
                  >
                    <Link href="/signin">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign up</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
};
