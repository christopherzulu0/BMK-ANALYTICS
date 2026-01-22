BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Supplier] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000) NOT NULL,
    [location] NVARCHAR(1000) NOT NULL,
    [rating] FLOAT(53) NOT NULL CONSTRAINT [Supplier_rating_df] DEFAULT 0,
    [activeShipments] INT NOT NULL CONSTRAINT [Supplier_activeShipments_df] DEFAULT 0,
    [reliability] FLOAT(53) NOT NULL CONSTRAINT [Supplier_reliability_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Supplier_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Supplier_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Supplier_name_key] UNIQUE NONCLUSTERED ([name]),
    CONSTRAINT [Supplier_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Supplier_name_idx] ON [dbo].[Supplier]([name]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Supplier_email_idx] ON [dbo].[Supplier]([email]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
