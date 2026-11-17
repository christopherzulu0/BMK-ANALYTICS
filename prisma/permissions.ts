import { prisma } from '../lib/prisma'

async function main() {
    try {
        console.log('Seeding permissions...')
        // Define permissions to seed
        const permissionData = [
            { name: "pipelineData.view", description: "View Pipeline Data" },
            { name: "pipelineData.edit", description: "Edit Pipeline Data" },
            { name: "pipelineData.export", description: "Export Pipeline Data" },
            { name: "flowRate.view", description: "View Flow Rates" },
            { name: "flowRate.edit", description: "Edit Flow Rates" },
            { name: "flowRate.analyze", description: "Analyze Flow Rates" },
            { name: "density.view", description: "View Density Analysis" },
            { name: "density.edit", description: "Edit Density Data" },
            { name: "density.analyze", description: "Analyze Density Data" },
            { name: "metricsTons.view", description: "View Metrics Tons" },
            { name: "metricsTons.edit", description: "Edit Metrics Tons" },
            { name: "metricsTons.analyze", description: "Analyze Metrics Tons" },
            { name: "readingLines.view", description: "View Reading Lines" },
            { name: "readingLines.input", description: "Input Readings" },
            { name: "readingLines.edit", description: "Edit Reading Lines" },
            { name: "readingLines.delete", description: "Delete Reading Lines" },
            { name: "flowMeters.view", description: "View Flow Meters" },
            { name: "flowMeters.configure", description: "Configure Flow Meters" },
            { name: "flowMeters.calibrate", description: "Calibrate Flow Meters" },
            { name: "dispatch.view", description: "View Dispatch Dashboard" },
            { name: "dispatch.manage", description: "Manage Dispatch Operations" },
            { name: "shipments.view", description: "View Shipments" },
            { name: "shipments.create", description: "Create Shipments" },
            { name: "shipments.edit", description: "Edit Shipments" },
            { name: "shipments.delete", description: "Delete Shipments" },
            { name: "tankage.view", description: "View Tankage" },
            { name: "tankage.update", description: "Update Tank Levels" },
            { name: "tankage.manage", description: "Manage Tanks" },
            { name: "reports.view", description: "View Reports" },
            { name: "reports.create", description: "Create Reports" },
            { name: "reports.export", description: "Export Reports" },
            { name: "reports.schedule", description: "Schedule Reports" },
            { name: "settings.view", description: "View Settings" },
            { name: "settings.edit", description: "Edit Settings" },
            { name: "settings.users", description: "Manage Users" },
            { name: "settings.roles", description: "Manage Roles" },
            { name: "users.view", description: "View Users" },
            { name: "users.create", description: "Create Users" },
            { name: "users.edit", description: "Edit Users" },
            { name: "users.delete", description: "Delete Users" },
            { name: "roles.view", description: "View Roles" },
            { name: "roles.create", description: "Create Roles" },
            { name: "roles.edit", description: "Edit Roles" },
            { name: "roles.delete", description: "Delete Roles" },
            { name: "roles.assign", description: "Assign Roles to Users" },
        ]

        const permissions = await Promise.all(
            permissionData.map(p => 
                prisma.permission.upsert({
                    where: { name: p.name },
                    update: { description: p.description },
                    create: p
                })
            )
        )

        console.log('Seeded permissions:', permissions.length)
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
