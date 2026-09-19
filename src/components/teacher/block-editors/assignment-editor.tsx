"use client";

import { useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssignmentEditorProps {
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
  onDelete?: () => void;
}

export function AssignmentEditor({ content, onChange, onDelete }: AssignmentEditorProps) {
  const title = (content.title as string) ?? "";
  const instructions = (content.instructions as string) ?? "";
  const maxScore = (content.maxScore as number) ?? 100;
  const allowFileUpload = (content.allowFileUpload as boolean) ?? true;
  const maxFileSizeMB = (content.maxFileSizeMB as number) ?? 10;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary-400" />
            <CardTitle className="text-sm">Assignment</CardTitle>
          </div>
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete} className="h-7 w-7 p-0 text-red-400 hover:text-red-300">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="assignment-title">Title</Label>
          <Input
            id="assignment-title"
            value={title}
            onChange={(e) => onChange({ ...content, title: e.target.value })}
            placeholder="e.g., Write a short essay"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignment-instructions">Instructions</Label>
          <Textarea
            id="assignment-instructions"
            value={instructions}
            onChange={(e) => onChange({ ...content, instructions: e.target.value })}
            placeholder="Describe what students need to do..."
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="assignment-max-score">Max Score</Label>
            <Input
              id="assignment-max-score"
              type="number"
              min="1"
              max="1000"
              value={maxScore}
              onChange={(e) => onChange({ ...content, maxScore: parseInt(e.target.value) || 100 })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignment-max-size">Max File Size (MB)</Label>
            <Input
              id="assignment-max-size"
              type="number"
              min="1"
              max="100"
              value={maxFileSizeMB}
              onChange={(e) => onChange({ ...content, maxFileSizeMB: parseInt(e.target.value) || 10 })}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="assignment-file-upload"
            checked={allowFileUpload}
            onChange={(e) => onChange({ ...content, allowFileUpload: e.target.checked })}
            className="h-4 w-4 rounded border-border"
          />
          <Label htmlFor="assignment-file-upload" className="text-sm">
            Allow file uploads
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
