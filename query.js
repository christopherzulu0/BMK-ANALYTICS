const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const records = await prisma.pipelineProgress.findMany({
    orderBy: { date: 'asc' }
  });
  console.dir(records, { depth: null });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
