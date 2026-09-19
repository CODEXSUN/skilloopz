import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import type { Config } from "@libsql/client";

const libsqlConfig: Config = {
  url: process.env.DATABASE_URL ?? "file:prisma/dev.db",
};

const adapter = new PrismaLibSql(libsqlConfig);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding v3: Learning Worlds + Concepts...");

  const learningStyles = [
    { id: "style-visual", name: "visual", label: "Visual", description: "Learns best through images, diagrams, and visual content", icon: "👁️" },
    { id: "style-auditory", name: "auditory", label: "Auditory", description: "Learns best through listening and audio explanations", icon: "🎧" },
    { id: "style-reading", name: "reading", label: "Reading", description: "Learns best through text, code samples, and reading", icon: "📖" },
    { id: "style-kinesthetic", name: "kinesthetic", label: "Kinesthetic", description: "Learns best through hands-on practice and interactive content", icon: "🛠️" },
  ];
  for (const s of learningStyles) await prisma.learningStyle.upsert({ where: { id: s.id }, update: {}, create: s });
  console.log(`  LearningStyles: ${learningStyles.length}`);

  await prisma.learningWorld.upsert({
    where: { id: "world-python" },
    update: {},
    create: {
      id: "world-python",
      title: "Python World",
      description: "Master Python programming from variables to APIs",
      theme: "python", icon: "🐍", color: "#3776AB", order: 1,
    },
  });
  console.log("  World: Python World");

  const islands = [
    { id: "island-variables", title: "Variables Island", worldId: "world-python", icon: "📦", color: "#4CAF50", order: 1 },
    { id: "island-data-types", title: "Data Types Cove", worldId: "world-python", icon: "🏝️", color: "#2196F3", order: 2 },
    { id: "island-conditionals", title: "Conditionals Canyon", worldId: "world-python", icon: "🔀", color: "#FF9800", order: 3 },
    { id: "island-loops", title: "Loops Dungeon", worldId: "world-python", icon: "🔄", color: "#9C27B0", order: 4 },
    { id: "island-lists", title: "Lists Lagoon", worldId: "world-python", icon: "📋", color: "#00BCD4", order: 5 },
    { id: "island-functions", title: "Function Kingdom", worldId: "world-python", icon: "⚙️", color: "#E91E63", order: 6 },
    { id: "island-dictionaries", title: "Dictionaries Domain", worldId: "world-python", icon: "📖", color: "#3F51B5", order: 7 },
    { id: "island-oop", title: "OOP Temple", worldId: "world-python", icon: "🏛️", color: "#FF5722", order: 8 },
    { id: "island-api", title: "API City", worldId: "world-python", icon: "🌐", color: "#607D8B", order: 9 },
  ];
  for (const i of islands) await prisma.island.upsert({ where: { id: i.id }, update: {}, create: i });
  console.log(`  Islands: ${islands.length}`);

  const concepts = [
    { id: "concept-variables", title: "Variables", islandId: "island-variables", order: 1, difficulty: 1 },
    { id: "concept-assignment", title: "Assignment", islandId: "island-variables", order: 2, difficulty: 1 },
    { id: "concept-naming-rules", title: "Variable Naming Rules", islandId: "island-variables", order: 3, difficulty: 1 },
    { id: "concept-reassigning", title: "Reassigning Variables", islandId: "island-variables", order: 4, difficulty: 1 },
    { id: "concept-constants", title: "Constants", islandId: "island-variables", order: 5, difficulty: 1 },
    { id: "concept-strings", title: "Strings", islandId: "island-data-types", order: 1, difficulty: 1 },
    { id: "concept-numbers", title: "Numbers (int, float)", islandId: "island-data-types", order: 2, difficulty: 1 },
    { id: "concept-booleans", title: "Booleans", islandId: "island-data-types", order: 3, difficulty: 1 },
    { id: "concept-type-conversion", title: "Type Conversion", islandId: "island-data-types", order: 4, difficulty: 2 },
    { id: "concept-type-checking", title: "Type Checking", islandId: "island-data-types", order: 5, difficulty: 1 },
    { id: "concept-if-statements", title: "If Statements", islandId: "island-conditionals", order: 1, difficulty: 2 },
    { id: "concept-else-elif", title: "Else and Elif", islandId: "island-conditionals", order: 2, difficulty: 2 },
    { id: "concept-comparison-operators", title: "Comparison Operators", islandId: "island-conditionals", order: 3, difficulty: 1 },
    { id: "concept-logical-operators", title: "Logical Operators", islandId: "island-conditionals", order: 4, difficulty: 2 },
    { id: "concept-nested-conditionals", title: "Nested Conditionals", islandId: "island-conditionals", order: 5, difficulty: 3 },
    { id: "concept-for-loops", title: "For Loops", islandId: "island-loops", order: 1, difficulty: 2 },
    { id: "concept-while-loops", title: "While Loops", islandId: "island-loops", order: 2, difficulty: 2 },
    { id: "concept-range", title: "Range Function", islandId: "island-loops", order: 3, difficulty: 2 },
    { id: "concept-break-continue", title: "Break and Continue", islandId: "island-loops", order: 4, difficulty: 3 },
    { id: "concept-nested-loops", title: "Nested Loops", islandId: "island-loops", order: 5, difficulty: 3 },
    { id: "concept-list-comprehension", title: "List Comprehensions", islandId: "island-loops", order: 6, difficulty: 3 },
    { id: "concept-lists", title: "Lists", islandId: "island-lists", order: 1, difficulty: 2 },
    { id: "concept-list-indexing", title: "List Indexing", islandId: "island-lists", order: 2, difficulty: 1 },
    { id: "concept-list-slicing", title: "List Slicing", islandId: "island-lists", order: 3, difficulty: 2 },
    { id: "concept-list-methods", title: "List Methods", islandId: "island-lists", order: 4, difficulty: 2 },
    { id: "concept-tuples", title: "Tuples", islandId: "island-lists", order: 5, difficulty: 2 },
    { id: "concept-functions", title: "Functions", islandId: "island-functions", order: 1, difficulty: 2 },
    { id: "concept-parameters", title: "Parameters and Arguments", islandId: "island-functions", order: 2, difficulty: 2 },
    { id: "concept-return-values", title: "Return Values", islandId: "island-functions", order: 3, difficulty: 2 },
    { id: "concept-default-parameters", title: "Default Parameters", islandId: "island-functions", order: 4, difficulty: 3 },
    { id: "concept-scope", title: "Variable Scope", islandId: "island-functions", order: 5, difficulty: 3 },
    { id: "concept-lambda", title: "Lambda Functions", islandId: "island-functions", order: 6, difficulty: 3 },
    { id: "concept-recursion", title: "Recursion", islandId: "island-functions", order: 7, difficulty: 4 },
    { id: "concept-dictionaries", title: "Dictionaries", islandId: "island-dictionaries", order: 1, difficulty: 2 },
    { id: "concept-dict-operations", title: "Dictionary Operations", islandId: "island-dictionaries", order: 2, difficulty: 2 },
    { id: "concept-dict-methods", title: "Dictionary Methods", islandId: "island-dictionaries", order: 3, difficulty: 2 },
    { id: "concept-sets", title: "Sets", islandId: "island-dictionaries", order: 4, difficulty: 3 },
    { id: "concept-classes", title: "Classes", islandId: "island-oop", order: 1, difficulty: 3 },
    { id: "concept-objects", title: "Objects", islandId: "island-oop", order: 2, difficulty: 3 },
    { id: "concept-init-method", title: "__init__ Method", islandId: "island-oop", order: 3, difficulty: 3 },
    { id: "concept-inheritance", title: "Inheritance", islandId: "island-oop", order: 4, difficulty: 4 },
    { id: "concept-polymorphism", title: "Polymorphism", islandId: "island-oop", order: 5, difficulty: 4 },
    { id: "concept-encapsulation", title: "Encapsulation", islandId: "island-oop", order: 6, difficulty: 4 },
    { id: "concept-dunder-methods", title: "Dunder Methods", islandId: "island-oop", order: 7, difficulty: 4 },
    { id: "concept-http", title: "HTTP Basics", islandId: "island-api", order: 1, difficulty: 2 },
    { id: "concept-json", title: "JSON", islandId: "island-api", order: 2, difficulty: 2 },
    { id: "concept-rest-apis", title: "REST APIs", islandId: "island-api", order: 3, difficulty: 3 },
    { id: "concept-requests-library", title: "Requests Library", islandId: "island-api", order: 4, difficulty: 3 },
    { id: "concept-api-endpoints", title: "API Endpoints", islandId: "island-api", order: 5, difficulty: 3 },
    { id: "concept-error-handling", title: "Error Handling (try/except)", islandId: "island-api", order: 6, difficulty: 2 },
    { id: "concept-debugging", title: "Debugging", islandId: "island-api", order: 7, difficulty: 2 },
  ];
  for (const c of concepts) {
    await prisma.concept.upsert({
      where: { id: c.id }, update: {},
      create: { ...c, description: undefined, domain: "coding" },
    });
  }
  console.log(`  Concepts: ${concepts.length}`);

  const prereqs: [string, string][] = [
    ["concept-reassigning", "concept-variables"],
    ["concept-constants", "concept-variables"],
    ["concept-naming-rules", "concept-variables"],
    ["concept-type-conversion", "concept-strings"],
    ["concept-type-conversion", "concept-numbers"],
    ["concept-type-checking", "concept-strings"],
    ["concept-type-checking", "concept-numbers"],
    ["concept-if-statements", "concept-variables"],
    ["concept-if-statements", "concept-booleans"],
    ["concept-else-elif", "concept-if-statements"],
    ["concept-comparison-operators", "concept-variables"],
    ["concept-comparison-operators", "concept-numbers"],
    ["concept-logical-operators", "concept-booleans"],
    ["concept-nested-conditionals", "concept-if-statements"],
    ["concept-nested-conditionals", "concept-comparison-operators"],
    ["concept-for-loops", "concept-variables"],
    ["concept-while-loops", "concept-variables"],
    ["concept-range", "concept-variables"],
    ["concept-for-loops", "concept-lists"],
    ["concept-break-continue", "concept-for-loops"],
    ["concept-nested-loops", "concept-for-loops"],
    ["concept-list-comprehension", "concept-for-loops"],
    ["concept-list-comprehension", "concept-lists"],
    ["concept-lists", "concept-variables"],
    ["concept-list-indexing", "concept-lists"],
    ["concept-list-slicing", "concept-lists"],
    ["concept-list-methods", "concept-lists"],
    ["concept-tuples", "concept-lists"],
    ["concept-functions", "concept-variables"],
    ["concept-parameters", "concept-functions"],
    ["concept-return-values", "concept-functions"],
    ["concept-default-parameters", "concept-parameters"],
    ["concept-scope", "concept-functions"],
    ["concept-lambda", "concept-functions"],
    ["concept-recursion", "concept-functions"],
    ["concept-dictionaries", "concept-variables"],
    ["concept-dict-operations", "concept-dictionaries"],
    ["concept-dict-methods", "concept-dictionaries"],
    ["concept-sets", "concept-dictionaries"],
    ["concept-classes", "concept-functions"],
    ["concept-objects", "concept-classes"],
    ["concept-init-method", "concept-classes"],
    ["concept-inheritance", "concept-classes"],
    ["concept-polymorphism", "concept-inheritance"],
    ["concept-encapsulation", "concept-classes"],
    ["concept-dunder-methods", "concept-classes"],
    ["concept-http", "concept-variables"],
    ["concept-json", "concept-strings"],
    ["concept-rest-apis", "concept-http"],
    ["concept-rest-apis", "concept-json"],
    ["concept-requests-library", "concept-rest-apis"],
    ["concept-api-endpoints", "concept-rest-apis"],
    ["concept-error-handling", "concept-if-statements"],
    ["concept-error-handling", "concept-functions"],
  ];
  let count = 0;
  for (const [cId, pId] of prereqs) {
    try {
      await prisma.conceptPrerequisite.upsert({
        where: { conceptId_prerequisiteId: { conceptId: cId, prerequisiteId: pId } },
        update: {},
        create: { conceptId: cId, prerequisiteId: pId },
      });
      count++;
    } catch { /* skip if concepts missing */ }
  }
  console.log(`  Prerequisites: ${count}`);

  console.log("\n✅ v3 seeding complete!");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());