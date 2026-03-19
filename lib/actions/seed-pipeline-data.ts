import { prisma } from '@/lib/prisma'

const pipelineStations = [
  // Tanzania Section (Start - Source)
  { id: 'spm', name: 'Single Point Mooring', shortName: 'SPM', type: 'Marine Terminal', km: 0, country: 'Tanzania', status: 'active', pressure: 42.5, flow: 1250, temp: 28.4 },
  { id: 'kigamboni-pump', name: 'Kigamboni Pump Station', shortName: 'Kigamboni PS', type: 'Pump Station', km: 25, country: 'Tanzania', status: 'active', pressure: 65.2, flow: 1245, temp: 29.1 },
  { id: 'chamakweza', name: 'Chamakweza Pig Trap', shortName: 'Chamakweza', type: 'Pig Station', km: 85, country: 'Tanzania', status: 'idle', pressure: 58.4, flow: 1245, temp: 28.8 },
  { id: 'morogoro', name: 'Morogoro Pump Station', shortName: 'Morogoro PS', type: 'Pump Station', km: 195, country: 'Tanzania', status: 'active', pressure: 62.1, flow: 1240, temp: 27.5 },
  { id: 'melela', name: 'Melela Sub-Station', shortName: 'Melela', type: 'Sub-Station', km: 280, country: 'Tanzania', status: 'idle', pressure: 54.2, flow: 1240, temp: 27.2 },
  { id: 'elphons', name: "Elphon's Pass Pump Station", shortName: "Elphon's", type: 'Pump Station', km: 380, country: 'Tanzania', status: 'active', pressure: 68.4, flow: 1235, temp: 26.8 },
  { id: 'ruaha', name: 'Ruaha Sub-Station', shortName: 'Ruaha', type: 'Sub-Station', km: 460, country: 'Tanzania', status: 'idle', pressure: 48.9, flow: 1235, temp: 26.5 },
  { id: 'mtandika', name: 'Mtandika Sub-Station', shortName: 'Mtandika', type: 'Sub-Station', km: 530, country: 'Tanzania', status: 'idle', pressure: 45.1, flow: 1235, temp: 26.2 },
  { id: 'ilula', name: 'Ilula Sub-Station', shortName: 'Ilula', type: 'Sub-Station', km: 610, country: 'Tanzania', status: 'idle', pressure: 42.4, flow: 1235, temp: 25.9 },
  { id: 'iringa', name: 'Iringa Pump Station', shortName: 'Iringa PS', type: 'Pump Station', km: 700, country: 'Tanzania', status: 'active', pressure: 72.1, flow: 1230, temp: 25.4 },
  { id: 'malangali', name: 'Malangali Sub-Station', shortName: 'Malangali', type: 'Sub-Station', km: 810, country: 'Tanzania', status: 'idle', pressure: 51.2, flow: 1230, temp: 25.1 },
  { id: 'mbalamaziwa', name: 'Mbalamaziwa Pig Station', shortName: 'Mbalamaziwa', type: 'Pig Station', km: 920, country: 'Tanzania', status: 'idle', pressure: 44.5, flow: 1230, temp: 24.8 },
  { id: 'mbeya', name: 'Mbeya Pump Station', shortName: 'Mbeya PS', type: 'Pump Station', km: 1050, country: 'Tanzania', status: 'active', pressure: 64.8, flow: 1225, temp: 24.2 },
  { id: 'chilolwa', name: 'Chilolwa Pig Station', shortName: 'Chilolwa', type: 'Pig Station', km: 1180, country: 'Tanzania', status: 'idle', pressure: 41.2, flow: 1225, temp: 23.9 },
  // Zambia Section
  { id: 'chinsali', name: 'Chinsali Pump Station', shortName: 'Chinsali PS', type: 'Pump Station', km: 1380, country: 'Zambia', status: 'active', pressure: 66.4, flow: 1220, temp: 23.5 },
  { id: 'danger-hill', name: 'Danger Hill Station', shortName: 'Danger Hill', type: 'Pressure Station', km: 1450, country: 'Zambia', status: 'active', pressure: 38.2, flow: 1220, temp: 23.2 },
  { id: 'kalonje', name: 'Kalonje Pump Station', shortName: 'Kalonje PS', type: 'Pump Station', km: 1520, country: 'Zambia', status: 'active', pressure: 69.1, flow: 1215, temp: 22.8 },
  { id: 'ulilima', name: 'Ulilima Pig Station', shortName: 'Ulilima', type: 'Pig Station', km: 1590, country: 'Zambia', status: 'idle', pressure: 46.4, flow: 1215, temp: 22.5 },
  { id: 'bwana', name: 'Bwana Mkubwa Terminal', shortName: 'Bwana Mkubwa', type: 'Terminal', km: 1660, country: 'Zambia', status: 'active', pressure: 32.1, flow: 1210, temp: 22.1 },
  { id: 'ndola', name: 'Ndola Fuel Terminal', shortName: 'Ndola', type: 'Marine Terminal', km: 1710, country: 'Zambia', status: 'active', pressure: 28.4, flow: 1210, temp: 21.8 },
]

const yearlyData = {
  2024: {
    throughput: 842.5,
    delivered: 812.2,
    batches: [
      { id: 'batch-1', product: 'AGO', volume: 245000, startKm: 0, endKm: 450, color: 'bg-blue-500' },
      { id: 'batch-2', product: 'PMS', volume: 185000, startKm: 450, endKm: 920, color: 'bg-orange-500' },
      { id: 'batch-3', product: 'DPK', volume: 120000, startKm: 920, endKm: 1380, color: 'bg-yellow-500' },
      { id: 'batch-4', product: 'AGO', volume: 210000, startKm: 1380, endKm: 1710, color: 'bg-blue-500' },
    ]
  },
  2023: {
    throughput: 798.2,
    delivered: 752.4,
    batches: [
      { id: 'batch-23-1', product: 'AGO', volume: 220000, startKm: 0, endKm: 600, color: 'bg-blue-500' },
      { id: 'batch-23-2', product: 'PMS', volume: 165200, startKm: 600, endKm: 1150, color: 'bg-orange-500' },
      { id: 'batch-23-3', product: 'AGO', volume: 198000, startKm: 1150, endKm: 1710, color: 'bg-blue-500' },
    ]
  },
  2022: {
    throughput: 745.1,
    delivered: 710.8,
    batches: [
      { id: 'batch-22-1', product: 'AGO', volume: 195000, startKm: 0, endKm: 550, color: 'bg-blue-500' },
      { id: 'batch-22-2', product: 'PMS', volume: 145000, startKm: 550, endKm: 1020, color: 'bg-orange-500' },
      { id: 'batch-22-3', product: 'AGO', volume: 182000, startKm: 1020, endKm: 1710, color: 'bg-blue-500' },
    ]
  },
  2021: {
    throughput: 712.4,
    delivered: 685.2,
    batches: [
      { id: 'batch-21-1', product: 'AGO', volume: 185000, startKm: 0, endKm: 500, color: 'bg-blue-500' },
      { id: 'batch-21-2', product: 'PMS', volume: 135000, startKm: 500, endKm: 1080, color: 'bg-orange-500' },
      { id: 'batch-21-3', product: 'AGO', volume: 175000, startKm: 1080, endKm: 1710, color: 'bg-blue-500' },
    ]
  },
  2020: {
    throughput: 685.2,
    delivered: 648.9,
    batches: [
      { id: 'batch-20-1', product: 'LSG', volume: 220000, startKm: 0, endKm: 480, color: 'bg-emerald-500' },
      { id: 'batch-20-2', product: 'LSG', volume: 260000, startKm: 480, endKm: 1020, color: 'bg-emerald-500' },
      { id: 'batch-20-3', product: 'LSG', volume: 205200, startKm: 1020, endKm: 1710, color: 'bg-emerald-500' },
    ]
  },
}

const pigs = [
  { id: 'pig-1', name: 'Cleaning Pig #1', position: 300, speed: 8, type: 'cleaning', launched: new Date(Date.now() - 1000 * 60 * 60 * 8) },
  { id: 'pig-2', name: 'Inspection Pig #2', position: 950, speed: 5, type: 'inspection', launched: new Date(Date.now() - 1000 * 60 * 60 * 4) },
]

export async function seedPipelineData() {
  console.log('Starting pipeline data seed with Facilities...')

  try {
    // Seed Facilities and link to Stations
    for (const data of pipelineStations) {
      // 1. Create or update the Facility
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
      })

      // 2. Link to Station if it exists (or create it for data entries)
      await prisma.station.upsert({
        where: { name: data.name },
        update: {
          facilityId: facility.id
        },
        create: {
          name: data.name,
          facilityId: facility.id
        }
      })
    }
    console.log('Facilities and Station links seeded.')

    // Seed Yearly Stats and Batches
    for (const [year, data] of Object.entries(yearlyData)) {
      const yearInt = parseInt(year)
      await prisma.pipelineYearlyStats.upsert({
        where: { year: yearInt },
        update: {
          throughput: data.throughput,
          delivered: data.delivered,
        },
        create: {
          year: yearInt,
          throughput: data.throughput,
          delivered: data.delivered,
        }
      })

      // Clean existing batches for this year to avoid duplicates on re-seed
      await prisma.pipelineBatch.deleteMany({
        where: { year: yearInt }
      })

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
        })
      }
    }
    console.log('Yearly stats and batches seeded.')

    // Seed Pigs
    await prisma.pipelinePig.deleteMany({}) // Reset pigs
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
      })
    }
    console.log('Pigs seeded.')

    console.log('Pipeline data seed completed successfully.')
    return { success: true }
  } catch (error) {
    console.error('Error seeding pipeline data:', error)
    return { success: false, error }
  }
}
