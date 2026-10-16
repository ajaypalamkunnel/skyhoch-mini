import { PrismaClient } from "../src/generated/prisma/client";
import { seedRoles } from "./seeders/role.seeder";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedUsers } from "./seeders/user.seeder";
import { seedCourses } from "./seeders/course.seeder";
import { seedEnrollments } from "./seeders/enrollment.seeder";
import { seedLiveClasses } from "./seeders/live-class.seeder";
import { seedFutureLiveClasses } from "./seeders/future-live-classes.seeder";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await seedRoles(prisma);
  await seedUsers(prisma);
  await seedCourses(prisma);
  await seedEnrollments(prisma);
  await seedLiveClasses(prisma);
  await seedFutureLiveClasses(prisma);


  console.log("✓ Database seeding completed");
}

main()
  .catch((error) => {
    console.error("✗ Database seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });