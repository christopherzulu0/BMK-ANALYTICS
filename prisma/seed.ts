import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'



async function main() {
  // Clear existing data
  await prisma.pipelineData.deleteMany({});
  await prisma.readingLines.deleteMany({});
  await prisma.pipelinePig.deleteMany({});
  await prisma.pipelineBatch.deleteMany({});
  await prisma.pipelineYearlyStats.deleteMany({});
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
    throw new Error('Required roles not found');
  }

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      password: adminPassword,
      roleId: adminRole.id,
      DepartmentName: 'Management',
      location: 'Ndola',
      phone_number: '123456789',
      notes: 'Main administrator'
    },
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      roleId: adminRole.id,
      DepartmentName: 'Management',
      location: 'Ndola',
      phone_number: '123456789',
      notes: 'Main administrator'
    },
  });
  console.log('Created admin user:', admin.email);

  // Create DOE user
  const doePassword = await bcrypt.hash('doe123', 10);
  const doe = await prisma.user.upsert({
    where: { email: 'doe@example.com' },
    update: {
      password: doePassword,
      roleId: doeRole.id,
      DepartmentName: 'Operations',
      location: 'Tanzania',
      phone_number: '987654321',
      notes: 'DOE representative'
    },
    create: {
      name: 'DOE User',
      email: 'doe@example.com',
      password: doePassword,
      roleId: doeRole.id,
      DepartmentName: 'Operations',
      location: 'Tanzania',
      phone_number: '987654321',
      notes: 'DOE representative'
    },
  });
  console.log('Created DOE user:', doe.email);

  // Create dispatcher user
  const dispatcherPassword = await bcrypt.hash('dispatcher123', 10);
  const dispatcher = await prisma.user.upsert({
    where: { email: 'dispatcher@example.com' },
    update: {
      password: dispatcherPassword,
      roleId: dispatcherRole.id,
      DepartmentName: 'Dispatch',
      location: 'Kalonje',
      phone_number: '555666777',
      notes: 'Primary dispatcher'
    },
    create: {
      name: 'Dispatcher User',
      email: 'dispatcher@example.com',
      password: dispatcherPassword,
      roleId: dispatcherRole.id,
      DepartmentName: 'Dispatch',
      location: 'Kalonje',
      phone_number: '555666777',
      notes: 'Primary dispatcher'
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

  console.log(`Database seeded successfully with ${pipelineData.length} pipeline records.`);

  // --- Pipeline Infrastructure Seeding ---
  console.log('Seeding Pipeline Infrastructure (Facilities, Batches, Pigs)...');

  const pipelineStations = [
    { name: 'Single Point Mooring', shortName: 'SPM', type: 'Marine Terminal', km: 0, country: 'Tanzania', status: 'active', pressure: 42.5, flow: 1250, temp: 28.4 },
    { name: 'Kigamboni Pump Station', shortName: 'Kigamboni PS', type: 'Pump Station', km: 25, country: 'Tanzania', status: 'active', pressure: 65.2, flow: 1245, temp: 29.1 },
    { name: 'Chamakweza Pig Trap', shortName: 'Chamakweza', type: 'Pig Station', km: 85, country: 'Tanzania', status: 'idle', pressure: 58.4, flow: 1245, temp: 28.8 },
    { name: 'Morogoro Pump Station', shortName: 'Morogoro PS', type: 'Pump Station', km: 195, country: 'Tanzania', status: 'active', pressure: 62.1, flow: 1240, temp: 27.5 },
    { name: 'Melela Sub-Station', shortName: 'Melela', type: 'Sub-Station', km: 280, country: 'Tanzania', status: 'idle', pressure: 54.2, flow: 1240, temp: 27.2 },
    { name: "Elphon's Pass Pump Station", shortName: "Elphon's", type: 'Pump Station', km: 380, country: 'Tanzania', status: 'active', pressure: 68.4, flow: 1235, temp: 26.8 },
    { name: 'Ruaha Sub-Station', shortName: 'Ruaha', type: 'Sub-Station', km: 460, country: 'Tanzania', status: 'idle', pressure: 48.9, flow: 1235, temp: 26.5 },
    { name: 'Mtandika Sub-Station', shortName: 'Mtandika', type: 'Sub-Station', km: 530, country: 'Tanzania', status: 'idle', pressure: 45.1, flow: 1235, temp: 26.2 },
    { name: 'Ilula Sub-Station', shortName: 'Ilula', type: 'Sub-Station', km: 610, country: 'Tanzania', status: 'idle', pressure: 42.4, flow: 1235, temp: 25.9 },
    { name: 'Iringa Pump Station', shortName: 'Iringa PS', type: 'Pump Station', km: 700, country: 'Tanzania', status: 'active', pressure: 72.1, flow: 1230, temp: 25.4 },
    { name: 'Malangali Sub-Station', shortName: 'Malangali', type: 'Sub-Station', km: 810, country: 'Tanzania', status: 'idle', pressure: 51.2, flow: 1230, temp: 25.1 },
    { name: 'Mbalamaziwa Pig Station', shortName: 'Mbalamaziwa', type: 'Pig Station', km: 920, country: 'Tanzania', status: 'idle', pressure: 44.5, flow: 1230, temp: 24.8 },
    { name: 'Mbeya Pump Station', shortName: 'Mbeya PS', type: 'Pump Station', km: 1050, country: 'Tanzania', status: 'active', pressure: 64.8, flow: 1225, temp: 24.2 },
    { name: 'Chilolwa Pig Station', shortName: 'Chilolwa', type: 'Pig Station', km: 1180, country: 'Tanzania', status: 'idle', pressure: 41.2, flow: 1225, temp: 23.9 },
    { name: 'Chinsali Pump Station', shortName: 'Chinsali PS', type: 'Pump Station', km: 1380, country: 'Zambia', status: 'active', pressure: 66.4, flow: 1220, temp: 23.5 },
    { name: 'Danger Hill Station', shortName: 'Danger Hill', type: 'Pressure Station', km: 1450, country: 'Zambia', status: 'active', pressure: 38.2, flow: 1220, temp: 23.2 },
    { name: 'Kalonje Pump Station', shortName: 'Kalonje PS', type: 'Pump Station', km: 1520, country: 'Zambia', status: 'active', pressure: 69.1, flow: 1215, temp: 22.8 },
    { name: 'Ulilima Pig Station', shortName: 'Ulilima', type: 'Pig Station', km: 1590, country: 'Zambia', status: 'idle', pressure: 46.4, flow: 1215, temp: 22.5 },
    { name: 'Bwana Mkubwa Terminal', shortName: 'Bwana Mkubwa', type: 'Terminal', km: 1660, country: 'Zambia', status: 'active', pressure: 32.1, flow: 1210, temp: 22.1 },
    { name: 'Ndola Fuel Terminal', shortName: 'Ndola', type: 'Marine Terminal', km: 1710, country: 'Zambia', status: 'active', pressure: 28.4, flow: 1210, temp: 21.8 },
  ];

  for (const data of pipelineStations) {
    const facility = await prisma.facility.upsert({
      where: { name: data.name },
      update: {
        shortName: data.shortName,
        type: data.type,
        km: data.km,
        country: data.country,
        status: data.status,
        pressure: data.pressure,
        flow: data.flow,
        temp: data.temp,
      },
      create: {
        name: data.name,
        shortName: data.shortName,
        type: data.type,
        km: data.km,
        country: data.country,
        status: data.status,
        pressure: data.pressure,
        flow: data.flow,
        temp: data.temp,
      }
    });

    await prisma.station.upsert({
      where: { name: data.name },
      update: { facilityId: facility.id },
      create: { name: data.name, facilityId: facility.id }
    });
  }

  const yearlyData: Record<number, { throughput: number, delivered: number, batches: any[] }> = {
    2024: {
      throughput: 842.5,
      delivered: 812.2,
      batches: [
        { product: 'AGO', volume: 245000, startKm: 0, endKm: 450, color: 'bg-blue-500' },
        { product: 'PMS', volume: 185000, startKm: 450, endKm: 920, color: 'bg-orange-500' },
        { product: 'DPK', volume: 120000, startKm: 920, endKm: 1380, color: 'bg-yellow-500' },
        { product: 'AGO', volume: 210000, startKm: 1380, endKm: 1710, color: 'bg-blue-500' },
      ]
    },
    2026: {
      throughput: 910.0,
      delivered: 895.0,
      batches: [
        { product: 'AGO', volume: 300000, startKm: 0, endKm: 600, color: 'bg-blue-500' },
        { product: 'PMS', volume: 210000, startKm: 600, endKm: 1200, color: 'bg-orange-500' },
        { product: 'LSG', volume: 150000, startKm: 1200, endKm: 1710, color: 'bg-emerald-500' },
      ]
    }
  };

  for (const [year, data] of Object.entries(yearlyData)) {
    const yearInt = parseInt(year);
    await prisma.pipelineYearlyStats.upsert({
      where: { year: yearInt },
      update: { throughput: data.throughput, delivered: data.delivered },
      create: { year: yearInt, throughput: data.throughput, delivered: data.delivered }
    });

    for (const batch of data.batches) {
      await prisma.pipelineBatch.create({
        data: {
          year: yearInt,
          product: batch.product,
          volume: batch.volume,
          startKm: batch.startKm,
          endKm: batch.endKm,
          color: batch.color,
        }
      });
    }
  }

  const pigs = [
    { name: 'Cleaning Pig #1', position: 300, speed: 8, type: 'cleaning', launched: new Date(Date.now() - 1000 * 60 * 60 * 8) },
    { name: 'Inspection Pig #2', position: 950, speed: 5, type: 'inspection', launched: new Date(Date.now() - 1000 * 60 * 60 * 4) },
  ];

  for (const pig of pigs) {
    await prisma.pipelinePig.create({
      data: {
        name: pig.name,
        position: pig.position,
        speed: pig.speed,
        type: pig.type,
        launched: pig.launched,
        isActive: true
      }
    });
  }

  console.log('Pipeline Infrastructure seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
