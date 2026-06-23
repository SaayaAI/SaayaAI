import bcrypt from "bcryptjs";
import { prisma } from "../src/client.js";

const DEFAULT_PLANS = [
  {
    name: "Free",
    slug: "free",
    description: "Basic AI chat with daily limits",
    price: 0,
    limits: {
      messagesPerDay: 20,
      imagesPerDay: 0,
      pdfsPerDay: 0,
    },
    features: ["text_chat", "hindi_english"],
  },
  {
    name: "Basic",
    slug: "basic",
    description: "More messages plus news and weather",
    price: 299,
    limits: {
      messagesPerDay: 100,
      imagesPerDay: 5,
      pdfsPerDay: 2,
    },
    features: ["text_chat", "hindi_english", "news", "weather", "image_analysis"],
  },
  {
    name: "Pro",
    slug: "pro",
    description: "Full features including markets and greetings",
    price: 599,
    limits: {
      messagesPerDay: 500,
      imagesPerDay: 20,
      pdfsPerDay: 10,
    },
    features: [
      "text_chat",
      "hindi_english",
      "news",
      "weather",
      "image_analysis",
      "pdf_analysis",
      "markets",
      "emotion",
      "greetings",
    ],
  },
  {
    name: "Business",
    slug: "business",
    description: "All Pro features plus business assistant",
    price: 999,
    limits: {
      messagesPerDay: -1,
      imagesPerDay: 50,
      pdfsPerDay: 30,
    },
    features: [
      "text_chat",
      "hindi_english",
      "news",
      "weather",
      "image_analysis",
      "pdf_analysis",
      "markets",
      "emotion",
      "greetings",
      "business_assistant",
    ],
  },
];

async function main() {
  console.log("Seeding plans...");

  for (const plan of DEFAULT_PLANS) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        description: plan.description,
        price: plan.price,
        limits: plan.limits,
        features: plan.features,
      },
      create: plan,
    });
  }

  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@saayaai.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "changeme123";

  console.log("Seeding admin user...");

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "superadmin" },
    create: {
      email: adminEmail,
      passwordHash,
      role: "superadmin",
    },
  });

  console.log("Seed complete.");
  console.log(`  Plans: ${DEFAULT_PLANS.length}`);
  console.log(`  Admin: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
