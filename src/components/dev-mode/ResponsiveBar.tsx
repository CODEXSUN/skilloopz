"use client";

import { Monitor, Tablet, Smartphone } from "lucide-react";
import { useDevModeStore, type DeviceMode } from "@/stores/devModeStore";

const devices: { mode: DeviceMode; icon: typeof Monitor; label: string }[] = [
  { mode: "desktop", icon: Monitor, label: "Desktop" },
  { mode: "tablet", icon: Tablet, label: "Tablet" },
  { mode: "mobile", icon: Smartphone, label: "Mobile" },
];

export function ResponsiveBar() {
  const enabled = useDevModeStore((s) => s.enabled);
  const deviceMode = useDevModeStore((s) => s.deviceMode);
  const setDeviceMode = useDevModeStore((s) => s.setDeviceMode);

  if (!enabled) return null;

  return (
    <div className="flex items-center gap-1 rounded-lg bg-[rgba(255,255,255,0.04)] p-1">
      {devices.map((device) => {
        const Icon = device.icon;
        const isActive = deviceMode === device.mode;
        return (
          <button
            key={device.mode}
            onClick={() => setDeviceMode(device.mode)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
              isActive
                ? "bg-primary-500/20 text-primary-400"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title={device.label}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{device.label}</span>
          </button>
        );
      })}
    </div>
  );
}
