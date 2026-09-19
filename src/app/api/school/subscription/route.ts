import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

const PLANS: Record<string, { price: number; students: number; teachers: number; features: string[] }> = {
  free: { price: 0, students: 50, teachers: 5, features: ["Basic courses", "Limited storage"] },
  pro: { price: 29.99, students: 200, teachers: 20, features: ["Full features", "Analytics", "AI tutor"] },
  school: { price: 99.99, students: 1000, teachers: 100, features: ["White-label", "Bulk users", "Priority support"] },
  enterprise: { price: 299.99, students: 10000, teachers: 500, features: ["Unlimited", "API access", "SLA", "Dedicated support"] },
};

export async function GET() {
  try {
    const user = await getUser();
    if (!user || !user.schoolId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const school = await prisma.school.findUnique({
      where: { id: user.schoolId },
      select: {
        id: true,
        name: true,
        tier: true,
        maxStudents: true,
        contractStart: true,
        contractEnd: true,
        contracts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    return NextResponse.json({
      school: {
        ...school,
        contractStart: school.contractStart?.toISOString(),
        contractEnd: school.contractEnd?.toISOString(),
      },
      plans: Object.entries(PLANS).map(([key, plan]) => ({
        id: key,
        ...plan,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user || !user.schoolId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schoolId = user.schoolId;
    const body = await request.json();
    const { planId } = body as { planId: string };

    if (!planId || !PLANS[planId]) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    const plan = PLANS[planId];
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const contract = await prisma.$transaction(async (tx) => {
      const existingActive = await tx.schoolContract.findFirst({
        where: { schoolId, status: "active" },
      });

      if (existingActive) {
        await tx.schoolContract.update({
          where: { id: existingActive.id },
          data: {
            status: "expired",
            endDate: now,
          },
        });
      }

      const newContract = await tx.schoolContract.create({
        data: {
          schoolId,
          type: planId,
          status: "active",
          startDate: now,
          endDate,
          maxStudents: plan.students,
          maxTeachers: plan.teachers,
          pricePerMonth: plan.price,
          currency: "USD",
          features: JSON.stringify(plan.features),
          signedBy: user.id,
          signedAt: now,
        },
      });

      await tx.school.update({
        where: { id: schoolId },
        data: {
          tier: planId,
          maxStudents: plan.students,
          contractStart: now,
          contractEnd: endDate,
        },
      });

      return newContract;
    });

    return NextResponse.json({
      success: true,
      contract: {
        ...contract,
        startDate: contract.startDate.toISOString(),
        endDate: contract.endDate.toISOString(),
        signedAt: contract.signedAt?.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
