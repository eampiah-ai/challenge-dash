import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const groupPassword = process.env.GROUP_PASSWORD;
  if (!groupPassword) {
    throw new Error("GROUP_PASSWORD environment variable is required for seeding");
  }

  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);

  const passwordHash = await bcrypt.hash(groupPassword, 10);

  const existing = await prisma.challenge.findFirst();
  if (existing) {
    console.log("Challenge already seeded, skipping...");
    return;
  }

  const challenge = await prisma.challenge.create({
    data: {
      startDate,
      endDate,
      passwordHash,
    },
  });

  console.log(`Seeded challenge ${challenge.id}: ${startDate.toDateString()} - ${endDate.toDateString()}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
