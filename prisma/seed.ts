import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MOCK_MENU = [
  { name: 'Χωριάτικη Σαλάτα', category: 'Κρύα' },
  { name: 'Πράσινη Σαλάτα', category: 'Κρύα' },
  { name: 'Ρόκα με Παρμεζάνα', category: 'Κρύα' },
  { name: 'Καίσαρ', category: 'Κρύα' },
  { name: 'Ντοματοσαλάτα', category: 'Κρύα' },
  { name: 'Ζεστή Σαλάτα με Κοτόπουλο', category: 'Ζεστές' },
  { name: 'Σαλάτα με Γαρίδες', category: 'Ζεστές' },
  { name: 'Μπριζόλα Χοιρινή', category: 'Ψησταριά' },
  { name: 'Μπριζόλα Μοσχαρίσια', category: 'Ψησταριά' },
  { name: 'Κοτόπουλο Φιλέτο', category: 'Ψησταριά' },
  { name: 'Μπιφτέκι', category: 'Ψησταριά' },
  { name: 'Σουβλάκι Χοιρινό', category: 'Ψησταριά' },
  { name: 'Σουβλάκι Κοτόπουλο', category: 'Ψησταριά' },
  { name: 'Μουσακάς', category: 'Μαγειρευτό' },
  { name: 'Παστίτσιο', category: 'Μαγειρευτό' },
  { name: 'Παπουτσάκια', category: 'Μαγειρευτό' },
  { name: 'Γιουβέτσι', category: 'Μαγειρευτό' },
  { name: 'Κοκκινιστό', category: 'Μαγειρευτό' },
  { name: 'Κόκα Κόλα', category: 'Ποτά' },
  { name: 'Σπράιτ', category: 'Ποτά' },
  { name: 'Φάντα', category: 'Ποτά' },
  { name: 'Νερό', category: 'Ποτά' },
  { name: 'Μπύρα', category: 'Ποτά' },
  { name: 'Κρασί Λευκό', category: 'Ποτά' },
  { name: 'Κρασί Κόκκινο', category: 'Ποτά' },
  { name: 'Καφές', category: 'Ποτά' },
];

async function main() {
  console.log('Seeding menu items...');
  for (const item of MOCK_MENU) {
    await prisma.menuItem.create({
      data: item,
    });
  }
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
