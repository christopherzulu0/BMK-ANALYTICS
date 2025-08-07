import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Creating default roles...');

        // Get role types
        const adminRoleType = await prisma.roleType.findUnique({ where: { name: 'admin' } });
        const doeRoleType = await prisma.roleType.findUnique({ where: { name: 'DOE' } });
        const dispatcherRoleType = await prisma.roleType.findUnique({ where: { name: 'dispatcher' } });

        if (!adminRoleType || !doeRoleType || !dispatcherRoleType) {
            console.error('Required role types not found. Please run roletypes.ts seed first.');
            process.exit(1);
        }

        // Fetch all permissions to use when creating roles
        const allPermissions = await prisma.permission.findMany();

        if (allPermissions.length === 0) {
            console.error('No permissions found. Please run the full permissions.ts script first.');
            process.exit(1);
        }

        // Admin role with all permissions
        const adminRole = await prisma.role.create({
            data: {
                name: "admin",
                description: "Administrator with full system access",
                isSystem: true,
                permissions: {
                    connect: allPermissions.map(p => ({ id: p.id }))
                },
                roleTypeId: adminRoleType.id
            }
        });
        console.log('Created admin role with all permissions');

        // DOE role with view permissions
        const doePermissions = allPermissions.filter(p =>
            p.name.includes('.view') ||
            p.name.includes('.export') ||
            p.name.includes('reports.')
        );

        const doeRole = await prisma.role.create({
            data: {
                name: "DOE",
                description: "Department of Energy role with view and reporting capabilities",
                isSystem: true,
                permissions: {
                    connect: doePermissions.map(p => ({ id: p.id }))
                },
                roleTypeId: doeRoleType.id
            }
        });
        console.log(`Created DOE role with ${doePermissions.length} permissions`);

        // Dispatcher role with operational permissions
        const dispatcherPermissions = allPermissions.filter(p =>
            p.name.includes('.view') ||
            p.name.includes('dispatch.') ||
            p.name.includes('readingLines.') ||
            p.name.includes('tankage.') ||
            p.name.includes('flowRate.view') ||
            p.name.includes('density.view') ||
            p.name.includes('metricsTons.view') ||
            p.name.includes('pipelineData.view') ||
            p.name.includes('reports.view') ||
            p.name.includes('reports.export')
        );

        const dispatcherRole = await prisma.role.create({
            data: {
                name: "dispatcher",
                description: "Dispatcher with operational access",
                isSystem: true,
                permissions: {
                    connect: dispatcherPermissions.map(p => ({ id: p.id }))
                },
                roleTypeId: dispatcherRoleType.id
            }
        });
        console.log(`Created dispatcher role with ${dispatcherPermissions.length} permissions`);

    } catch (error) {
        console.error('Error creating roles:', error)
        throw error
    }
}

main()
    .catch((e) => {
        console.error('Failed to create roles:', e)
        process.exit(1)
    })
    .finally(async () => {
        console.log('Role creation completed.')
        await prisma.$disconnect()
    })
