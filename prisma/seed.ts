


const { PrismaClient } = require("@prisma/client");
const bcryptjs = require("bcryptjs");

const db = new PrismaClient();

async function main() {
  const users = [
    {
      name: "Ava Patel",
      email: "ava.patel@example.com",
      phone: "+1 (312) 555-0198",
    },
    {
      name: "Liam Nguyen",
      email: "liam.nguyen@example.com",
      phone: "+1 (408) 555-2456",
    },
    {
      name: "Sophia Kim",
      email: "sophia.kim@example.com",
      phone: "+1 (213) 555-9832",
    },
    {
      name: "Noah Garcia",
      email: "noah.garcia@example.com",
      phone: "+1 (646) 555-7521",
    },
    {
      name: "Isabella Ali",
      email: "isabella.ali@example.com",
      phone: "+1 (720) 555-4310",
    },
    {
      name: "Ethan Singh",
      email: "ethan.singh@example.com",
      phone: "+1 (206) 555-8910",
    },
    {
      name: "Mia Roberts",
      email: "mia.roberts@example.com",
      phone: "+1 (512) 555-6742",
    },
    {
      name: "James Zhao",
      email: "james.zhao@example.com",
      phone: "+1 (917) 555-3821",
    },
    {
      name: "Olivia Khan",
      email: "olivia.khan@example.com",
      phone: "+1 (404) 555-1673",
    },
    {
      name: "Lucas Johnson",
      email: "lucas.johnson@example.com",
      phone: "+1 (415) 555-9082",
    },
    {
      name: "Emma Lee",
      email: "emma.lee@example.com",
      phone: "+1 (718) 555-4536",
    },
    {
      name: "Benjamin Davis",
      email: "ben.davis@example.com",
      phone: "+1 (602) 555-3390",
    },
    {
      name: "Chloe Martin",
      email: "chloe.martin@example.com",
      phone: "+1 (801) 555-7320",
    },
    {
      name: "Henry White",
      email: "henry.white@example.com",
      phone: "+1 (312) 555-6641",
    },
    {
      name: "Zara Ahmed",
      email: "zara.ahmed@example.com",
      phone: "+1 (973) 555-2189",
    },
    {
      name: "Daniel Brooks",
      email: "daniel.brooks@example.com",
      phone: "+1 (305) 555-7095",
    },
  ];

  for (const user of users) {
    const hashedPassword = await bcryptjs.hash("mockpassword", 10);

    await db.user.create({
      data: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: hashedPassword,
        emailVerified: new Date().toISOString(),
      },
    });
  }
}

main()
  .then(() => {
    console.log("✅ Database seeded!");
    db.$disconnect();
  })
  .catch((error) => {
    console.error("❌ Seed error:", error);
    db.$disconnect();
    process.exit(1);
  });
