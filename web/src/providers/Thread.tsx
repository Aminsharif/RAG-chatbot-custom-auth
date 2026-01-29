import { validate } from "uuid";

import { Thread } from "@langchain/langgraph-sdk";
import { useQueryState } from "nuqs";
import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { createClient } from "./client";
import { useAuthContext } from "@/providers/Auth";
import { ModelOptions } from "@/app/types";
interface ThreadContextType {
  getThreads: () => Promise<Thread[]>;
  threads: Thread[];
  setThreads: Dispatch<SetStateAction<Thread[]>>;
  threadsLoading: boolean;
  setThreadsLoading: Dispatch<SetStateAction<boolean>>;
  selectedModel: ModelOptions;
  setSelectedModel: Dispatch<SetStateAction<ModelOptions>>;
  deleteThread: (threadId: string) => Promise<boolean>;
  updateThreadMetadata: (threadId:string, userId:string, metadata?: Record<string, any>) => Promise<boolean>;
}

const ThreadContext = createContext<ThreadContextType | undefined>(undefined);

// function getThreadSearchMetadata(
//   assistantId: string,
// ): { graph_id: string } | { assistant_id: string } {
//   if (validate(assistantId)) {
//     return { assistant_id: assistantId };
//   } else {
//     return { graph_id: assistantId };
//   }
// }


function getThreadSearchMetadata(
  assistantId: string,
  user_id: string,
): Record<string, string> {
  const metadata: Record<string, string> = { user_id };
  
  if (validate(assistantId)) {
    metadata.assistant_id = assistantId;
  } else {
    metadata.graph_id = assistantId;
  }
  
  return metadata;
}

export function ThreadProvider({ children }: { children: ReactNode }) {
  // Get environment variables
  const envApiUrl: string | undefined = process.env.NEXT_PUBLIC_API_URL;
  const envAssistantId: string | undefined =
    process.env.NEXT_PUBLIC_ASSISTANT_ID;

  // Use URL params with env var fallbacks
  const [apiUrl] = useQueryState("apiUrl", {
    defaultValue: envApiUrl || "",
  });
  const [assistantId] = useQueryState("assistantId", {
    defaultValue: envAssistantId || "",
  });

  // Determine final values to use, prioritizing URL params then env vars
  const finalApiUrl = apiUrl || envApiUrl;
  const finalAssistantId = assistantId || envAssistantId;
const [selectedModel, setSelectedModel] = useState<ModelOptions>(
    "groq/llama-3.3-70b-versatile",
  );
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(false);
  const { session, isLoading: authLoading, isAuthenticated, } = useAuthContext();

  const getThreads = useCallback(async (): Promise<Thread[]> => {
    if (!finalApiUrl || !finalAssistantId) {
      console.log(
        "[ThreadProvider] getThreads: missing apiUrl or assistantId",
        { finalApiUrl, finalAssistantId },
      );
      return [];
    }
    const jwt = session?.accessToken || undefined;
    console.log(
      "[ThreadProvider] getThreads: apiUrl=",
      finalApiUrl,
      "assistantId=",
      finalAssistantId,
      "jwt=",
      jwt,
    );
    const client = createClient(finalApiUrl, jwt);
    console.log("[ThreadProvider] Created client", client);

    const threads = await client.threads.search({
      metadata: {
        ...getThreadSearchMetadata(finalAssistantId, session?.user?.id || ""),
      },
      limit: 100,
    });
    console.log("[ThreadProvider] threads result", threads);
    return threads;
  }, [finalApiUrl, finalAssistantId, session]);

const updateThreadMetadata = useCallback(async (
  threadId: string,
  userId: string,
  metadata?: Record<string, any>
): Promise<boolean> => {
  try {
    if (!finalApiUrl || !threadId || !userId) {
      console.error("Missing required parameters");
      return false;
    }
    const jwt = session?.accessToken || undefined;
    const client = createClient(finalApiUrl, jwt);
    await client.threads.update(threadId, {
      metadata: {
        user_id: userId,
        assistant_id: finalAssistantId,
        ...metadata,
        updated_at: new Date().toISOString(),
      },
    });
    
    return true;
  } catch (error) {
    console.error("Failed to update thread metadata:", error);
    return false;
  }
}, [finalApiUrl, finalAssistantId]);

const deleteThread = useCallback(async (threadId: string): Promise<boolean> => {
    if (!finalApiUrl || !threadId) return false;
    const jwt = session?.accessToken || undefined;

    try {
      const client = createClient(finalApiUrl,jwt);
      await client.threads.delete(threadId);

      // Update local state immediately - remove the deleted thread
      setThreads(prev => prev.filter(thread => thread.thread_id !== threadId));

      return true;
    } catch (error) {
      console.error('Failed to delete thread:', error);
      return false;
    }
  }, [finalApiUrl]);

  useEffect(() => {
    if (authLoading) {
      console.log("[ThreadProvider] Skipping fetch: authLoading");
      return;
    }
    if (!isAuthenticated) {
      console.log("[ThreadProvider] Skipping fetch: not authenticated");
      return;
    }
    setThreadsLoading(true);
    getThreads()
      .then((result) => {
        setThreads(result);
      })
      .catch((error) => {
        console.error("[ThreadProvider] getThreads error", error);
      })
      .finally(() => {
        setThreadsLoading(false);
      });
  }, [authLoading, isAuthenticated, getThreads]);

  const value = {
    getThreads,
    threads,
    setThreads,
    threadsLoading,
    setThreadsLoading,
    selectedModel,
    setSelectedModel,
    updateThreadMetadata,
    deleteThread,
  };

  return (
    <ThreadContext.Provider value={value}>{children}</ThreadContext.Provider>
  );
}

export function useThreads() {
  const context = useContext(ThreadContext);
  if (context === undefined) {
    throw new Error("useThreads must be used within a ThreadProvider");
  }
  return context;
}
