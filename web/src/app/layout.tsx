// import type { Metadata } from "next";
// import "./globals.css";
// import { Inter } from "next/font/google";
// import React from "react";
// import { NuqsAdapter } from "nuqs/adapters/next/app";
// import { AuthProvider } from "@/providers/Auth";
// const inter = Inter({
//   subsets: ["latin"],
//   preload: true,
//   display: "swap",
// });

// export const metadata: Metadata = {
//   title: "Agent Chat",
//   description: "Agent Chat UX by LangChain",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <NuqsAdapter>
//           <AuthProvider>{children}</AuthProvider>
//         </NuqsAdapter>
//       </body>
//     </html>
//   );
// }
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/providers/Auth";;
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Thread } from "@/components/thread";
import { StreamProvider } from "@/providers/Stream";
import { ThreadProvider } from "@/providers/Thread";
import { ArtifactProvider } from "@/components/thread/artifact";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/layout/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LangGraph Auth Dashboard",
  description: "Authentication dashboard for LangGraph chatbot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
         <NuqsAdapter>
          <AuthProvider>
            <AppShell/>
            <ThreadProvider>
            <StreamProvider>
              <ArtifactProvider>
                <Thread/>
              </ArtifactProvider>
            </StreamProvider>
          </ThreadProvider>
          </AuthProvider>
         </NuqsAdapter>
      </body>
    </html>
  );
}

