/*
  Warnings:

  - You are about to drop the column `order` on the `Remarks` table. All the data in the column will be lost.
  - Added the required column `position` to the `Remarks` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
DROP INDEX [Remarks_entryId_order_idx] ON [dbo].[Remarks];

-- AlterTable
ALTER TABLE [dbo].[Remarks] DROP COLUMN [order];
ALTER TABLE [dbo].[Remarks] ADD [position] INT NOT NULL;

-- CreateIndex
CREATE NONCLUSTERED INDEX [Remarks_entryId_position_idx] ON [dbo].[Remarks]([entryId], [position]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
