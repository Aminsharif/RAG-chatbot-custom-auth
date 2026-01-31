"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthContext } from "@/providers/Auth";
import { AlertCircle, CheckCircle, Loader2, X } from "lucide-react";

type IngestMode = "file" | "url";

const SUPPORTED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".doc",
  ".txt",
  ".xlsx",
  ".xls",
  ".csv",
  ".pptx",
  ".ppt",
];

export default function AdminDashboardPage() {
  const { user } = useAuthContext();

  const [ingestMode, setIngestMode] = React.useState<IngestMode>("file");
  const [url, setUrl] = React.useState("");

  // ✅ IMPORTANT: File[] instead of FileList
  const [files, setFiles] = React.useState<File[]>([]);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [jobId, setJobId] = React.useState<string | null>(null);
  const [jobStatus, setJobStatus] = React.useState<string | null>(null);
  const [jobError, setJobError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const pollingRef = React.useRef<number | null>(null);

  // ---------------------------
  // URL validation
  // ---------------------------
  const trimmedUrl = url.trim();
  const isValidUrl = (() => {
    if (!trimmedUrl) return false;
    try {
      const parsed = new URL(trimmedUrl);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  })();

  const isFinalStatus =
    jobStatus === "completed" ||
    jobStatus === "failed" ||
    jobStatus === "cancelled";

  const isProcessing = isSubmitting || (!!jobId && !isFinalStatus);

  // ---------------------------
  // Reset on mode change
  // ---------------------------
  React.useEffect(() => {
    setFiles([]);
    setUrl("");
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [ingestMode]);

  // ---------------------------
  // File selection (NO CTRL REQUIRED)
  // ---------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selected = Array.from(e.target.files);

    // validate extensions
    for (const file of selected) {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        setErrorMessage(`Unsupported file type: ${file.name}`);
        return;
      }
    }

    // ✅ append instead of replace
    setFiles((prev) => [...prev, ...selected]);

    // allow re-selecting same file again
    e.target.value = "";
  };

  // ---------------------------
  // Remove single file
  // ---------------------------
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------------------------
  // Job polling
  // ---------------------------
  React.useEffect(() => {
    if (!jobId || isFinalStatus) {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    const poll = async () => {
      try {
        const res = await fetch(
          `http://localhost:2024/api/v1/vector_db/jobs/${jobId}`,
        );
        if (!res.ok) throw new Error("Failed to fetch job status");

        const data = await res.json();
        setJobStatus(data.status);
        setJobError(data.error ?? null);

        if (data.status === "completed") {
          setSuccessMessage("Ingestion completed successfully.");
        }
      } catch (err) {
        setJobStatus("failed");
        setJobError((err as Error).message);
      }
    };

    poll();
    pollingRef.current = window.setInterval(poll, 4000);

    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [jobId, isFinalStatus]);

  // ---------------------------
  // Submit
  // ---------------------------
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!user?.id) {
      setErrorMessage("You must be signed in.");
      return;
    }

    if (isProcessing) return;

    setIsSubmitting(true);
    setJobId(null);
    setJobStatus(null);
    setJobError(null);

    try {
      if (ingestMode === "file") {
        if (files.length === 0) {
          setErrorMessage("Select at least one file.");
          return;
        }

        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        const res = await fetch(
          `http://localhost:2024/api/v1/vector_db/ingest/multiple?user_id=${user.id}`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();

        setJobId(data.job_id);
        setJobStatus("pending");
        setSuccessMessage(data.message || "Files uploaded successfully.");
        setFiles([]);
      }

      if (ingestMode === "url") {
        if (!isValidUrl) {
          setErrorMessage("Enter a valid URL.");
          return;
        }

        const res = await fetch(
          "http://localhost:2024/api/v1/vector_db/ingest",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: trimmedUrl,
              user_id: user.id,
              name: "url-ingestion",
              index_name: "ingestion",
              strategy: "sitemap",
              filter_urls: [],
              allowed_domains: [],
              max_depth: 2,
              chunk_size: 4000,
              chunk_overlap: 200,
              force_update: false,
            }),
          },
        );

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();

        setJobId(data.job_id);
        setJobStatus(data.status);
      }
    } catch (err) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Data Ingestion</h1>

      <Card>
        <CardHeader>
          <CardTitle>Ingestion</CardTitle>
          <CardDescription>
            Upload files or ingest content from a URL.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mode */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={ingestMode === "file"}
                  onChange={() => setIngestMode("file")}
                />
                Upload file
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={ingestMode === "url"}
                  onChange={() => setIngestMode("url")}
                />
                URL
              </label>
            </div>

            {/* File */}
            {ingestMode === "file" && (
              <div className="space-y-2">
                <Label>Files</Label>
                <Input
                  type="file"
                  multiple
                  accept={SUPPORTED_EXTENSIONS.join(",")}
                  onChange={handleFileChange}
                />

                {/* ✅ Selected files with cancel */}
                {files.length > 0 && (
                  <div className="rounded-md border p-3 space-y-2 text-sm">
                    <div className="font-medium">
                      Selected files ({files.length})
                    </div>
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-destructive"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* URL */}
            {ingestMode === "url" && (
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            )}

            <Button
              type="submit"
              disabled={
                isProcessing ||
                (ingestMode === "url" && !isValidUrl)
              }
            >
              {isProcessing ? "Processing..." : "Send"}
            </Button>
          </form>

          {/* Error */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="size-4" />
              {errorMessage}
            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div className="flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700">
              <CheckCircle className="size-4" />
              {successMessage}
            </div>
          )}

          {/* Job status */}
          {jobId && (
            <div className="flex items-center gap-2 text-sm">
              {jobStatus === "failed" ? (
                <AlertCircle className="size-4 text-destructive" />
              ) : jobStatus === "completed" ? (
                <CheckCircle className="size-4 text-green-600" />
              ) : (
                <Loader2 className="size-4 animate-spin" />
              )}
              <span>Status: {jobStatus}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
