BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Role] ADD [roleTypeId] INT;

-- AlterTable
ALTER TABLE [dbo].[User] ADD [status] NVARCHAR(20) NOT NULL CONSTRAINT [User_status_df] DEFAULT 'active';

-- CreateTable
CREATE TABLE [dbo].[RoleType] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [RoleType_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [RoleType_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [RoleType_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[TankProductEntry] (
    [id] NVARCHAR(1000) NOT NULL,
    [tankId] NVARCHAR(1000) NOT NULL,
    [product] NVARCHAR(100) NOT NULL,
    [date] DATE NOT NULL,
    [amount] FLOAT(53) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [TankProductEntry_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [TankProductEntry_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [TankProductEntry_tankId_idx] ON [dbo].[TankProductEntry]([tankId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [TankProductEntry_date_idx] ON [dbo].[TankProductEntry]([date]);

-- AddForeignKey
ALTER TABLE [dbo].[Role] ADD CONSTRAINT [Role_roleTypeId_fkey] FOREIGN KEY ([roleTypeId]) REFERENCES [dbo].[RoleType]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
