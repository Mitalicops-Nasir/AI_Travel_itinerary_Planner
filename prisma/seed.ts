import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

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

  const hashedPassword = await bcryptjs.hash("mockpassword", 10);

  for (const user of users) {
    await db.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });
  }

  // Admin account for testing the admin-only actions.
  // Email: admin@example.com — Password: password123
  const adminPassword = await bcryptjs.hash("password123", 10);

  await db.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: "ADMIN" },
    create: {
      name: "Admin",
      email: "admin@example.com",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  // -------------------------------------------------------------------------
  // Travel Engagement Suite sample data (upsert-only — never deletes data)
  // -------------------------------------------------------------------------

  const ava = await db.user.findUnique({
    where: { email: "ava.patel@example.com" },
  });

  if (ava) {
    await db.travelProfile.upsert({
      where: { userId: ava.id },
      update: {},
      create: {
        userId: ava.id,
        pace: "balanced",
        budgetStyle: "mid-range",
        interests: ["food", "museums", "hiking"],
        dietaryNeeds: "vegetarian",
      },
    });

    const visitedDestinations = [
      { country: "Japan", city: "Tokyo", year: 2023 },
      { country: "Italy", city: "Rome", year: 2024 },
    ];

    for (const visited of visitedDestinations) {
      await db.visitedDestination.upsert({
        where: {
          userId_country_city: {
            userId: ava.id,
            country: visited.country,
            city: visited.city,
          },
        },
        update: {},
        create: { userId: ava.id, ...visited },
      });
    }
  }

  const admin = await db.user.findUnique({
    where: { email: "admin@example.com" },
  });

  if (admin) {
    const existingCurated = await db.trip.findFirst({
      where: { userId: admin.id, isCurated: true },
    });

    if (!existingCurated) {
      const curatedItinerary = {
        day: [
          {
            day: 1,
            location: "Lisbon",
            gettingThere: "Land at Humberto Delgado Airport, 20 min taxi to Alfama",
            activities: [
              { time: "Afternoon", description: "Check in and walk the Alfama lanes" },
              { time: "Evening", description: "Sunset at Miradouro da Senhora do Monte" },
            ],
          },
          {
            day: 2,
            location: "Lisbon",
            gettingThere: "Tram 28 from Alfama",
            activities: [
              { time: "Morning", description: "Belem Tower and Pastéis de Belém" },
              { time: "Afternoon", description: "Time Out Market food crawl" },
            ],
          },
          {
            day: 3,
            location: "Sintra",
            gettingThere: "40 min train from Rossio station",
            activities: [
              { time: "Morning", description: "Pena Palace and park" },
              { time: "Afternoon", description: "Quinta da Regaleira gardens" },
            ],
          },
          {
            day: 4,
            location: "Cascais",
            gettingThere: "Coastal train from Lisbon",
            activities: [
              { time: "Morning", description: "Boca do Inferno cliffs" },
              { time: "Afternoon", description: "Beach time at Praia da Rainha" },
            ],
          },
          {
            day: 5,
            location: "Porto",
            gettingThere: "3 h train from Lisbon",
            activities: [
              { time: "Afternoon", description: "Ribeira district walk" },
              { time: "Evening", description: "Port tasting in Vila Nova de Gaia" },
            ],
          },
          {
            day: 6,
            location: "Porto",
            gettingThere: "Walk + metro inside the city",
            activities: [
              { time: "Morning", description: "Livraria Lello and Clérigos Tower" },
              { time: "Afternoon", description: "Douro river cruise" },
            ],
          },
          {
            day: 7,
            location: "Porto",
            gettingThere: "Return flight from Porto airport",
            activities: [
              { time: "Morning", description: "Bolhão Market and last coffee" },
            ],
          },
        ],
      };

      await db.trip.create({
        data: {
          userId: admin.id,
          country: "Portugal",
          duration: 7,
          groupType: "Couple",
          travelStyle: "Relaxed",
          interests: "food, coast, history",
          budgetEstimate: "1500",
          isCurated: true,
          curatedPriceInCents: 2900,
          isPublished: true,
          aiResponse: {
            create: {
              title: "7 Days in Portugal - Coast & Culture (Curated)",
              description:
                "A ready-made, hand-checked week across Lisbon, Sintra, Cascais and Porto. Buy it once, make it yours.",
              estimatedPrice: "29",
              duration: 7,
              budget: "1500",
              travelStyle: "Relaxed",
              country: "Portugal",
              interests: "food, coast, history",
              groupType: "Couple",
              tags: ["curated", "coastal", "food"],
              bestTimeToVisit: ["spring", "early autumn"],
              weatherInfo: ["mild, 15-25C most of the year"],
              location: { city: "Lisbon", coordinates: [38.7223, -9.1393] },
              images: [],
              itinerary: curatedItinerary,
            },
          },
        },
      });
    }
  }
}

main()
  .then(() => {
    console.log("Database seeded!");
    db.$disconnect();
  })
  .catch((error) => {
    console.error("Seed error:", error);
    db.$disconnect();
    process.exit(1);
  });
