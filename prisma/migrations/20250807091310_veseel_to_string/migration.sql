/*
  Warnings:

  - You are about to drop the `TankProductEntry` table. If the table is not empty, all the data it contains will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[TankProductEntry] DROP CONSTRAINT [TankProductEntry_tankId_fkey];

-- AlterTable
ALTER TABLE [dbo].[Shipment] ALTER COLUMN [vessel_id] NVARCHAR(1000) NOT NULL;

-- DropTable
DROP TABLE [dbo].[TankProductEntry];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
