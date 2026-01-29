import { Button } from "@/components/ui/button";
import { useThreads } from "@/providers/Thread";
import { Thread } from "@langchain/langgraph-sdk";
import { useState, useRef, useEffect, useCallback } from "react";

import { getContentString } from "../utils";
import { useQueryState, parseAsBoolean } from "nuqs";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { useAuthContext } from "@/providers/Auth";
import ProfileCard from "@/components/ProfileCard";
import { groupThreads, prettifyDateLabel } from "./utils";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Trash2 } from "lucide-react";
// function ThreadList({
//   threads,
//   onThreadClick,
// }: {
//   threads: Thread[];
//   onThreadClick?: (threadId: string) => void;
// }) {
//   const [threadId, setThreadId] = useQueryState("threadId");

//   return (
//     <div className="flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
//       {threads.map((t) => {
//         let itemText = t.thread_id;
//         if (
//           typeof t.values === "object" &&
//           t.values &&
//           "messages" in t.values &&
//           Array.isArray(t.values.messages) &&
//           t.values.messages?.length > 0
//         ) {
//           const firstMessage = t.values.messages[0];
//           itemText = getContentString(firstMessage.content);
//         }
//         return (
//           <div
//             key={t.thread_id}
//             className="w-full px-1"
//           >
//             <Button
//               variant="ghost"
//               className="w-[280px] items-start justify-start text-left font-normal"
//               onClick={(e: any) => {
//                 e.preventDefault();
//                 onThreadClick?.(t.thread_id);
//                 if (t.thread_id === threadId) return;
//                 setThreadId(t.thread_id);
//               }}
//             >
//               <p className="truncate text-ellipsis">{itemText}</p>
//             </Button>
//           </div>
//         );
//       })}
//     </div>
//   );
// }
// Group threads by date


function ThreadList({
  threads,
  onThreadClick,
}: {
  threads: Thread[];
  onThreadClick?: (threadId: string) => void;
}) {
  const [threadId, setThreadId] = useQueryState("threadId");
  const groupedThreads = groupThreads(threads);
  const [deletingThreadId, setDeletingThreadId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
  const { deleteThread } = useThreads();

  const handleDeleteClick = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreadToDelete(threadId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (!threadToDelete) return;

    try {
      setDeletingThreadId(threadToDelete);
      const success = await deleteThread(threadToDelete);

      if (success) {
        if (threadToDelete === threadId) {
          setThreadId(null);
        }
        toast.success("Thread deleted successfully");
      } else {
        toast.error("Failed to delete thread");
      }
    } catch (error) {
      console.error("Error deleting thread:", error);
      toast.error("Error deleting thread");
    } finally {
      setDeletingThreadId(null);
      setShowDeleteConfirm(false);
      setThreadToDelete(null);
    }
  }, [threadToDelete, threadId, deleteThread, setThreadId]);

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setThreadToDelete(null);
    setDeletingThreadId(null);
  };

  return (
    <>
      <div className="flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
        {Object.entries(groupedThreads).map(([groupName, conversations]) => {
          if (conversations.length === 0) return null;

          return (
            <div key={groupName} className="w-full">
              {/* Group Label */}
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-1 py-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {prettifyDateLabel(groupName)}
                </span>
              </div>

              {/* Conversations in this group */}
              {conversations.map((t) => {
                let itemText = t.thread_id;
                if (
                  typeof t.values === "object" &&
                  t.values &&
                  "messages" in t.values &&
                  Array.isArray(t.values.messages) &&
                  t.values.messages?.length > 0
                ) {
                  const firstMessage = t.values.messages[0];
                  itemText = getContentString(firstMessage.content);
                }

                const isActive = t.thread_id === threadId;
                const isDeleting = deletingThreadId === t.thread_id;

                return (
                  <div
                    key={t.thread_id}
                    className={`group relative w-full px-1 ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      {/* Thread button */}
                      <Button
                        variant="ghost"
                        className={`w-[240px] items-start justify-start text-left font-normal py-2 px-3 rounded-lg ${
                          isActive ? "bg-blue-50 text-blue-600" : ""
                        } ${isDeleting ? "cursor-not-allowed" : ""}`}
                        onClick={(e: any) => {
                          e.preventDefault();
                          if (isDeleting) return;
                          onThreadClick?.(t.thread_id);
                          if (t.thread_id === threadId) return;
                          setThreadId(t.thread_id);
                        }}
                        disabled={isDeleting}
                      >
                        <p className="truncate text-ellipsis text-sm">
                          {isDeleting ? "Deleting..." : itemText}
                        </p>
                      </Button>

                      {/* Delete icon button */}
                      <button
                        disabled={isDeleting}
                        className={`h-10 w-10 p-0 flex items-center justify-center rounded-lg transition-all ${
                          isActive 
                            ? "text-red-600 hover:bg-red-100" 
                            : "opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-600 hover:bg-gray-200"
                        } ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
                        onClick={(e) => handleDeleteClick(t.thread_id, e)}
                        title="Delete thread"
                        aria-label={`Delete thread ${itemText}`}
                      >
                        {isDeleting ? (
                          <div className="h-4 w-4 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
       open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Thread"
        description="Are you sure you want to delete this thread? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        loading={!!deletingThreadId}
      />
    </>
  );
}
function ThreadHistoryLoading() {
  return (
    <div className="flex h-full w-full flex-col items-start justify-start gap-2 overflow-y-scroll [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent">
      {Array.from({ length: 30 }).map((_, i) => (
        <Skeleton
          key={`skeleton-${i}`}
          className="h-10 w-[280px]"
        />
      ))}
    </div>
  );
}

export default function ThreadHistory({
  onThreadClick,
}: {
  onThreadClick?: (threadId: string) => void;
}) {
  const [chatHistoryOpen, setChatHistoryOpen] = useQueryState(
    "chatHistoryOpen",
    parseAsBoolean.withDefault(false),
  );

  const { getThreads, threads, setThreads, threadsLoading, setThreadsLoading } =
    useThreads();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (authLoading || !isAuthenticated) return;
    setThreadsLoading(true);
    getThreads()
      .then(setThreads)
      .catch(console.error)
      .finally(() => setThreadsLoading(false));
  }, [authLoading, isAuthenticated, getThreads, setThreads, setThreadsLoading]);

  return (
    <div className="flex h-full w-full flex-col items-start justify-start gap-4">
      <div className="flex w-full items-center justify-between px-4 pt-1.5">
        <Button
          className="hover:bg-gray-100"
          variant="ghost"
          onClick={() => setChatHistoryOpen((p) => !p)}
        >
          {chatHistoryOpen ? (
            <PanelRightOpen className="size-5" />
          ) : (
            <PanelRightClose className="size-5" />
          )}
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">Thread History</h1>
      </div>
      <div className="flex w-full flex-1 min-h-0 flex-col px-2">
        {threadsLoading ? (
          <ThreadHistoryLoading />
        ) : (
          <ThreadList threads={threads} onThreadClick={onThreadClick} />
        )}
      </div>
      <div className="mt-auto w-full">
        <ProfileCard />
      </div>
    </div>
  );
}
