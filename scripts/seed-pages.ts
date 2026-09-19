import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function seed() {
  const home = await prisma.customPage.upsert({
    where: { slug: "home" },
    update: { status: "published" },
    create: {
      id: crypto.randomUUID(),
      title: "Home",
      slug: "home",
      path: "/",
      status: "published",
      layout: "default",
      seo: JSON.stringify({ title: "NEOT — Adaptive Learning Platform" }),
    },
  });
  console.log("Homepage:", home.id);

  await prisma.pageSection.upsert({
    where: { id: "seed-home-hero" },
    update: { content: JSON.stringify({ title: "Learn Anything, Anywhere", subtitle: "Interactive courses for every age. Adaptive. Engaging. Free.", ctaText: "Get Started", background: "gradient" }) },
    create: { id: "seed-home-hero", pageId: home.id, blockType: "hero", sortOrder: 0, content: JSON.stringify({ title: "Learn Anything, Anywhere", subtitle: "Interactive courses for every age. Adaptive. Engaging. Free.", ctaText: "Get Started", background: "gradient" }), settings: "{}" },
  });
  console.log("  hero section added");

  await prisma.pageSection.upsert({
    where: { id: "seed-home-knowledge-constellation" },
    update: { content: "{}" },
    create: { id: "seed-home-knowledge-constellation", pageId: home.id, blockType: "knowledge-constellation", sortOrder: 1, content: "{}", settings: "{}" },
  });
  console.log("  knowledge constellation section added");

  await prisma.pageSection.upsert({
    where: { id: "seed-home-adaptive-stream" },
    update: { content: "{}" },
    create: { id: "seed-home-adaptive-stream", pageId: home.id, blockType: "adaptive-stream", sortOrder: 2, content: "{}", settings: "{}" },
  });
  console.log("  adaptive stream section added");

  await prisma.pageSection.upsert({
    where: { id: "seed-home-adaptive-timeline" },
    update: { content: "{}" },
    create: { id: "seed-home-adaptive-timeline", pageId: home.id, blockType: "adaptive-timeline", sortOrder: 3, content: "{}", settings: "{}" },
  });
  console.log("  adaptive timeline section added");

  await prisma.pageSection.upsert({
    where: { id: "seed-home-achievement-ecosystem" },
    update: { content: "{}" },
    create: { id: "seed-home-achievement-ecosystem", pageId: home.id, blockType: "achievement-ecosystem", sortOrder: 4, content: "{}", settings: "{}" },
  });
  console.log("  achievement ecosystem section added");

  await prisma.pageSection.upsert({
    where: { id: "seed-home-live-ecosystem" },
    update: { content: "{}" },
    create: { id: "seed-home-live-ecosystem", pageId: home.id, blockType: "live-ecosystem", sortOrder: 5, content: "{}", settings: "{}" },
  });
  console.log("  live ecosystem section added");

  await prisma.pageSection.upsert({
    where: { id: "seed-home-learning-dna" },
    update: { content: "{}" },
    create: { id: "seed-home-learning-dna", pageId: home.id, blockType: "learning-dna", sortOrder: 6, content: "{}", settings: "{}" },
  });
  console.log("  learning dna section added");

  await prisma.pageSection.upsert({
    where: { id: "seed-home-future-self" },
    update: { content: "{}" },
    create: { id: "seed-home-future-self", pageId: home.id, blockType: "future-self", sortOrder: 7, content: "{}", settings: "{}" },
  });
  console.log("  future self section added");

  await prisma.pageSection.upsert({
    where: { id: "seed-home-cta" },
    update: { content: JSON.stringify({ text: "Ready to start your learning journey?", buttonText: "Get Started Free", buttonLink: "/signup", background: "primary" }) },
    create: { id: "seed-home-cta", pageId: home.id, blockType: "cta-banner", sortOrder: 8, content: JSON.stringify({ text: "Ready to start your learning journey?", buttonText: "Get Started Free", buttonLink: "/signup", background: "primary" }), settings: "{}" },
  });
  console.log("  CTA section added");

  const about = await prisma.customPage.upsert({
    where: { slug: "about" },
    update: { status: "published" },
    create: { id: crypto.randomUUID(), title: "About", slug: "about", path: "/about", status: "published", layout: "default", seo: JSON.stringify({ title: "About NEOT" }) },
  });
  console.log("About page:", about.id);

  await prisma.pageSection.upsert({
    where: { id: "seed-about-hero" },
    update: { content: JSON.stringify({ title: "About NEOT", subtitle: "Learning should adapt to humans. Not the other way around.", ctaText: "Explore Courses", ctaLink: "/courses", background: "color" }) },
    create: { id: "seed-about-hero", pageId: about.id, blockType: "hero", sortOrder: 0, content: JSON.stringify({ title: "About NEOT", subtitle: "Learning should adapt to humans. Not the other way around.", ctaText: "Explore Courses", ctaLink: "/courses", background: "color" }), settings: "{}" },
  });
  console.log("  hero section added");

  console.log("\nSeed complete! Visit / and /about");
}

seed().catch(console.error);
