import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.$executeRawUnsafe('DELETE FROM PipelineProgress')
  await prisma.$executeRawUnsafe('DELETE FROM PipelineBatch')
  await prisma.$executeRawUnsafe('DELETE FROM PipelineYearlyStats')
  console.log('Tables cleared successfully')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
