import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.pipelineData.deleteMany({});
  await prisma.readingLines.deleteMany({});
  console.log('Cleared existing data');

  // Seed users with different roles
  console.log('Seeding users with roles...');

  // Delete existing test users to avoid duplicates
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          'admin@example.com',
          'doe@example.com',
          'dispatcher@example.com',
        ],
      },
    },
  });

  // Find roles
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  const doeRole = await prisma.role.findUnique({ where: { name: 'DOE' } });
  const dispatcherRole = await prisma.role.findUnique({ where: { name: 'dispatcher' } });

  if (!adminRole || !doeRole || !dispatcherRole) {
    console.error('Required roles not found. Please run permissions.ts seed first.');
    process.exit(1);
  }

  // Find role types
  const adminRoleType = await prisma.roleType.findUnique({ where: { name: 'admin' } });
  const doeRoleType = await prisma.roleType.findUnique({ where: { name: 'DOE' } });
  const dispatcherRoleType = await prisma.roleType.findUnique({ where: { name: 'dispatcher' } });

  if (!adminRoleType || !doeRoleType || !dispatcherRoleType) {
    console.error('Required role types not found. Please run roletypes.ts seed first.');
    process.exit(1);
  }

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      roleType: 'admin', // Legacy field, kept for backward compatibility
      roleId: adminRole.id,
      roleTypeId: adminRoleType.id,
    },
  });
  console.log('Created admin user:', admin.email);

  // Create DOE user
  const doePassword = await bcrypt.hash('doe123', 10);
  const doe = await prisma.user.create({
    data: {
      name: 'DOE User',
      email: 'doe@example.com',
      password: doePassword,
      roleType: 'DOE', // Legacy field, kept for backward compatibility
      roleId: doeRole.id,
      roleTypeId: doeRoleType.id,
    },
  });
  console.log('Created DOE user:', doe.email);

  // Create dispatcher user
  const dispatcherPassword = await bcrypt.hash('dispatcher123', 10);
  const dispatcher = await prisma.user.create({
    data: {
      name: 'Dispatcher User',
      email: 'dispatcher@example.com',
      password: dispatcherPassword,
      roleType: 'dispatcher', // Legacy field, kept for backward compatibility
      roleId: dispatcherRole.id,
      roleTypeId: dispatcherRoleType.id,
    },
  });
  console.log('Created dispatcher user:', dispatcher.email);

  const pipelineData = [];
  // const readingLinesData = [];
  const startDate = new Date(2024, 7, 7); // August 7, 2024

  // Generate data for 30 days starting from August 7
  for (let day = 0; day < 30; day++) {
    // Generate hourly data for each day from 08:00 to 07:00 the next day
    for (let hour = 0; hour < 24; hour++) {
      // Create date for this specific day and hour
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + day);

      // Set hours from 08:00 to 07:00 the next day
      const currentHour = (hour + 8) % 24;
      date.setHours(currentHour, 0, 0, 0);

      // Adjust day if we've crossed to the next day (hours 0-7)
      if (currentHour < 8) {
        date.setDate(date.getDate() + 1);
      }

      // Randomize or slightly vary the values for each entry
      const baseReading = 42128.00 + (day * 2364.00);
      const hourlyFlow = 98.5;

      const openingReading = baseReading + (hour * hourlyFlow);
      const closingReading = openingReading + hourlyFlow;
      const totalFlowRate = hourlyFlow + Math.random() * 5;
      const averageFlowrate = hourlyFlow + (Math.random() * 2);
      const averageObsDensity = 0.82592 + (Math.random() * 0.0005);
      const averageTemp = 25.1 + (Math.random() * 2);
      const obsDen15 = 0.8294 + (Math.random() * 0.001);
      const kgInAirPerLitre = 0.8283 + (Math.random() * 0.001);
      const metricTons = 81.25 + (Math.random() * 5); // Hourly metric tons
      const calcAverageTemperature = 25 + Math.random();
      const status = ""; // Adjust status if needed
      const totalObsDensity = 19.822 + (Math.random() * 0.05);
      const volumeReductionFactor = 0.9958 + (Math.random() * 0.001);
      const volume20 = 98.1 + (Math.random() * 5); // Hourly volume

      // Push the generated data to the pipelineData array
      pipelineData.push({
        date,
        openingReading,
        closingReading,
        totalFlowRate,
        averageFlowrate,
        averageObsDensity,
        averageTemp,
        obsDen15,
        kgInAirPerLitre,
        metricTons,
        calcAverageTemperature,
        totalObsDensity,
        volumeReductionFactor,
        volume20
      });

      // Generate ReadingLines data for both lines
      // for (let lineNo = 1; lineNo <= 2; lineNo++) {
      //   // Format the reading time as a string (HH:mm)
      //   const readingTime = `${currentHour.toString().padStart(2, '0')}:00`;

      //   // Generate slightly different values for each line
      //   const lineFactor = lineNo === 1 ? 1.0 : 1.05; // Line 2 has slightly higher values
      //   const flowMeter = openingReading * lineFactor + (Math.random() * 10);
      //   const previousFlowMeter = flowMeter - (hourlyFlow * lineFactor);
      //   const flowRate = hourlyFlow * lineFactor + (Math.random() * 2);

      //   readingLinesData.push({
      //     date,
      //     lineNo,
      //     reading: readingTime,
      //     flowMeter1: lineNo === 1 ? flowMeter : previousFlowMeter,
      //     flowMeter2: lineNo === 2 ? flowMeter : previousFlowMeter,
      //     flowRate1: lineNo === 1 ? flowRate : flowRate * 0.95,
      //     flowRate2: lineNo === 2 ? flowRate : flowRate * 0.95,
      //     sampleTemp: averageTemp + (Math.random() - 0.5),
      //     obsDensity: averageObsDensity + (Math.random() * 0.0002),
      //     kgInAirPerLitre: kgInAirPerLitre + (Math.random() * 0.0002),
      //     remarks: "",
      //     check: "",
      //     previousReadingMeter1: lineNo === 1 ? previousFlowMeter : previousFlowMeter * 0.95,
      //     previousReadingMeter2: lineNo === 2 ? previousFlowMeter : previousFlowMeter * 0.95
      //   });
      // }
    }
  }

  // Insert data into the database
  console.log(`Inserting ${pipelineData.length} pipeline records  into the database...`);

  for (const data of pipelineData) {
    await prisma.pipelineData.create({
      data: data,
    });
  }

  // for (const data of readingLinesData) {
  //   await prisma.readingLines.create({
  //     data: data,
  //   });
  // }

  console.log(`Database seeded successfully with ${pipelineData.length} pipeline records  (30 days of hourly data from 08:00 to 07:00)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
