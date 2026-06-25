import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || 'postgresql://myuser:mypassword@localhost:5432/caltrack',
});
const prisma = new PrismaClient({ adapter });

const sriLankanFoods = [
  { name: 'Chicken Kottu', category: 'Rice & Bread', serving: '1 portion (approx 400g)', kcal: 850, proteinG: 30, carbsG: 90, fatG: 40, isCustom: false },
  { name: 'String Hoppers (Indi Appam)', category: 'Rice & Bread', serving: '10 pieces', kcal: 250, proteinG: 4, carbsG: 55, fatG: 1, isCustom: false },
  { name: 'Hoppers (Appa)', category: 'Rice & Bread', serving: '1 plain hopper', kcal: 90, proteinG: 2, carbsG: 18, fatG: 1, isCustom: false },
  { name: 'Egg Hopper (Biththara Appa)', category: 'Rice & Bread', serving: '1 egg hopper', kcal: 160, proteinG: 8, carbsG: 18, fatG: 6, isCustom: false },
  { name: 'Pol Sambol', category: 'Sides', serving: '2 tablespoons', kcal: 100, proteinG: 1, carbsG: 4, fatG: 9, isCustom: false },
  { name: 'Dhal Curry (Parippu)', category: 'Curries', serving: '1 cup (approx 150g)', kcal: 180, proteinG: 9, carbsG: 25, fatG: 5, isCustom: false },
  { name: 'Red Rice (Cooked)', category: 'Rice & Bread', serving: '1 cup (approx 160g)', kcal: 200, proteinG: 4, carbsG: 43, fatG: 1, isCustom: false },
  { name: 'White Rice (Samba)', category: 'Rice & Bread', serving: '1 cup (approx 160g)', kcal: 205, proteinG: 4, carbsG: 45, fatG: 0, isCustom: false },
  { name: 'Fish Ambul Thiyal', category: 'Curries', serving: '1 piece (approx 50g)', kcal: 80, proteinG: 12, carbsG: 2, fatG: 2, isCustom: false },
  { name: 'Fish Rolls (Short Eats)', category: 'Extras', serving: '1 roll', kcal: 220, proteinG: 8, carbsG: 20, fatG: 12, isCustom: false },
  { name: 'Vegetable Roti', category: 'Rice & Bread', serving: '1 roti', kcal: 250, proteinG: 5, carbsG: 40, fatG: 8, isCustom: false },
  { name: 'Kiri Bath (Milk Rice)', category: 'Rice & Bread', serving: '1 piece (approx 100g)', kcal: 240, proteinG: 4, carbsG: 35, fatG: 9, isCustom: false },
  { name: 'Lunu Miris', category: 'Sides', serving: '1 tablespoon', kcal: 15, proteinG: 0, carbsG: 3, fatG: 0, isCustom: false },
  { name: 'Munchee Super Cream Cracker', category: 'Extras', serving: '1 biscuit (approx 8.5g)', kcal: 42, proteinG: 1, carbsG: 6, fatG: 1.5, isCustom: false },
  { name: 'Milo (RTD Pack)', category: 'Extras', serving: '200ml pack', kcal: 150, proteinG: 4.5, carbsG: 22, fatG: 4, isCustom: false },
  { name: 'Anchor Full Cream Milk Powder', category: 'Extras', serving: '2 tablespoons (approx 25g)', kcal: 130, proteinG: 6, carbsG: 10, fatG: 7, isCustom: false },
  { name: 'Samaposha', category: 'Extras', serving: '100g', kcal: 400, proteinG: 14, carbsG: 65, fatG: 8, isCustom: false },
  { name: 'Koththu Meesi (Chicken)', category: 'Rice & Bread', serving: '1 packet (approx 80g)', kcal: 360, proteinG: 8, carbsG: 50, fatG: 14, isCustom: false },
  { name: 'Chicken Curry (Sri Lankan)', category: 'Curries', serving: '1 portion (approx 100g)', kcal: 160, proteinG: 15, carbsG: 2, fatG: 10, isCustom: false },
  { name: 'Malu Paan (Fish Bun)', category: 'Extras', serving: '1 bun', kcal: 240, proteinG: 9, carbsG: 35, fatG: 7, isCustom: false },
  { name: 'Pittu', category: 'Rice & Bread', serving: '1 piece (approx 100g)', kcal: 210, proteinG: 3, carbsG: 45, fatG: 2, isCustom: false },
  { name: 'Gotukola Sambol', category: 'Sides', serving: '1/2 cup', kcal: 60, proteinG: 1, carbsG: 3, fatG: 5, isCustom: false },
  { name: 'Watalappam', category: 'Extras', serving: '1 piece (approx 100g)', kcal: 320, proteinG: 6, carbsG: 40, fatG: 16, isCustom: false },
];

async function main() {
  console.log('Clearing existing system foods...');
  await prisma.foodItem.deleteMany({
    where: { isCustom: false }
  });

  console.log('Seeding Sri Lankan foods...');
  await prisma.foodItem.createMany({
    data: sriLankanFoods
  });

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
