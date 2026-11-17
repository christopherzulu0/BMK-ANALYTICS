/*
  Warnings:

  - You are about to drop the column `gravity` on the `FuelInputEntry` table. All the data in the column will be lost.
  - You are about to drop the column `sulphur_content` on the `FuelInputEntry` table. All the data in the column will be lost.
  - You are about to drop the column `supplier_name` on the `FuelInputEntry` table. All the data in the column will be lost.
  - You are about to drop the column `vessel_name` on the `FuelInputEntry` table. All the data in the column will be lost.
  - You are about to drop the column `volume_litres` on the `FuelInputEntry` table. All the data in the column will be lost.
  - You are about to drop the column `launched` on the `PipelinePig` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `PipelinePig` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[year]` on the table `PipelineProgress` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apiGravity` to the `FuelInputEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `litres` to the `FuelInputEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sulphurContent` to the `FuelInputEntry` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- 1. Handle FuelInputEntry column drops and constraint drops
DECLARE @FIECmd nvarchar(max) = ''
SELECT @FIECmd = @FIECmd + 'ALTER TABLE [dbo].[FuelInputEntry] DROP CONSTRAINT [' + dc.name + ']; '
FROM sys.default_constraints dc
JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
WHERE dc.parent_object_id = OBJECT_ID('[dbo].[FuelInputEntry]')
AND c.name IN ('gravity', 'sulphur_content', 'supplier_name', 'vessel_name', 'volume_litres')

IF @FIECmd <> '' EXEC(@FIECmd)

-- Now drop the columns if they exist
IF EXISTS (SELECT 1 FROM sys.columns WHERE name = 'gravity' AND object_id = OBJECT_ID('[dbo].[FuelInputEntry]'))
    ALTER TABLE [dbo].[FuelInputEntry] DROP COLUMN [gravity]
IF EXISTS (SELECT 1 FROM sys.columns WHERE name = 'sulphur_content' AND object_id = OBJECT_ID('[dbo].[FuelInputEntry]'))
    ALTER TABLE [dbo].[FuelInputEntry] DROP COLUMN [sulphur_content]
IF EXISTS (SELECT 1 FROM sys.columns WHERE name = 'supplier_name' AND object_id = OBJECT_ID('[dbo].[FuelInputEntry]'))
    ALTER TABLE [dbo].[FuelInputEntry] DROP COLUMN [supplier_name]
IF EXISTS (SELECT 1 FROM sys.columns WHERE name = 'vessel_name' AND object_id = OBJECT_ID('[dbo].[FuelInputEntry]'))
    ALTER TABLE [dbo].[FuelInputEntry] DROP COLUMN [vessel_name]
IF EXISTS (SELECT 1 FROM sys.columns WHERE name = 'volume_litres' AND object_id = OBJECT_ID('[dbo].[FuelInputEntry]'))
    ALTER TABLE [dbo].[FuelInputEntry] DROP COLUMN [volume_litres]

-- 2. Add new columns to FuelInputEntry
-- Note: Using default values for required columns to allow applying to non-empty tables, 
-- or removing NOT NULL if that's preferred. Prisma generated NOT NULL without defaults.
-- I'll add them with NULL first then update if needed, but for now I'll follow Prisma's lead with defaults if I can.
ALTER TABLE [dbo].[FuelInputEntry] ADD 
[apiGravity] FLOAT(53) NOT NULL CONSTRAINT [FuelInputEntry_apiGravity_df] DEFAULT 0,
[batchNo] NVARCHAR(1000),
[deliveryType] NVARCHAR(1000) NOT NULL CONSTRAINT [FuelInputEntry_deliveryType_df] DEFAULT 'vessel',
[litres] FLOAT(53) NOT NULL CONSTRAINT [FuelInputEntry_litres_df] DEFAULT 0,
[qualityGrade] NVARCHAR(1000) NOT NULL CONSTRAINT [FuelInputEntry_qualityGrade_df] DEFAULT 'A',
[receiptNo] NVARCHAR(1000),
[status] NVARCHAR(1000) NOT NULL CONSTRAINT [FuelInputEntry_status_df] DEFAULT 'pending',
[sulphurContent] FLOAT(53) NOT NULL CONSTRAINT [FuelInputEntry_sulphurContent_df] DEFAULT 0,
[supplier] NVARCHAR(1000),
[vessel] NVARCHAR(1000);

-- 3. Handle PipelinePig column drops and constraint drops
DECLARE @PPCmd nvarchar(max) = ''
SELECT @PPCmd = @PPCmd + 'ALTER TABLE [dbo].[PipelinePig] DROP CONSTRAINT [' + dc.name + ']; '
FROM sys.default_constraints dc
JOIN sys.columns c ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
WHERE dc.parent_object_id = OBJECT_ID('[dbo].[PipelinePig]')
AND c.name IN ('launched', 'type')

IF @PPCmd <> '' EXEC(@PPCmd)

IF EXISTS (SELECT 1 FROM sys.columns WHERE name = 'launched' AND object_id = OBJECT_ID('[dbo].[PipelinePig]'))
    ALTER TABLE [dbo].[PipelinePig] DROP COLUMN [launched]
IF EXISTS (SELECT 1 FROM sys.columns WHERE name = 'type' AND object_id = OBJECT_ID('[dbo].[PipelinePig]'))
    ALTER TABLE [dbo].[PipelinePig] DROP COLUMN [type]

-- 4. Add new columns to PipelinePig
ALTER TABLE [dbo].[PipelinePig] ADD 
[categoryId] NVARCHAR(1000),
[condition] NVARCHAR(1000) NOT NULL CONSTRAINT [PipelinePig_condition_df] DEFAULT 'good',
[lastRun] DATETIME2,
[runs] INT NOT NULL CONSTRAINT [PipelinePig_runs_df] DEFAULT 0,
[status] NVARCHAR(1000) NOT NULL CONSTRAINT [PipelinePig_status_df] DEFAULT 'available';

-- 5. Rest of the migration
ALTER TABLE [dbo].[PipelineProgress] ADD [year] INT;

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('[dbo].[PigCategory]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PigCategory] (
        [id] NVARCHAR(1000) NOT NULL,
        [name] NVARCHAR(1000) NOT NULL,
        [description] NVARCHAR(1000),
        [color] NVARCHAR(1000) NOT NULL CONSTRAINT [PigCategory_color_df] DEFAULT 'bg-blue-500',
        [icon] NVARCHAR(1000) NOT NULL CONSTRAINT [PigCategory_icon_df] DEFAULT 'Truck',
        [createdAt] DATETIME2 NOT NULL CONSTRAINT [PigCategory_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
        [updatedAt] DATETIME2 NOT NULL,
        CONSTRAINT [PigCategory_pkey] PRIMARY KEY CLUSTERED ([id]),
        CONSTRAINT [PigCategory_name_key] UNIQUE NONCLUSTERED ([name])
    );
END

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID('[dbo].[PigRun]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PigRun] (
        [id] NVARCHAR(1000) NOT NULL,
        [pigId] NVARCHAR(1000) NOT NULL,
        [categoryId] NVARCHAR(1000),
        [status] NVARCHAR(1000) NOT NULL CONSTRAINT [PigRun_status_df] DEFAULT 'scheduled',
        [launchStation] NVARCHAR(1000) NOT NULL,
        [receiveStation] NVARCHAR(1000) NOT NULL,
        [launchTime] DATETIME2 NOT NULL CONSTRAINT [PigRun_launchTime_df] DEFAULT CURRENT_TIMESTAMP,
        [estimatedArrival] DATETIME2 NOT NULL,
        [actualArrival] DATETIME2,
        [currentPosition] FLOAT(53) NOT NULL CONSTRAINT [PigRun_currentPosition_df] DEFAULT 0,
        [speed] FLOAT(53) NOT NULL CONSTRAINT [PigRun_speed_df] DEFAULT 0,
        [distanceCovered] FLOAT(53) NOT NULL CONSTRAINT [PigRun_distanceCovered_df] DEFAULT 0,
        [totalDistance] FLOAT(53) NOT NULL CONSTRAINT [PigRun_totalDistance_df] DEFAULT 1710,
        [findings] TEXT,
        [operator] NVARCHAR(1000) NOT NULL,
        [createdAt] DATETIME2 NOT NULL CONSTRAINT [PigRun_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
        [updatedAt] DATETIME2 NOT NULL,
        CONSTRAINT [PigRun_pkey] PRIMARY KEY CLUSTERED ([id])
    );
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'PigRun_pigId_idx' AND object_id = OBJECT_ID('[dbo].[PigRun]'))
    CREATE NONCLUSTERED INDEX [PigRun_pigId_idx] ON [dbo].[PigRun]([pigId]);

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'PigRun_status_idx' AND object_id = OBJECT_ID('[dbo].[PigRun]'))
    CREATE NONCLUSTERED INDEX [PigRun_status_idx] ON [dbo].[PigRun]([status]);

IF NOT EXISTS (SELECT * FROM sys.objects WHERE name = 'PipelineProgress_year_key' AND parent_object_id = OBJECT_ID('[dbo].[PipelineProgress]'))
    ALTER TABLE [dbo].[PipelineProgress] ADD CONSTRAINT [PipelineProgress_year_key] UNIQUE NONCLUSTERED ([year]);

-- Only add foreign keys if they don't exist
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'PipelinePig_categoryId_fkey')
    ALTER TABLE [dbo].[PipelinePig] ADD CONSTRAINT [PipelinePig_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[PigCategory]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'PigRun_pigId_fkey')
    ALTER TABLE [dbo].[PigRun] ADD CONSTRAINT [PigRun_pigId_fkey] FOREIGN KEY ([pigId]) REFERENCES [dbo].[PipelinePig]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'PigRun_categoryId_fkey')
    ALTER TABLE [dbo].[PigRun] ADD CONSTRAINT [PigRun_categoryId_fkey] FOREIGN KEY ([categoryId]) REFERENCES [dbo].[PigCategory]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
