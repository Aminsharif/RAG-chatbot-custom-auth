"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card_1";
import { Button } from "@/components/ui/button_1";
import { InputField } from "@/components/ui/InputField";
import { Toggle } from "@/components/ui/toggle";
import { Modal } from "@/components/ui/modal";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { PasswordStrength } from "@/components/profile/PasswordStrength";
import { useToast } from "@/components/ui/toastProvider";

export default function SettingsPage() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <AppShell title="Profile, security, and API access">
      <div className="space-y-6">
        <Card elevation="md" className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-50">
            Profile information
          </h2>
          <AvatarUploader value={avatar} onChange={setAvatar} />
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <InputField label="Full name" placeholder="Your name" />
            <InputField label="Email" type="email" placeholder="you@company.com" />
            <InputField label="Phone" placeholder="+1 (555) 555-0123" />
          </div>
          <div className="mt-4">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() =>
                showToast({
                  variant: "success",
                  title: "Profile updated",
                  description: "Your profile information has been saved.",
                })
              }
            >
              Save profile
            </Button>
          </div>
        </Card>

        <Card elevation="md" className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-50">
            Change password
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <InputField
              label="Current password"
              type="password"
              autoComplete="current-password"
            />
            <InputField
              label="New password"
              type="password"
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
            />
            <InputField
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
            />
          </div>
          <PasswordStrength password={password} />
          <div className="mt-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                showToast({
                  variant: "success",
                  title: "Password updated",
                  description: "Your password has been changed.",
                })
              }
            >
              Save password
            </Button>
          </div>
        </Card>

        <Card elevation="md" className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-50">
            Two-factor authentication
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-50">Require 2FA for sign-in</p>
              <p className="text-xs text-slate-400">
                Recommended for admins and production environments.
              </p>
            </div>
            <Toggle
              checked={twoFactorEnabled}
              onChange={(event) => setTwoFactorEnabled(event.target.checked)}
            />
          </div>
        </Card>

        <Card elevation="md" className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-50">
            Active sessions
          </h2>
          <p className="text-xs text-slate-400">
            Connect this table to your session API to view and revoke active
            sessions across devices.
          </p>
        </Card>

        <Card elevation="md" className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-50">
            API keys
          </h2>
          <p className="text-xs text-slate-400">
            Generate long-lived keys for CI pipelines, CLIs, or server-side
            processes that call your LangGraph chatbot.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              showToast({
                variant: "success",
                title: "API key generated",
                description:
                  "Copy your new key from the response when you connect this UI to the backend.",
              })
            }
          >
            Generate API key
          </Button>
        </Card>

        <Card elevation="md" className="space-y-4 border-red-500/40 bg-red-950/30">
          <h2 className="text-sm font-semibold text-red-300">
            Danger zone
          </h2>
          <p className="text-xs text-red-200/90">
            Deleting your account removes your access to this dashboard. This
            action cannot be undone.
          </p>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setDeleteOpen(true)}
          >
            Delete account
          </Button>
        </Card>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account?"
        description="This will revoke access tokens and remove your profile from the LangGraph dashboard."
        secondaryAction={
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setDeleteOpen(false)}
          >
            Cancel
          </Button>
        }
        primaryAction={
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => {
              setDeleteOpen(false);
              showToast({
                variant: "success",
                title: "Account deletion requested",
                description:
                  "Wire this action to your backend to complete account removal.",
              });
            }}
          >
            Confirm delete
          </Button>
        }
      >
        <p className="text-xs text-slate-300">
          This UI is wired for confirmation only. Connect it to an API endpoint
          that removes the user from your identity provider and LangGraph
          workspace.
        </p>
      </Modal>
    </AppShell>
  );
}

