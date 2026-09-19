"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AnimationConfigProps {
  easing: string;
  duration: number;
  pageTransition: string;
  onEasingChange: (v: string) => void;
  onDurationChange: (v: number) => void;
  onPageTransitionChange: (v: string) => void;
}

export function AnimationConfig({
  easing,
  duration,
  pageTransition,
  onEasingChange,
  onDurationChange,
  onPageTransitionChange,
}: AnimationConfigProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Animations
      </h4>
      <div className="space-y-1.5">
        <Label className="text-xs">Default Easing</Label>
        <Select value={easing} onValueChange={onEasingChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ease-in-out">Ease In Out</SelectItem>
            <SelectItem value="ease-in">Ease In</SelectItem>
            <SelectItem value="ease-out">Ease Out</SelectItem>
            <SelectItem value="linear">Linear</SelectItem>
            <SelectItem value="cubic-bezier(...)">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Duration (ms)</Label>
        <Input
          type="number"
          min={0}
          max={5000}
          value={duration}
          onChange={(e) => onDurationChange(Number(e.target.value))}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Page Transition</Label>
        <Input
          value={pageTransition}
          onChange={(e) => onPageTransitionChange(e.target.value)}
          placeholder="0.3s ease-in-out"
          className="font-mono text-xs"
        />
      </div>
    </div>
  );
}
