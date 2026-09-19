import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import type { Config } from "@libsql/client";
import { hashSync } from "bcryptjs";

const libsqlConfig: Config = {
  url: process.env.DATABASE_URL ?? "file:prisma/dev.db",
};

const adapter = new PrismaLibSql(libsqlConfig);
const prisma = new PrismaClient({ adapter });

const SCHOOLS = [
  {
    name: "Greenfield Academy",
    code: "GREENFIELD",
    email: "admin@greenfield.edu",
    phone: "+1-555-0101",
    address: "123 Oak Street",
    city: "Portland",
    state: "OR",
    country: "US",
    website: "https://greenfield.edu",
    tier: "pro",
    maxStudents: 200,
    currentStudents: 45,
    whiteLabel: {
      primaryColor: "#10b981",
      secondaryColor: "#059669",
      backgroundColor: "#f0fdf4",
      textColor: "#1e293b",
      welcomeMessage: "Welcome to Greenfield Academy!",
      hideBranding: true,
    },
    contract: {
      type: "pro",
      pricePerMonth: 29.99,
      maxStudents: 200,
      maxTeachers: 20,
    },
    admins: [{ email: "admin@greenfield.edu", fullName: "Sarah Johnson", role: "school_admin" }],
    teachers: [
      { email: "teacher1@greenfield.edu", fullName: "Mike Chen", role: "school_staff" },
      { email: "teacher2@greenfield.edu", fullName: "Emily Davis", role: "school_staff" },
    ],
    students: [
      { email: "student1@greenfield.edu", fullName: "Alex Thompson", role: "student" },
      { email: "student2@greenfield.edu", fullName: "Jordan Lee", role: "student" },
      { email: "student3@greenfield.edu", fullName: "Sam Wilson", role: "student" },
    ],
  },
  {
    name: "Sunrise International School",
    code: "SUNRISE",
    email: "admin@sunrise.edu",
    phone: "+1-555-0202",
    address: "456 Maple Avenue",
    city: "Seattle",
    state: "WA",
    country: "US",
    website: "https://sunrise.edu",
    tier: "enterprise",
    maxStudents: 10000,
    currentStudents: 320,
    whiteLabel: {
      primaryColor: "#f59e0b",
      secondaryColor: "#d97706",
      backgroundColor: "#fffbeb",
      textColor: "#1e293b",
      welcomeMessage: "Welcome to Sunrise International!",
      hideBranding: true,
      footerText: "Sunrise International School © 2026",
    },
    contract: {
      type: "enterprise",
      pricePerMonth: 299.99,
      maxStudents: 10000,
      maxTeachers: 500,
    },
    admins: [{ email: "admin@sunrise.edu", fullName: "David Park", role: "school_admin" }],
    teachers: [
      { email: "teacher1@sunrise.edu", fullName: "Lisa Wang", role: "school_staff" },
      { email: "teacher2@sunrise.edu", fullName: "Robert Kim", role: "school_staff" },
      { email: "teacher3@sunrise.edu", fullName: "Maria Garcia", role: "school_staff" },
      { email: "teacher4@sunrise.edu", fullName: "James Brown", role: "school_staff" },
    ],
    students: [
      { email: "student1@sunrise.edu", fullName: "Sophia Martinez", role: "student" },
      { email: "student2@sunrise.edu", fullName: "Ethan Clark", role: "student" },
      { email: "student3@sunrise.edu", fullName: "Olivia Taylor", role: "student" },
      { email: "student4@sunrise.edu", fullName: "Noah Anderson", role: "student" },
      { email: "student5@sunrise.edu", fullName: "Emma White", role: "student" },
    ],
  },
  {
    name: "Oakwood Elementary",
    code: "OAKWOOD",
    email: "admin@oakwood.edu",
    phone: "+1-555-0303",
    address: "789 Pine Road",
    city: "Denver",
    state: "CO",
    country: "US",
    website: "https://oakwood.edu",
    tier: "free",
    maxStudents: 50,
    currentStudents: 12,
    whiteLabel: {
      primaryColor: "#3b82f6",
      secondaryColor: "#8b5cf6",
      backgroundColor: "#ffffff",
      textColor: "#111827",
      welcomeMessage: "Welcome to Oakwood Elementary!",
    },
    contract: {
      type: "free",
      pricePerMonth: 0,
      maxStudents: 50,
      maxTeachers: 5,
    },
    admins: [{ email: "admin@oakwood.edu", fullName: "Karen Miller", role: "school_admin" }],
    teachers: [
      { email: "teacher1@oakwood.edu", fullName: "Tom Harris", role: "school_staff" },
    ],
    students: [
      { email: "student1@oakwood.edu", fullName: "Lily Evans", role: "student" },
      { email: "student2@oakwood.edu", fullName: "Jack Robinson", role: "student" },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding demo schools...");

  for (const schoolData of SCHOOLS) {
    console.log(`\n📚 Processing school: ${schoolData.name}`);

    let school = await prisma.school.findUnique({
      where: { code: schoolData.code },
      include: { whiteLabel: true, contracts: true },
    });

    if (!school) {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 1);

      school = await prisma.school.create({
        data: {
          name: schoolData.name,
          code: schoolData.code,
          email: schoolData.email,
          phone: schoolData.phone,
          address: schoolData.address,
          city: schoolData.city,
          state: schoolData.state,
          country: schoolData.country,
          website: schoolData.website,
          tier: schoolData.tier,
          maxStudents: schoolData.maxStudents,
          currentStudents: schoolData.currentStudents,
          contractStart: now,
          contractEnd: endDate,
          whiteLabel: { create: { ...schoolData.whiteLabel } },
          contracts: {
            create: {
              type: schoolData.contract.type,
              status: "active",
              startDate: now,
              endDate,
              maxStudents: schoolData.contract.maxStudents,
              maxTeachers: schoolData.contract.maxTeachers,
              pricePerMonth: schoolData.contract.pricePerMonth,
              currency: "USD",
              features: JSON.stringify([]),
            },
          },
        },
        include: { whiteLabel: true, contracts: true },
      });
      console.log(`  ✅ School created (ID: ${school.id})`);
      console.log(`  🎨 White-label configured`);
      console.log(`  📄 Contract created (${schoolData.contract.type} plan)`);
    } else {
      console.log(`  ℹ️ School already exists`);
    }

    const createUsers = async (
      users: Array<{ email: string; fullName: string; role: string }>,
      label: string
    ) => {
      for (const userData of users) {
        const existing = await prisma.profile.findFirst({
          where: { email: userData.email },
        });
        if (existing) {
          console.log(`  ⏭️ ${label} already exists: ${userData.email}`);
          continue;
        }

        await prisma.profile.create({
          data: {
            id: `seed-${userData.email.split("@")[0]}-${schoolData.code.toLowerCase()}`,
            email: userData.email,
            fullName: userData.fullName,
            role: userData.role,
            status: "active",
            passwordHash: hashSync("password123", 10),
            onboardingCompleted: true,
            schoolId: school!.id,
          },
        });
        console.log(`  ✅ ${label} created: ${userData.email}`);
      }
    };

    await createUsers(schoolData.admins, "Admin");
    await createUsers(schoolData.teachers, "Teacher");
    await createUsers(schoolData.students, "Student");
  }

  console.log("\n✅ Demo schools seeding complete!");
  console.log("\n🔑 Default password for all users: password123");
  console.log("\n📋 Schools:");
  console.log("  - Greenfield Academy (Pro) - 1 admin, 2 teachers, 3 students");
  console.log("  - Sunrise International School (Enterprise) - 1 admin, 4 teachers, 5 students");
  console.log("  - Oakwood Elementary (Free) - 1 admin, 1 teacher, 2 students");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
