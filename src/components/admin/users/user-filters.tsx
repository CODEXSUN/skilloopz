"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface UserFiltersProps {
  search: string;
  role: string;
  onSearchChange: (v: string) => void;
  onRoleChange: (v: string) => void;
  onReset: () => void;
}

export function UserFilters({
  search,
  role,
  onSearchChange,
  onRoleChange,
  onReset,
}: UserFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="search" className="text-xs">Search</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-tertiary-foreground" />
          <Input
            id="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Name or email..."
            className="w-60 pl-8"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="role" className="text-xs">Role</Label>
        <Select value={role} onValueChange={onRoleChange}>
          <SelectTrigger id="role" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
            <SelectItem value="parent">Parent</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {(search || role) && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  );
}
