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
import { authenticatedFetch } from "@/lib/auth/authService";

type Permission = {
  id: string | number;
  name: string;
  description: string | null;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2024";
const PERMISSIONS_ENDPOINT = `${API_BASE_URL}/api/v1/roles_permissions/permissions/`;

function toList(data: unknown): Array<Record<string, any>> {
  if (Array.isArray(data)) return data as Array<Record<string, any>>;
  if (data && typeof data === "object") {
    const value =
      (data as { data?: unknown }).data ??
      (data as { results?: unknown }).results ??
      (data as { items?: unknown }).items;
    if (Array.isArray(value)) return value as Array<Record<string, any>>;
  }
  return [];
}

export default function PermissionsPage() {
  const [permissions, setPermissions] = React.useState<Permission[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [createName, setCreateName] = React.useState("");
  const [editingPermissionId, setEditingPermissionId] =
    React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  const loadPermissions = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch(PERMISSIONS_ENDPOINT);
      if (!response.ok) {
        throw new Error("Failed to load permissions");
      }
      const data = toList(await response.json());
      setPermissions(
        data.map((permission) => ({
          id: permission.id,
          name: permission.name,
          description: permission.description,
        })),
      );
    } catch (err) {
      setError((err as Error).message ?? "Unable to load permissions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadPermissions();
  }, [loadPermissions]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionMessage(null);
    const name = createName.trim();
    if (!name) return;
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(PERMISSIONS_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error("Failed to create permission");
      }
      setCreateName("");
      await loadPermissions();
      setActionMessage("Permission created");
    } catch (err) {
      setError((err as Error).message ?? "Unable to create permission");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (permission: Permission) => {
    setEditingPermissionId(String(permission.id));
    setEditingName(permission.name);
  };

  const cancelEdit = () => {
    setEditingPermissionId(null);
    setEditingName("");
  };

  const handleUpdate = async (permissionId: string) => {
    setActionMessage(null);
    const name = editingName.trim();
    if (!name) return;
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(
        `${PERMISSIONS_ENDPOINT}${permissionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to update permission");
      }
      await loadPermissions();
      setEditingPermissionId(null);
      setEditingName("");
      setActionMessage("Permission updated");
    } catch (err) {
      setError((err as Error).message ?? "Unable to update permission");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (permissionId: string) => {
    setActionMessage(null);
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(
        `${PERMISSIONS_ENDPOINT}${permissionId}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        throw new Error("Failed to delete permission");
      }
      await loadPermissions();
      setActionMessage("Permission deleted");
    } catch (err) {
      setError((err as Error).message ?? "Unable to delete permission");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Permissions</h1>
        <p className="text-muted-foreground">
          Define granular permissions and map them to roles.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create permission</CardTitle>
          <CardDescription>Provide a permission name to add it.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
            onSubmit={handleCreate}
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="permission-name">Permission name</Label>
              <Input
                id="permission-name"
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                placeholder="manage_users"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permission library</CardTitle>
          <CardDescription>
            Edit or remove permissions as your access model grows.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && permissions.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Loading permissions...
            </div>
          ) : null}
          {!isLoading && permissions.length === 0 ? (
            <div className="rounded-md border p-6 text-sm text-muted-foreground">
              No permissions yet. Create your first permission to continue.
            </div>
          ) : null}
          {permissions.map((permission) => {
            const permissionId = String(permission.id);
            const isEditing = editingPermissionId === permissionId;
            return (
              <div
                key={permissionId}
                className="flex flex-wrap items-center justify-between gap-4 rounded-md border p-4"
              >
                <div className="space-y-1">
                  {isEditing ? (
                    <Input
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                    />
                  ) : (
                    <div className="font-medium">{permission.name}</div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Description: {permission.description || "No description"}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={() => handleUpdate(permissionId)}
                        disabled={isLoading}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => startEdit(permission)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(permissionId)}
                        disabled={isLoading}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {actionMessage ? (
            <div className="text-sm text-muted-foreground">{actionMessage}</div>
          ) : null}
          {error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
