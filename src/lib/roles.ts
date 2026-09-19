import { prisma } from "@/lib/db";

interface Permissions {
  [resource: string]: {
    [action: string]: boolean;
  };
}

const DEFAULT_ROLES: Array<{ name: string; description: string; permissions: Permissions; isBuiltIn: boolean }> = [
  {
    name: "admin",
    description: "Full access to all platform features and settings",
    isBuiltIn: true,
    permissions: {
      users: { create: true, read: true, update: true, delete: true },
      courses: { create: true, read: true, update: true, delete: true },
      pages: { create: true, read: true, update: true, delete: true },
      settings: { read: true, update: true },
      roles: { read: true, update: true },
      analytics: { read: true },
      templates: { create: true, read: true, update: true, delete: true },
      navigation: { create: true, read: true, update: true, delete: true },
      media: { create: true, read: true, delete: true },
      backups: { create: true, read: true },
      moderation: { read: true, update: true, delete: true },
      notifications: { create: true, read: true, delete: true },
      automation: { create: true, read: true, update: true, delete: true },
      localization: { read: true, update: true },
    },
  },
  {
    name: "teacher",
    description: "Can create and manage courses, view analytics",
    isBuiltIn: true,
    permissions: {
      users: { create: false, read: true, update: false, delete: false },
      courses: { create: true, read: true, update: true, delete: true },
      pages: { create: false, read: true, update: false, delete: false },
      settings: { read: false, update: false },
      roles: { read: false, update: false },
      analytics: { read: true },
      templates: { create: false, read: true, update: false, delete: false },
      navigation: { create: false, read: true, update: false, delete: false },
      media: { create: true, read: true, delete: true },
      backups: { create: false, read: false },
      moderation: { read: false, update: false, delete: false },
      notifications: { create: true, read: true, delete: false },
      automation: { create: false, read: false, update: false, delete: false },
      localization: { read: false, update: false },
    },
  },
  {
    name: "student",
    description: "Can browse courses, enroll, and learn",
    isBuiltIn: true,
    permissions: {
      users: { create: false, read: true, update: false, delete: false },
      courses: { create: false, read: true, update: false, delete: false },
      pages: { create: false, read: true, update: false, delete: false },
      settings: { read: false, update: false },
      roles: { read: false, update: false },
      analytics: { read: false },
      templates: { create: false, read: false, update: false, delete: false },
      navigation: { create: false, read: true, update: false, delete: false },
      media: { create: false, read: true, delete: false },
      backups: { create: false, read: false },
      moderation: { read: false, update: false, delete: false },
      notifications: { create: false, read: true, delete: false },
      automation: { create: false, read: false, update: false, delete: false },
      localization: { read: false, update: false },
    },
  },
  {
    name: "parent",
    description: "Can monitor child progress and manage family settings",
    isBuiltIn: true,
    permissions: {
      users: { create: false, read: true, update: false, delete: false },
      courses: { create: false, read: true, update: false, delete: false },
      pages: { create: false, read: true, update: false, delete: false },
      settings: { read: false, update: false },
      roles: { read: false, update: false },
      analytics: { read: true },
      templates: { create: false, read: false, update: false, delete: false },
      navigation: { create: false, read: true, update: false, delete: false },
      media: { create: false, read: true, delete: false },
      backups: { create: false, read: false },
      moderation: { read: false, update: false, delete: false },
      notifications: { create: false, read: true, delete: false },
      automation: { create: false, read: false, update: false, delete: false },
      localization: { read: false, update: false },
    },
  },
];

export async function ensureDefaultRoles() {
  const count = await prisma.role.count();
  if (count > 0) return;

  for (const role of DEFAULT_ROLES) {
    await prisma.role.create({
      data: {
        name: role.name,
        description: role.description,
        permissions: JSON.stringify(role.permissions),
        isBuiltIn: role.isBuiltIn,
      },
    });
  }
}
