# Tank Migration and Seeding Script

This document provides instructions on how to use the tank migration and seeding script to populate the database with default tanks (Tank 1 to Tank 6).

## Overview

The `migrate-tanks.ts` script is designed to:

1. Create the default tank metadata (T1-T6) in the `Tank` table
2. Create an initial tankage record with default levels in the `Tankage` table
3. Handle existing data gracefully (won't create duplicates)

## Default Tank Data

The script seeds the following default tanks:

| ID | Name    | Capacity | Product    | Location   |
|----|---------|----------|------------|------------|
| T1 | Tank 1  | 2000     | Crude Oil  | North Yard |
| T2 | Tank 2  | 2000     | Diesel     | North Yard |
| T3 | Tank 3  | 2000     | Gasoline   | East Yard  |
| T4 | Tank 4  | 2000     | Jet Fuel   | East Yard  |
| T5 | Tank 5  | 2000     | Kerosene   | South Yard |
| T6 | Tank 6  | 2000     | Lubricants | South Yard |

## Initial Tank Levels

The script also creates an initial tankage record with the following levels:

| Tank | Level (%) |
|------|-----------|
| T1   | 65        |
| T2   | 60        |
| T3   | 85        |
| T4   | 55        |
| T5   | 70        |
| T6   | 45        |

## Running the Script

### Using the Batch File (Windows)

The easiest way to run the script is to use the provided batch file:

1. Open a command prompt in the project root directory
2. Run the batch file:
   ```
   migrate-tanks.bat
   ```

### Running Directly with Node

Alternatively, you can run the script directly:

1. Open a command prompt in the project root directory
2. Run the following command:
   ```
   npx ts-node migrate-tanks.ts
   ```

## Behavior

- If a tank with a specific ID (e.g., "T1") already exists in the database, it will be skipped
- Only tanks that don't exist will be created
- If there are no existing tankage records, an initial record will be created
- If tankage records already exist, no new record will be created

## Troubleshooting

If you encounter any issues:

1. Make sure your database connection is properly configured in the `.env` file
2. Ensure you have the necessary permissions to access the database
3. Check the console output for specific error messages
4. Verify that the Prisma schema is up to date by running `npx prisma generate`

## Implementation Details

The script uses the Prisma ORM to interact with the database and follows these steps:

1. Connects to the database using the PrismaClient
2. Checks for existing tanks to avoid duplicates
3. Creates only the tanks that don't exist yet
4. Checks for existing tankage records
5. Creates an initial tankage record if none exists
6. Handles errors and properly disconnects from the database
