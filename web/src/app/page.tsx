"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ThreadProvider } from "@/providers/Thread";
import { StreamProvider } from "@/providers/Stream";
import { ArtifactProvider } from "@/components/thread/artifact";
import { Thread } from "@/components/thread";

export default function Home() {
  return (
    <>
    <AppShell/>
      <ThreadProvider>
        <ArtifactProvider>
          <StreamProvider>
            <Thread />
          </StreamProvider>
        </ArtifactProvider>
      </ThreadProvider>
    </>
  );
}
