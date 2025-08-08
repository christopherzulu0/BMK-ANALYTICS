/*
  Warnings:

  - You are about to alter the column `vessel_id` on the `Shipment` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `Text`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Shipment] ALTER COLUMN [vessel_id] TEXT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
