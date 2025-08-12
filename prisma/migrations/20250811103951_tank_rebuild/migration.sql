/*
  Warnings:

  - You are about to drop the `Tank` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tankage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TankLevelUpdate` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[TankLevelUpdate] DROP CONSTRAINT [TankLevelUpdate_tankId_fkey];

-- DropTable
DROP TABLE [dbo].[Tank];

-- DropTable
DROP TABLE [dbo].[Tankage];

-- DropTable
DROP TABLE [dbo].[TankLevelUpdate];

-- CreateTable
CREATE TABLE [dbo].[Stations] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(100) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Stations_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Stations_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Stations_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[DailyEntries] (
    [id] NVARCHAR(1000) NOT NULL,
    [stationId] NVARCHAR(1000) NOT NULL,
    [date] DATE NOT NULL,
    [tfarmDischargeM3] DECIMAL(18,3) NOT NULL,
    [kigamboniDischargeM3] DECIMAL(18,3) NOT NULL,
    [netDeliveryM3At20C] DECIMAL(18,3) NOT NULL,
    [netDeliveryMT] DECIMAL(18,3) NOT NULL,
    [pumpOverDate] DATE,
    [prevVolumeM3] DECIMAL(18,3) NOT NULL,
    [opUllageVolM3] DECIMAL(18,3) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DailyEntries_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [DailyEntries_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DailyEntries_stationId_date_key] UNIQUE NONCLUSTERED ([stationId],[date])
);

-- CreateTable
CREATE TABLE [dbo].[Tanks] (
    [id] NVARCHAR(1000) NOT NULL,
    [entryId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(50) NOT NULL,
    [status] NVARCHAR(20) NOT NULL CONSTRAINT [Tanks_status_df] DEFAULT 'Active',
    [levelMm] INT,
    [volumeM3] DECIMAL(18,3),
    [waterCm] DECIMAL(18,3),
    [sg] DECIMAL(10,5),
    [tempC] DECIMAL(6,2),
    [volAt20C] DECIMAL(18,3),
    [mts] DECIMAL(18,3),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Tanks_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Tanks_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Tanks_entryId_name_key] UNIQUE NONCLUSTERED ([entryId],[name])
);

-- CreateTable
CREATE TABLE [dbo].[Remarks] (
    [id] NVARCHAR(1000) NOT NULL,
    [entryId] NVARCHAR(1000) NOT NULL,
    [order] INT NOT NULL,
    [text] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Remarks_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DailyEntries_stationId_date_idx] ON [dbo].[DailyEntries]([stationId], [date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Tanks_entryId_idx] ON [dbo].[Tanks]([entryId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Tanks_status_idx] ON [dbo].[Tanks]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Remarks_entryId_order_idx] ON [dbo].[Remarks]([entryId], [order]);

-- AddForeignKey
ALTER TABLE [dbo].[DailyEntries] ADD CONSTRAINT [DailyEntries_stationId_fkey] FOREIGN KEY ([stationId]) REFERENCES [dbo].[Stations]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Tanks] ADD CONSTRAINT [Tanks_entryId_fkey] FOREIGN KEY ([entryId]) REFERENCES [dbo].[DailyEntries]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Remarks] ADD CONSTRAINT [Remarks_entryId_fkey] FOREIGN KEY ([entryId]) REFERENCES [dbo].[DailyEntries]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
