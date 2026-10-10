import { prisma } from "@/lib/prisma";

async function main() {
  console.log("Prisma client imported:", !!prisma);
  await prisma.$connect();
  console.log("Connected to database successfully");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
