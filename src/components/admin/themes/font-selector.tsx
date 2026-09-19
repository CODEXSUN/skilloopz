"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const systemFonts = [
  { value: "'Inter', sans-serif", label: "Inter" },
  { value: "'Nunito', sans-serif", label: "Nunito" },
  { value: "'Fredoka', sans-serif", label: "Fredoka" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Merriweather', serif", label: "Merriweather" },
  { value: "'Poppins', sans-serif", label: "Poppins" },
  { value: "'Playfair Display', serif", label: "Playfair Display" },
  { value: "'Source Sans 3', sans-serif", label: "Source Sans 3" },
];

interface FontSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function FontSelector({ label, value, onChange }: FontSelectorProps) {
  const customFont = !systemFonts.find((f) => f.value === value);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Select value={customFont ? "custom" : value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {systemFonts.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              <span style={{ fontFamily: font.value }}>{font.label}</span>
            </SelectItem>
          ))}
          {customFont && <SelectItem value="custom">Custom...</SelectItem>}
        </SelectContent>
      </Select>
      {customFont && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="'My Font', sans-serif"
          className="mt-1 font-mono text-xs"
        />
      )}
    </div>
  );
}
