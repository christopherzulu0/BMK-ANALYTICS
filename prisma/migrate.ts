import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Starting database migration...')

        // Generate migration
        console.log('Generating migration...')
        await execAsync('npx prisma migrate dev --name add_role_types')

        console.log('Migration completed successfully.')
        console.log('\nTo complete the setup, run the following commands in order:')
        console.log('1. npx ts-node prisma/roletypes.ts')
        console.log('2. npx ts-node prisma/permissions.ts')
        console.log('3. npx ts-node prisma/seed.ts')
        console.log('\nThis will create the role types, roles, and users with the appropriate relationships.')

    } catch (error) {
        console.error('Error during migration:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
    .catch((e) => {
        console.error('Migration failed:', e)
        process.exit(1)
    })
