import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function truncateData() {
  try {
    // List all your models here
    const models: (keyof PrismaClient)[] = [
      // 'readingLines', // Example model names
      'pipelineData', // Add your other model names here
      // ... Add more models as needed
    ];

    // Delete all records from each model
    for (const model of models) {
      // Use type assertion to inform TypeScript about the type
      await (prisma[model] as any).deleteMany({});
      console.log(`Truncated ${String(model)}`); // Ensure model is a string
    }

    console.log('All data has been truncated successfully.');
  } catch (error) {
    console.error('Error truncating data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

truncateData();
