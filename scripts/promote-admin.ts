import { prisma } from "../src/lib/prisma";
import { ADMIN_ROLE } from "../src/lib/roles";

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    console.error("Usage: npm run admin:promote -- you@example.com");
    process.exitCode = 1;
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No account found for ${email}. Register first, then run this again.`);
    process.exitCode = 1;
    return;
  }

  if (user.role === ADMIN_ROLE) {
    console.log(`${user.email} is already an admin.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: ADMIN_ROLE },
  });

  console.log(`${user.email} is now an admin.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
