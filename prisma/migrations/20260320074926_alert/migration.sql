/*
  Warnings:

  - A unique constraint covering the columns `[facilityId]` on the table `Stations` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Alert] ADD [station] NVARCHAR(100);

-- AlterTable
ALTER TABLE [dbo].[Stations] ADD [facilityId] NVARCHAR(1000);

-- CreateTable
CREATE TABLE [dbo].[Facility] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [shortName] NVARCHAR(50),
    [type] NVARCHAR(50),
    [km] FLOAT(53),
    [country] NVARCHAR(50),
    [status] NVARCHAR(20) CONSTRAINT [Facility_status_df] DEFAULT 'idle',
    [pressure] FLOAT(53),
    [flow] FLOAT(53),
    [temp] FLOAT(53),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Facility_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Facility_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Facility_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[PipelineBatch] (
    [id] NVARCHAR(1000) NOT NULL,
    [year] INT NOT NULL,
    [product] NVARCHAR(1000) NOT NULL,
    [volume] FLOAT(53) NOT NULL,
    [startKm] FLOAT(53) NOT NULL,
    [endKm] FLOAT(53) NOT NULL,
    [color] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PipelineBatch_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PipelineBatch_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PipelinePig] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [position] FLOAT(53) NOT NULL,
    [speed] FLOAT(53) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [launched] DATETIME2 NOT NULL CONSTRAINT [PipelinePig_launched_df] DEFAULT CURRENT_TIMESTAMP,
    [isActive] BIT NOT NULL CONSTRAINT [PipelinePig_isActive_df] DEFAULT 1,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PipelinePig_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PipelinePig_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PipelineYearlyStats] (
    [id] NVARCHAR(1000) NOT NULL,
    [year] INT NOT NULL,
    [throughput] FLOAT(53) NOT NULL,
    [delivered] FLOAT(53) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PipelineYearlyStats_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PipelineYearlyStats_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PipelineYearlyStats_year_key] UNIQUE NONCLUSTERED ([year])
);

-- CreateIndex
ALTER TABLE [dbo].[Stations] ADD CONSTRAINT [Stations_facilityId_key] UNIQUE NONCLUSTERED ([facilityId]);

-- AddForeignKey
ALTER TABLE [dbo].[Stations] ADD CONSTRAINT [Stations_facilityId_fkey] FOREIGN KEY ([facilityId]) REFERENCES [dbo].[Facility]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
