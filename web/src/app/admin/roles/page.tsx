"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authenticatedFetch } from "@/lib/auth/authService";

type Role = {
  id: string | number;
  name: string;
};

type Permission = {
  id: string | number;
  name: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2024";
const ROLES_ENDPOINT = `${API_BASE_URL}/api/v1/roles_permissions/roles/`;
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

export default function RolesPage() {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [permissions, setPermissions] = React.useState<Permission[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [createName, setCreateName] = React.useState("");
  const [editingRoleId, setEditingRoleId] = React.useState<string | null>(null);
  const [editingName, setEditingName] = React.useState("");
  const [selectedRoleId, setSelectedRoleId] = React.useState("");
  const [selectedPermissionId, setSelectedPermissionId] = React.useState("");
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        authenticatedFetch(ROLES_ENDPOINT),
        authenticatedFetch(PERMISSIONS_ENDPOINT),
      ]);

      if (!rolesResponse.ok) {
        throw new Error("Failed to load roles");
      }
      if (!permissionsResponse.ok) {
        throw new Error("Failed to load permissions");
      }

      const rolesData = toList(await rolesResponse.json());
      const permissionsData = toList(await permissionsResponse.json());

      setRoles(
        rolesData.map((role) => ({
          id: role.id,
          name: role.name,
        })),
      );
      setPermissions(
        permissionsData.map((permission) => ({
          id: permission.id,
          name: permission.name,
        })),
      );
    } catch (err) {
      setError((err as Error).message ?? "Unable to load roles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionMessage(null);
    const name = createName.trim();
    if (!name) return;
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(ROLES_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error("Failed to create role");
      }
      setCreateName("");
      await loadData();
      setActionMessage("Role created");
    } catch (err) {
      setError((err as Error).message ?? "Unable to create role");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (role: Role) => {
    setEditingRoleId(String(role.id));
    setEditingName(role.name);
  };

  const cancelEdit = () => {
    setEditingRoleId(null);
    setEditingName("");
  };

  const handleUpdate = async (roleId: string) => {
    setActionMessage(null);
    const name = editingName.trim();
    if (!name) return;
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(`${ROLES_ENDPOINT}${roleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error("Failed to update role");
      }
      await loadData();
      setEditingRoleId(null);
      setEditingName("");
      setActionMessage("Role updated");
    } catch (err) {
      setError((err as Error).message ?? "Unable to update role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (roleId: string) => {
    setActionMessage(null);
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(`${ROLES_ENDPOINT}${roleId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete role");
      }
      await loadData();
      setActionMessage("Role deleted");
    } catch (err) {
      setError((err as Error).message ?? "Unable to delete role");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    setActionMessage(null);
    if (!selectedRoleId || !selectedPermissionId) return;
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(
        `${ROLES_ENDPOINT}${selectedRoleId}/permissions/${selectedPermissionId}`,
        { method: "POST" },
      );
      if (!response.ok) {
        throw new Error("Failed to assign permission");
      }
      setActionMessage("Permission assigned to role");
    } catch (err) {
      setError((err as Error).message ?? "Unable to assign permission");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setActionMessage(null);
    if (!selectedRoleId || !selectedPermissionId) return;
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(
        `${ROLES_ENDPOINT}${selectedRoleId}/permissions/${selectedPermissionId}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        throw new Error("Failed to remove permission");
      }
      setActionMessage("Permission removed from role");
    } catch (err) {
      setError((err as Error).message ?? "Unable to remove permission");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Roles</h1>
        <p className="text-muted-foreground">
          Create roles and assign permissions with the admin API.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create role</CardTitle>
          <CardDescription>Provide a role name to add it.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4 sm:flex-row sm:items-end"
            onSubmit={handleCreate}
          >
            <div className="flex-1 space-y-2">
              <Label htmlFor="role-name">Role name</Label>
              <Input
                id="role-name"
                value={createName}
                onChange={(event) => setCreateName(event.target.value)}
                placeholder="admin"
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
          <CardTitle>Assign permissions</CardTitle>
          <CardDescription>
            Attach or remove a permission for a role.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={selectedRoleId}
                onValueChange={setSelectedRoleId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={String(role.id)} value={String(role.id)}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Permission</Label>
              <Select
                value={selectedPermissionId}
                onValueChange={setSelectedPermissionId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select permission" />
                </SelectTrigger>
                <SelectContent>
                  {permissions.map((permission) => (
                    <SelectItem
                      key={String(permission.id)}
                      value={String(permission.id)}
                    >
                      {permission.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              onClick={handleAssign}
              disabled={isLoading || !selectedRoleId || !selectedPermissionId}
            >
              Assign
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={isLoading || !selectedRoleId || !selectedPermissionId}
            >
              Remove
            </Button>
          </div>
          {actionMessage ? (
            <div className="text-sm text-muted-foreground">{actionMessage}</div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role directory</CardTitle>
          <CardDescription>
            Edit or remove roles to keep access tidy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && roles.length === 0 ? (
            <div className="text-sm text-muted-foreground">Loading roles...</div>
          ) : null}
          {!isLoading && roles.length === 0 ? (
            <div className="rounded-md border p-6 text-sm text-muted-foreground">
              No roles yet. Create your first role to begin assigning access.
            </div>
          ) : null}
          {roles.map((role) => {
            const roleId = String(role.id);
            const isEditing = editingRoleId === roleId;
            return (
              <div
                key={roleId}
                className="flex flex-wrap items-center justify-between gap-4 rounded-md border p-4"
              >
                <div className="space-y-1">
                  {isEditing ? (
                    <Input
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                    />
                  ) : (
                    <div className="font-medium">{role.name}</div>
                  )}
                  {/* <div className="text-xs text-muted-foreground">
                    ID: {roleId}
                  </div> */}
                </div>
                <div className="flex flex-wrap gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={() => handleUpdate(roleId)}
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
                        onClick={() => startEdit(role)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(roleId)}
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
          {error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
