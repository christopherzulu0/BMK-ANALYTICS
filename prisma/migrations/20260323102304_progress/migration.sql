/*
  Warnings:

  - You are about to drop the column `year` on the `PipelineBatch` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `PipelineProgress` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `PipelineYearlyStats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[date]` on the table `PipelineProgress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[date]` on the table `PipelineYearlyStats` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[PipelineProgress] DROP CONSTRAINT [PipelineProgress_year_key];

-- DropIndex
ALTER TABLE [dbo].[PipelineYearlyStats] DROP CONSTRAINT [PipelineYearlyStats_year_key];

-- AlterTable
ALTER TABLE [dbo].[PipelineBatch] DROP COLUMN [year];
ALTER TABLE [dbo].[PipelineBatch] ADD [date] DATE NOT NULL CONSTRAINT [PipelineBatch_date_df] DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE [dbo].[PipelineProgress] DROP COLUMN [year];
ALTER TABLE [dbo].[PipelineProgress] ADD [date] DATE;

-- AlterTable
ALTER TABLE [dbo].[PipelineYearlyStats] DROP COLUMN [year];
ALTER TABLE [dbo].[PipelineYearlyStats] ADD [date] DATE NOT NULL CONSTRAINT [PipelineYearlyStats_date_df] DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
ALTER TABLE [dbo].[PipelineProgress] ADD CONSTRAINT [PipelineProgress_date_key] UNIQUE NONCLUSTERED ([date]);

-- CreateIndex
ALTER TABLE [dbo].[PipelineYearlyStats] ADD CONSTRAINT [PipelineYearlyStats_date_key] UNIQUE NONCLUSTERED ([date]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
