import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        // Create permissions
        const permissions = await Promise.all([
            prisma.permission.create({ data: { name: "pipelineData.view", description: "View Pipeline Data" } }),
            prisma.permission.create({ data: { name: "pipelineData.edit", description: "Edit Pipeline Data" } }),
            prisma.permission.create({ data: { name: "pipelineData.export", description: "Export Pipeline Data" } }),
            prisma.permission.create({ data: { name: "flowRate.view", description: "View Flow Rates" } }),
            prisma.permission.create({ data: { name: "flowRate.edit", description: "Edit Flow Rates" } }),
            prisma.permission.create({ data: { name: "flowRate.analyze", description: "Analyze Flow Rates" } }),
            prisma.permission.create({ data: { name: "density.view", description: "View Density Analysis" } }),
            prisma.permission.create({ data: { name: "density.edit", description: "Edit Density Data" } }),
            prisma.permission.create({ data: { name: "density.analyze", description: "Analyze Density Data" } }),
            prisma.permission.create({ data: { name: "metricsTons.view", description: "View Metrics Tons" } }),
            prisma.permission.create({ data: { name: "metricsTons.edit", description: "Edit Metrics Tons" } }),
            prisma.permission.create({ data: { name: "metricsTons.analyze", description: "Analyze Metrics Tons" } }),
            prisma.permission.create({ data: { name: "readingLines.view", description: "View Reading Lines" } }),
            prisma.permission.create({ data: { name: "readingLines.input", description: "Input Readings" } }),
            prisma.permission.create({ data: { name: "readingLines.edit", description: "Edit Reading Lines" } }),
            prisma.permission.create({ data: { name: "readingLines.delete", description: "Delete Reading Lines" } }),
            prisma.permission.create({ data: { name: "flowMeters.view", description: "View Flow Meters" } }),
            prisma.permission.create({ data: { name: "flowMeters.configure", description: "Configure Flow Meters" } }),
            prisma.permission.create({ data: { name: "flowMeters.calibrate", description: "Calibrate Flow Meters" } }),
            prisma.permission.create({ data: { name: "dispatch.view", description: "View Dispatch Dashboard" } }),
            prisma.permission.create({ data: { name: "dispatch.manage", description: "Manage Dispatch Operations" } }),
            prisma.permission.create({ data: { name: "shipments.view", description: "View Shipments" } }),
            prisma.permission.create({ data: { name: "shipments.create", description: "Create Shipments" } }),
            prisma.permission.create({ data: { name: "shipments.edit", description: "Edit Shipments" } }),
            prisma.permission.create({ data: { name: "shipments.delete", description: "Delete Shipments" } }),
            prisma.permission.create({ data: { name: "tankage.view", description: "View Tankage" } }),
            prisma.permission.create({ data: { name: "tankage.update", description: "Update Tank Levels" } }),
            prisma.permission.create({ data: { name: "tankage.manage", description: "Manage Tanks" } }),
            prisma.permission.create({ data: { name: "reports.view", description: "View Reports" } }),
            prisma.permission.create({ data: { name: "reports.create", description: "Create Reports" } }),
            prisma.permission.create({ data: { name: "reports.export", description: "Export Reports" } }),
            prisma.permission.create({ data: { name: "reports.schedule", description: "Schedule Reports" } }),
            prisma.permission.create({ data: { name: "settings.view", description: "View Settings" } }),
            prisma.permission.create({ data: { name: "settings.edit", description: "Edit Settings" } }),
            prisma.permission.create({ data: { name: "settings.users", description: "Manage Users" } }),
            prisma.permission.create({ data: { name: "settings.roles", description: "Manage Roles" } }),
            prisma.permission.create({ data: { name: "users.view", description: "View Users" } }),
            prisma.permission.create({ data: { name: "users.create", description: "Create Users" } }),
            prisma.permission.create({ data: { name: "users.edit", description: "Edit Users" } }),
            prisma.permission.create({ data: { name: "users.delete", description: "Delete Users" } }),
            prisma.permission.create({ data: { name: "roles.view", description: "View Roles" } }),
            prisma.permission.create({ data: { name: "roles.create", description: "Create Roles" } }),
            prisma.permission.create({ data: { name: "roles.edit", description: "Edit Roles" } }),
            prisma.permission.create({ data: { name: "roles.delete", description: "Delete Roles" } }),
            prisma.permission.create({ data: { name: "roles.assign", description: "Assign Roles to Users" } }),
        ])

        console.log('Created permissions:', permissions.length)

        // Only permissions are seeded. Role creation is intentionally omitted.
    } catch (error) {
        console.error('Error seeding database:', error)
        throw error
    }
}

main()
    .catch((e) => {
        console.error('Failed to seed database:', e)
        process.exit(1)
    })
    .finally(async () => {
        console.log('Seeding completed.')
        await prisma.$disconnect()
    })
