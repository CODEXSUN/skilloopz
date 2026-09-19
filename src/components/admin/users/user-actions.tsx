"use client";

import { useState } from "react";
import { Loader2, Shield, Trash2, Ban, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface UserActionsProps {
  userId: string;
  currentRole: string;
  currentStatus?: string;
  onRoleChange: (userId: string, role: string) => void;
  onStatusChange?: (userId: string, status: string) => void;
  onDelete: (userId: string) => void;
}

export function UserActions({
  userId,
  currentRole,
  currentStatus = "active",
  onRoleChange,
  onStatusChange,
  onDelete,
}: UserActionsProps) {
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState(currentRole);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleRoleUpdate() {
    if (newRole === currentRole) {
      setShowRoleDialog(false);
      return;
    }
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        onRoleChange(userId, newRole);
        setShowRoleDialog(false);
      }
    } catch {
      // ignore
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        onStatusChange?.(userId, newStatus);
      }
    } catch {
      // ignore
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDelete(userId);
        setShowDeleteConfirm(false);
      }
    } catch {
      // ignore
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {currentStatus === "pending_approval" && (
          <Button
            variant="ghost"
            size="sm"
            className="text-green-500 hover:text-green-600"
            disabled={isUpdating}
            onClick={() => handleStatusChange("active")}
          >
            <CheckCircle className="h-4 w-4" />
            Approve
          </Button>
        )}
        {currentStatus !== "suspended" ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-orange-500 hover:text-orange-600"
            disabled={isUpdating}
            onClick={() => handleStatusChange("suspended")}
          >
            <Ban className="h-4 w-4" />
            Suspend
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-green-500 hover:text-green-600"
            disabled={isUpdating}
            onClick={() => handleStatusChange("active")}
          >
            <CheckCircle className="h-4 w-4" />
            Reinstate
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setNewRole(currentRole);
            setShowRoleDialog(true);
          }}
        >
          <Shield className="h-4 w-4" />
          Role
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-600"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update this user&apos;s platform role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>New Role</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleUpdate} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              This permanently deletes the user and all associated data. Cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isUpdating}
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
