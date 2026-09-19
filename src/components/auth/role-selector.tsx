"use client";

import { GraduationCap, Users, HeartHandshake, Check } from "lucide-react";
import { motion } from "framer-motion";

type Role = "student" | "teacher" | "parent";

interface RoleSelectorProps {
  selected: Role | null;
  onSelect: (role: Role) => void;
}

const roles: {
  value: Role;
  label: string;
  description: string;
  icon: typeof GraduationCap;
}[] = [
  {
    value: "student",
    label: "Student",
    description: "I want to learn and explore",
    icon: GraduationCap,
  },
  {
    value: "teacher",
    label: "Teacher",
    description: "I want to create courses and teach",
    icon: Users,
  },
  {
    value: "parent",
    label: "Parent",
    description: "I want to guide my child's learning",
    icon: HeartHandshake,
  },
];

export function RoleSelector({ selected, onSelect }: RoleSelectorProps) {
  return (
    <div className="grid gap-4">
      {roles.map(({ value, label, description, icon: Icon }, i) => (
        <motion.button
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.99 }}
          className={`group relative flex items-start gap-5 overflow-hidden rounded-2xl border p-5 text-left shadow-xl transition-all duration-300 ${
            selected === value
              ? "border-primary-500/30 bg-primary-500/10 shadow-primary-500/10"
              : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.12)]"
          }`}
        >
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-lg transition-all duration-300 ${
              selected === value
                ? "border-primary-500/20 bg-primary-500/20 text-primary-300"
                : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-muted-foreground group-hover:border-primary-500/10 group-hover:bg-primary-500/5 group-hover:text-primary-400"
            }`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className={`font-bold transition-colors ${
              selected === value ? "text-primary-300" : "text-foreground"
            }`}>
              {label}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          </div>
          {selected === value && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-5 top-5"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-500">
                <Check className="h-3.5 w-3.5 text-white" />
              </div>
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
}
