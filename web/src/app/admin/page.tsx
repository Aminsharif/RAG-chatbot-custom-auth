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

type SubmissionState = {
  fileName: string | null;
  url: string | null;
};

export default function AdminDashboardPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [url, setUrl] = React.useState("");
  const [submitted, setSubmitted] = React.useState<SubmissionState | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    setFile(nextFile);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted({
      fileName: file?.name ?? null,
      url: url.trim() ? url.trim() : null,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Upload a file, provide a URL, or submit both for processing.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ingestion</CardTitle>
          <CardDescription>
            Provide the source content you want to send.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="admin-file">File upload</Label>
              <Input
                id="admin-file"
                type="file"
                onChange={handleFileChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-url">URL</Label>
              <Input
                id="admin-url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
            </div>
            <Button type="submit">Send</Button>
          </form>
          {submitted ? (
            <div className="space-y-1 rounded-md border bg-muted/40 p-4 text-sm">
              <div className="font-medium">Last submission</div>
              <div className="text-muted-foreground">
                File: {submitted.fileName ?? "None"}
              </div>
              <div className="text-muted-foreground">
                URL: {submitted.url ?? "None"}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
