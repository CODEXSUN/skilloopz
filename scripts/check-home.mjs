import { PrismaClient } from '../src/generated/prisma/index.js';
const p = new PrismaClient();
const r = await p.customPage.findFirst({where:{slug:'home'}});
console.log(JSON.stringify(r));
await p.$disconnect();
