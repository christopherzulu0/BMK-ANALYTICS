BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[DraInputEntry] (
    [id] INT NOT NULL IDENTITY(1,1),
    [date] DATETIME2 NOT NULL,
    [supplier] NVARCHAR(1000),
    [vessel] NVARCHAR(1000),
    [litres] FLOAT(53) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [DraInputEntry_status_df] DEFAULT 'pending',
    [deliveryType] NVARCHAR(1000) NOT NULL CONSTRAINT [DraInputEntry_deliveryType_df] DEFAULT 'vessel',
    [temperature] FLOAT(53) NOT NULL,
    [density] FLOAT(53) NOT NULL,
    [apiGravity] FLOAT(53) NOT NULL,
    [sulphurContent] FLOAT(53) NOT NULL,
    [qualityGrade] NVARCHAR(1000) NOT NULL CONSTRAINT [DraInputEntry_qualityGrade_df] DEFAULT 'A',
    [batchNo] NVARCHAR(1000),
    [receiptNo] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DraInputEntry_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [DraInputEntry_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[DraStation] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(100) NOT NULL,
    [position] INT NOT NULL CONSTRAINT [DraStation_position_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DraStation_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [DraStation_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DraStation_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[DraEntry] (
    [id] NVARCHAR(1000) NOT NULL,
    [date] DATE NOT NULL,
    [stationId] NVARCHAR(1000) NOT NULL,
    [consumption] FLOAT(53),
    [stock] FLOAT(53),
    [remarks] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [DraEntry_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [DraEntry_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [DraEntry_date_stationId_key] UNIQUE NONCLUSTERED ([date],[stationId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [DraEntry_date_idx] ON [dbo].[DraEntry]([date]);

-- AddForeignKey
ALTER TABLE [dbo].[DraEntry] ADD CONSTRAINT [DraEntry_stationId_fkey] FOREIGN KEY ([stationId]) REFERENCES [dbo].[DraStation]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
