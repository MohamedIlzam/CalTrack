import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { pipeline } from '@xenova/transformers';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Password123%40%23%24@localhost:5433/caltrack?schema=public',
});
const prisma = new PrismaClient({ adapter });

const sriLankanFoods = [
  { name: 'Chicken Kottu', category: 'Rice & Bread', unit: 'plate', gramEq: 450, kcal: 850, proteinG: 30, carbsG: 90, fatG: 40 },
  { name: 'String Hoppers', aliases: ['Indi Appam'], category: 'Rice & Bread', unit: 'piece', gramEq: 25, kcal: 25, proteinG: 0.4, carbsG: 5.5, fatG: 0.1 },
  { name: 'Hoppers', aliases: ['Appa'], category: 'Rice & Bread', unit: 'piece', gramEq: 45, kcal: 90, proteinG: 2, carbsG: 18, fatG: 1 },
  { name: 'Egg Hopper', aliases: ['Biththara Appa'], category: 'Rice & Bread', unit: 'piece', gramEq: 85, kcal: 160, proteinG: 8, carbsG: 18, fatG: 6 },
  { name: 'Pol Sambol', aliases: ['Coconut Sambol'], category: 'Sides', unit: 'tablespoon', gramEq: 15, kcal: 50, proteinG: 0.5, carbsG: 2, fatG: 4.5 },
  { name: 'Dhal Curry', aliases: ['Parippu', 'Lentil Curry'], category: 'Curries', unit: 'cup', gramEq: 150, kcal: 180, proteinG: 9, carbsG: 25, fatG: 5 },
  { name: 'Red Rice (Cooked)', category: 'Rice & Bread', unit: 'cup', gramEq: 160, kcal: 200, proteinG: 4, carbsG: 43, fatG: 1 },
  { name: 'White Rice (Samba)', category: 'Rice & Bread', unit: 'cup', gramEq: 160, kcal: 205, proteinG: 4, carbsG: 45, fatG: 0 },
  { name: 'Fish Ambul Thiyal', category: 'Curries', unit: 'piece', gramEq: 50, kcal: 80, proteinG: 12, carbsG: 2, fatG: 2 },
  { name: 'Vegetable Roti', category: 'Rice & Bread', unit: 'piece', gramEq: 80, kcal: 250, proteinG: 5, carbsG: 40, fatG: 8 },
  { name: 'Kiri Bath', aliases: ['Milk Rice'], category: 'Rice & Bread', unit: 'piece', gramEq: 100, kcal: 240, proteinG: 4, carbsG: 35, fatG: 9 },
  { name: 'Watalappam', category: 'Extras', unit: 'piece', gramEq: 100, kcal: 320, proteinG: 6, carbsG: 40, fatG: 16 },
];

async function main() {
  console.log('Loading AI embedding model (this may take a few seconds on first run)...');
  // Load the feature extraction pipeline
  const generateEmbedding = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  console.log('Clearing existing data...');
  await prisma.food.deleteMany({});
  await prisma.region.deleteMany({});
  
  console.log('Creating LK Region...');
  const region = await prisma.region.create({
    data: {
      id: 'LK',
      name: 'Sri Lanka',
      currency: 'LKR',
    }
  });

  console.log('Seeding Sri Lankan foods and generating embeddings...');
  for (const item of sriLankanFoods) {
    // Calculate values per 100g to adhere to normalized schema
    const multiplier = 100 / item.gramEq;
    
    const food = await prisma.food.create({
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
            isStandard: true
          }
        },
        aliases: item.aliases ? {
          create: item.aliases.map(alias => ({ aliasName: alias }))
        } : undefined
      }
    });

    // Generate vector embedding based on food name and aliases
    const searchString = `${item.name} ${item.aliases ? item.aliases.join(' ') : ''}`.toLowerCase();
    const output = await generateEmbedding(searchString, { pooling: 'mean', normalize: true });
    
    // Output is a Float32Array. We need to convert it to a standard array for Prisma/PostgreSQL.
    const embeddingArray = Array.from(output.data);
    const embeddingString = JSON.stringify(embeddingArray);

    // Insert the embedding using raw SQL since unsupported types (vector) require it
    await prisma.$executeRaw`
      INSERT INTO "FoodEmbedding" ("foodId", "embedding")
      VALUES (${food.id}::uuid, ${embeddingString}::vector)
    `;
    console.log(`- Seeded ${item.name}`);
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
