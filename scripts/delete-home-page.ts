import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const page = await prisma.customPage.findFirst({ where: { slug: "home" } });
  if (page) {
    await prisma.pageSection.deleteMany({ where: { pageId: page.id } });
    await prisma.customPage.delete({ where: { id: page.id } });
    console.log("Deleted home page and its sections. Fallback sections will now render.");
  } else {
    console.log("No home page found");
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
