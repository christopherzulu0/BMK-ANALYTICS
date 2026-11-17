BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[FuelStation] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(100) NOT NULL,
    [position] INT NOT NULL CONSTRAINT [FuelStation_position_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FuelStation_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [FuelStation_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [FuelStation_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[FuelStationEntry] (
    [id] NVARCHAR(1000) NOT NULL,
    [date] DATE NOT NULL,
    [stationId] NVARCHAR(1000) NOT NULL,
    [consumption] FLOAT(53),
    [stock] FLOAT(53),
    [remarks] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [FuelStationEntry_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [FuelStationEntry_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [FuelStationEntry_date_stationId_key] UNIQUE NONCLUSTERED ([date],[stationId])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [FuelStationEntry_date_idx] ON [dbo].[FuelStationEntry]([date]);

-- AddForeignKey
ALTER TABLE [dbo].[FuelStationEntry] ADD CONSTRAINT [FuelStationEntry_stationId_fkey] FOREIGN KEY ([stationId]) REFERENCES [dbo].[FuelStation]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
