/*
  Warnings:

  - You are about to drop the `PipelineYearlyStats` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropTable
DROP TABLE [dbo].[PipelineYearlyStats];

-- CreateTable
CREATE TABLE [dbo].[PipelineDailyStats] (
    [id] NVARCHAR(1000) NOT NULL,
    [date] DATE NOT NULL CONSTRAINT [PipelineDailyStats_date_df] DEFAULT CURRENT_TIMESTAMP,
    [throughput] FLOAT(53) NOT NULL,
    [delivered] FLOAT(53) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PipelineDailyStats_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PipelineDailyStats_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PipelineDailyStats_date_key] UNIQUE NONCLUSTERED ([date])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
