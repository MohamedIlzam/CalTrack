import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { pipeline } from '@xenova/transformers';

const dbUrl =
  process.env.DIRECT_DATABASE_URL ||
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV === 'production'
    ? ''
    : 'postgresql://postgres:Password123%40%23%24@localhost:5433/caltrack?schema=public');

if (!dbUrl) {
  throw new Error(
    'FATAL: DATABASE_URL environment variable is required in production mode.',
  );
}

const adapter = new PrismaPg({
  connectionString: dbUrl,
});
const prisma = new PrismaClient({ adapter });

const sriLankanFoods = [
  {
    name: 'Chicken Kottu',
    aliases: ['Kottu Roti', 'කොත්තු', 'கொத்து ரொட்டி'],
    category: 'Rice & Bread',
    unit: 'plate',
    gramEq: 450,
    kcal: 850,
    proteinG: 30,
    carbsG: 90,
    fatG: 40,
  },
  {
    name: 'Egg Kottu',
    aliases: ['Biththara Kottu', 'බිත්තර කොත්තු'],
    category: 'Rice & Bread',
    unit: 'plate',
    gramEq: 400,
    kcal: 680,
    proteinG: 22,
    carbsG: 85,
    fatG: 28,
  },
  {
    name: 'String Hoppers',
    aliases: ['Indi Appam', 'ඉඳිආප්ප', 'இடியாப்பம்'],
    category: 'Rice & Bread',
    unit: 'piece',
    gramEq: 25,
    kcal: 25,
    proteinG: 0.4,
    carbsG: 5.5,
    fatG: 0.1,
  },
  {
    name: 'Hoppers',
    aliases: ['Appa', 'ආප්ප', 'ஆப்பம்'],
    category: 'Rice & Bread',
    unit: 'piece',
    gramEq: 45,
    kcal: 90,
    proteinG: 2,
    carbsG: 18,
    fatG: 1,
  },
  {
    name: 'Egg Hopper',
    aliases: ['Biththara Appa', 'බිත්තර ආප්ප'],
    category: 'Rice & Bread',
    unit: 'piece',
    gramEq: 85,
    kcal: 160,
    proteinG: 8,
    carbsG: 18,
    fatG: 6,
  },
  {
    name: 'Pol Roti',
    aliases: ['Coconut Roti', 'පොල් රොටී', 'தேங்காய் ரொட்டி'],
    category: 'Rice & Bread',
    unit: 'piece',
    gramEq: 80,
    kcal: 210,
    proteinG: 4,
    carbsG: 28,
    fatG: 9,
  },
  {
    name: 'Vegetable Roti',
    aliases: ['Elawalu Roti', 'එළවළු රොටී'],
    category: 'Rice & Bread',
    unit: 'piece',
    gramEq: 80,
    kcal: 250,
    proteinG: 5,
    carbsG: 40,
    fatG: 8,
  },
  {
    name: 'Kiri Bath',
    aliases: ['Milk Rice', 'කිරිබත්', 'பால் சோறு'],
    category: 'Rice & Bread',
    unit: 'piece',
    gramEq: 100,
    kcal: 240,
    proteinG: 4,
    carbsG: 35,
    fatG: 9,
  },
  {
    name: 'Pittu',
    aliases: ['Mani Pittu', 'පිට්ටු', 'புட்டு'],
    category: 'Rice & Bread',
    unit: 'piece',
    gramEq: 120,
    kcal: 230,
    proteinG: 5,
    carbsG: 48,
    fatG: 2,
  },
  {
    name: 'Red Rice (Cooked)',
    aliases: ['Rathu Kakulu Bath', 'රතු කැකුළු බත්'],
    category: 'Rice & Bread',
    unit: 'cup',
    gramEq: 160,
    kcal: 200,
    proteinG: 4,
    carbsG: 43,
    fatG: 1,
  },
  {
    name: 'White Rice (Samba)',
    aliases: ['Samba Bath', 'සම්බා බත්'],
    category: 'Rice & Bread',
    unit: 'cup',
    gramEq: 160,
    kcal: 205,
    proteinG: 4,
    carbsG: 45,
    fatG: 0.5,
  },
  {
    name: 'Dhal Curry',
    aliases: ['Parippu', 'Lentil Curry', 'පරිප්පු හොදි', 'பருப்பு கறி'],
    category: 'Curries',
    unit: 'cup',
    gramEq: 150,
    kcal: 180,
    proteinG: 9,
    carbsG: 25,
    fatG: 5,
  },
  {
    name: 'Chicken Curry',
    aliases: ['Kukul Mas Curry', 'කුකුල් මස් කරිය', 'கோழி கறி'],
    category: 'Curries',
    unit: 'piece',
    gramEq: 120,
    kcal: 220,
    proteinG: 24,
    carbsG: 4,
    fatG: 12,
  },
  {
    name: 'Fish Curry',
    aliases: ['Malu Curry', 'මාළු කරිය', 'மீன் கறி'],
    category: 'Curries',
    unit: 'piece',
    gramEq: 100,
    kcal: 165,
    proteinG: 18,
    carbsG: 5,
    fatG: 8,
  },
  {
    name: 'Fish Ambul Thiyal',
    aliases: ['Sour Fish Curry', 'ඇඹුල් තියල්'],
    category: 'Curries',
    unit: 'piece',
    gramEq: 50,
    kcal: 80,
    proteinG: 12,
    carbsG: 2,
    fatG: 2,
  },
  {
    name: 'Jackfruit Curry',
    aliases: ['Polos Curry', 'පොලොස් කරිය', 'பலாக்காய் கறி'],
    category: 'Curries',
    unit: 'cup',
    gramEq: 150,
    kcal: 145,
    proteinG: 2.5,
    carbsG: 30,
    fatG: 2,
  },
  {
    name: 'Pol Sambol',
    aliases: ['Coconut Sambol', 'පොල් සම්බෝල', 'தேங்காய் சம்பல்'],
    category: 'Sides',
    unit: 'tablespoon',
    gramEq: 15,
    kcal: 50,
    proteinG: 0.5,
    carbsG: 2,
    fatG: 4.5,
  },
  {
    name: 'Lunu Miris',
    aliases: ['Katta Sambol', 'ලුණු මිරිස්'],
    category: 'Sides',
    unit: 'teaspoon',
    gramEq: 10,
    kcal: 30,
    proteinG: 0.7,
    carbsG: 4,
    fatG: 1,
  },
  {
    name: 'Gotu Kola Sambol',
    aliases: ['Gotu Kola Mallum', 'ගොටුකොළ සම්බෝල', 'வல்லாரை சம்பல்'],
    category: 'Sides',
    unit: 'cup',
    gramEq: 60,
    kcal: 55,
    proteinG: 1.5,
    carbsG: 6,
    fatG: 2.5,
  },
  {
    name: 'Tempered Potato',
    aliases: ['Ala Baduma', 'Ala Theldala', 'අල තෙල්දාලා'],
    category: 'Sides',
    unit: 'cup',
    gramEq: 120,
    kcal: 155,
    proteinG: 2.5,
    carbsG: 28,
    fatG: 4,
  },
  {
    name: 'Papadam',
    aliases: ['Papad', 'පපඩම්', 'அப்பளம்'],
    category: 'Sides',
    unit: 'piece',
    gramEq: 15,
    kcal: 50,
    proteinG: 2,
    carbsG: 8,
    fatG: 1,
  },
  {
    name: 'Fish Bun',
    aliases: ['Maalu Paan', 'මාළු පාන්'],
    category: 'Rice & Bread',
    unit: 'piece',
    gramEq: 100,
    kcal: 260,
    proteinG: 8,
    carbsG: 36,
    fatG: 9,
  },
  {
    name: 'Ulundu Vadai',
    aliases: ['Medu Vada', 'උළුඳු වඩේ', 'உளுந்து வடை'],
    category: 'Extras',
    unit: 'piece',
    gramEq: 60,
    kcal: 175,
    proteinG: 4,
    carbsG: 16,
    fatG: 11,
  },
  {
    name: 'Boiled Egg',
    aliases: ['Thambapu Biththara', 'තැම්බූ බිත්තර'],
    category: 'Extras',
    unit: 'piece',
    gramEq: 50,
    kcal: 78,
    proteinG: 6.3,
    carbsG: 0.6,
    fatG: 5.3,
  },
  {
    name: 'Watalappam',
    aliases: ['Watalappan', 'වටලප්පන්'],
    category: 'Extras',
    unit: 'piece',
    gramEq: 100,
    kcal: 320,
    proteinG: 6,
    carbsG: 40,
    fatG: 16,
  },
  {
    name: 'Banana (Ambul)',
    aliases: ['Ambul Kesel', 'ඇඹුල් කෙසෙල්'],
    category: 'Extras',
    unit: 'piece',
    gramEq: 80,
    kcal: 75,
    proteinG: 0.9,
    carbsG: 19,
    fatG: 0.2,
  },
];

async function main() {
  console.log(
    'Loading AI embedding model (this may take a few seconds on first run)...',
  );
  // Load the feature extraction pipeline
  const generateEmbedding = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
  );

  console.log('Ensuring LK Region exists...');
  const region = await prisma.region.upsert({
    where: { id: 'LK' },
    update: {},
    create: {
      id: 'LK',
      name: 'Sri Lanka',
      currency: 'LKR',
    },
  });

  console.log(
    'Seeding Sri Lankan foods and generating embeddings idempotently...',
  );
  for (const item of sriLankanFoods) {
    const existing = await prisma.food.findFirst({
      where: { name: item.name, regionId: region.id },
    });
    let food = existing;
    if (!food) {
      // Calculate values per 100g to adhere to normalized schema
      const multiplier = 100 / item.gramEq;
      food = await prisma.food.create({
        data: {
          regionId: region.id,
          name: item.name,
          category: item.category,
          isVerified: true,
          caloriesKcal: item.kcal * multiplier,
          proteinG: item.proteinG * multiplier,
          carbohydratesG: item.carbsG * multiplier,
          fatG: item.fatG * multiplier,
          unitConversions: {
            create: {
              unitName: item.unit,
              gramEquivalent: item.gramEq,
              isStandard: true,
            },
          },
          aliases: item.aliases
            ? {
                create: item.aliases.map((alias) => ({ aliasName: alias })),
              }
            : undefined,
        },
      });
    }

    const existingEmbedding = await prisma.foodEmbedding.findUnique({
      where: { foodId: food.id },
    });
    if (existingEmbedding) {
      console.log(`- Food already seeded: ${item.name}`);
      continue;
    }

    // Generate vector embedding based on food name and aliases
    const searchString =
      `${item.name} ${item.aliases ? item.aliases.join(' ') : ''}`.toLowerCase();
    const output = await generateEmbedding(searchString, {
      pooling: 'mean',
      normalize: true,
    });

    // Output is a Float32Array. We need to convert it to a standard array for Prisma/PostgreSQL.
    const embeddingArray = Array.from(output.data);
    const embeddingString = JSON.stringify(embeddingArray);

    // Insert the embedding using raw SQL since unsupported types (vector) require it
    await prisma.$executeRaw`
      INSERT INTO "FoodEmbedding" ("foodId", "embedding")
      VALUES (${food.id}, ${embeddingString}::vector)
    `;
    console.log(`- Seeded or repaired ${item.name}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
