import { prisma } from './lib/prisma'

async function main() {
  await prisma.$executeRawUnsafe('DELETE FROM PipelineProgress')
  await prisma.$executeRawUnsafe('DELETE FROM PipelineBatch')
  await prisma.$executeRawUnsafe('DELETE FROM PipelineYearlyStats')
  console.log('Tables cleared successfully')
}

main()
  .catch(console.error)
