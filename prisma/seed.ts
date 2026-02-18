import { PrismaClient } from '@prisma/client';
import { menuItemsSeed } from './seed-data/menu-items';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding menu items...');
  for (const item of menuItemsSeed) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        category: item.category,
      },
      create: {
        id: item.id,
        name: item.name,
        category: item.category,
      },
    });
  }
  console.log(`Seeding completed. Inserted/updated ${menuItemsSeed.length} items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
