import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Seeding role types...')

        // Instead of deleting, use upsert to update existing or create new role types
        // This preserves the relationships with User records

        // Create or update default role types
        const roleTypes = await Promise.all([
            prisma.role.upsert({
                where: { name: 'admin' },
                update: {
                    description: 'Administrator role with full system access'
                },
            
                create: {
                    name: 'admin',
                    description: 'Administrator role with full system access'
                }
            }),
            prisma.role.upsert({
                where: { name: 'DOE' },
                update: {
                    description: 'Department of Energy role with view and reporting capabilities'
                },
                create: {
                    name: 'DOE',
                    description: 'Department of Energy role with view and reporting capabilities'
                }
            }),
            prisma.role.upsert({
                where: { name: 'dispatcher' },
                update: {
                    description: 'Dispatcher role with operational access'
                },
                create: {
                    name: 'dispatcher',
                    description: 'Dispatcher role with operational access'
                }
            })
        ])


        //Create or update the default roles
        // const roles = await Promise.all([
        //     prisma.role.upsert({
        //         where: { name: 'admin' },
        //         update: {
        //             description: 'Administrator role with full system access'
        //         },
            
        //         create: {
        //             name: 'admin',
        //             description: 'Administrator role with full system access'
        //         }
        //     }),
        //     prisma.role.upsert({
        //         where: { name: 'DOE' },
        //         update: {
        //             description: 'Department of Energy role with view and reporting capabilities'
        //         },
        //         create: {
        //             name: 'DOE',
        //             description: 'Department of Energy role with view and reporting capabilities'
        //         }
        //     }),
        //     prisma.role.upsert({
        //         where: { name: 'dispatcher' },
        //         update: {
        //             description: 'Dispatcher role with operational access'
        //         },
        //         create: {
        //             name: 'dispatcher',
        //             description: 'Dispatcher role with operational access'
        //         }
        //     })
        // ])

        console.log(`Created ${roleTypes.length} role types:`)
        roleTypes.forEach((type: { name: string, description: string | null }) => {
            console.log(`- ${type.name}: ${type.description}`)
        })

        // console.log(`Created ${roles.length} roles:`)
        // roles.forEach((type: { name: string, description: string | null }) => {
        //     console.log(`- ${type.name}: ${type.description}`)
        // })

    } catch (error) {
        console.error('Error seeding role types:', error)
        throw error
    }
}

main()
    .catch((e) => {
        console.error('Failed to seed role types:', e)
        process.exit(1)
    })
    .finally(async () => {
        console.log('Role types seeding completed.')
        await prisma.$disconnect()
    })
