import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Default tank data from Tank 1 to Tank 6
const defaultTanks = [
  {
    id: "T1",
    name: "Tank 1",
    capacity: 53000,
    product: "Diesel(LSG)",
    location: "Ndola",
    lastInspection: new Date("2025-02-15"),
  },
  {
    id: "T2",
    name: "Tank 2",
    capacity: 25000,
    product: "Diesel(LSG)",
    location: "Ndola",
    lastInspection: new Date("2025-02-20"),
  },
  {
    id: "T3",
    name: "Tank 3",
    capacity: 45000,
    product: "Diesel(LSG)",
    location: "Ndola",
    lastInspection: new Date("2025-03-01"),
  },
  {
    id: "T4",
    name: "Tank 4",
    capacity: 2000,
    product: "Diesel(LSG)",
    location: "Ndola",
    lastInspection: new Date("2025-03-05"),
  },
  {
    id: "T5",
    name: "Tank 5",
    capacity: 2000,
    product: "Diesel(LSG)",
    location: "Ndola",
    lastInspection: new Date("2025-02-25"),
  },
  {
    id: "T6",
    name: "Tank 6",
    capacity: 2000,
    product: "Diesel(LSG)",
    location: "Ndola",
    lastInspection: new Date("2025-03-10"),
  },
]

// Initial tank levels for the Tankage model
const initialTankage = {
  date: new Date(),
  T1: 65,
  T2: 60,
  T3: 85,
  T4: 55,
  T5: 70,
  T6: 45,
  notes: "Initial tank levels from migration script",
}

async function main() {
  console.log("Starting tank migration and seeding...")

  try {
    // --- Tank Seeding (Upsert Logic) ---
    console.log("Upserting default tanks...")
    for (const tankData of defaultTanks) {
      await prisma.tank.upsert({
        where: { id: tankData.id }, // Find by id
        update: tankData,           // Data to update if found
        create: tankData,           // Data to create if not found
      });
      console.log(`Upserted tank: ${tankData.name} (${tankData.id})`);
    }
    console.log("Default tanks upserted successfully.")

    // --- Tankage Seeding (Create if not exists) ---
    // Check if there's any existing tankage record
    const existingTankage = await prisma.tankage.findFirst({
      orderBy: {
        date: 'desc'
      }
    })

    if (!existingTankage) {
      console.log("No existing tankage records found. Creating initial tankage record...")

      // Create initial tankage record
      await prisma.tankage.create({
        data: initialTankage
      })

      console.log("Created initial tankage record with default levels")
    } else {
      console.log("Existing tankage records found. Skipping initial tankage record creation.")
    }

    console.log("Tank migration and seeding completed successfully!")
  } catch (error) {
    console.error("Error during tank migration and seeding:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })