BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[TankProductEntry] (
    [id] NVARCHAR(1000) NOT NULL,
    [tankId] NVARCHAR(1000) NOT NULL,
    [product] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL,
    [amount] FLOAT(53) NOT NULL,
    CONSTRAINT [TankProductEntry_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[TankProductEntry] ADD CONSTRAINT [TankProductEntry_tankId_fkey] FOREIGN KEY ([tankId]) REFERENCES [dbo].[Tank]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
