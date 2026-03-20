const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const result = await prisma.$queryRaw`
    SELECT dc.name, c.name as column_name, o.name as table_name
    FROM sys.default_constraints dc 
    JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    JOIN sys.objects o ON dc.parent_object_id = o.object_id
    WHERE o.name IN ('PipelinePig', 'FuelInputEntry')
  `
  console.log(JSON.stringify(result, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
