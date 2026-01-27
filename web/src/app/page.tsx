// "use client";

// import { AppShell } from "@/components/layout/AppShell";
// import { ThreadProvider } from "@/providers/Thread";
// import { StreamProvider } from "@/providers/Stream";
// import { ArtifactProvider } from "@/components/thread/artifact";
// import { Thread } from "@/components/thread";

// export default function Home() {
//   return (
//     <>
//     <AppShell/>
//       <ThreadProvider>
//         <ArtifactProvider>
//           <StreamProvider>
//             <Thread />
//           </StreamProvider>
//         </ArtifactProvider>
//       </ThreadProvider>
//     </>
//   );
// }

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "@/config/routes";

export default async function Home() {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get("access_token")?.value);
  console.log(hasSession,'...................*********************')
  if (hasSession) {
    redirect(DEFAULT_LOGIN_REDIRECT);
  }

  redirect("/login");

}

