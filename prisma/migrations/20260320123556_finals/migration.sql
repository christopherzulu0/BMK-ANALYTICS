BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[FuelInputEntry] DROP CONSTRAINT [FuelInputEntry_apiGravity_df],
[FuelInputEntry_litres_df],
[FuelInputEntry_sulphurContent_df];

-- CreateTable
CREATE TABLE [dbo].[ShiftHandover] (
    [id] INT NOT NULL IDENTITY(1,1),
    [date] DATETIME2 NOT NULL,
    [shiftType] NVARCHAR(1000) NOT NULL CONSTRAINT [ShiftHandover_shiftType_df] DEFAULT 'day',
    [outgoingOperator] NVARCHAR(1000) NOT NULL,
    [incomingOperator] NVARCHAR(1000) NOT NULL,
    [station] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [ShiftHandover_status_df] DEFAULT 'pending',
    [operationalStatus] NVARCHAR(1000) NOT NULL CONSTRAINT [ShiftHandover_operationalStatus_df] DEFAULT 'normal',
    [flowRate] FLOAT(53) NOT NULL CONSTRAINT [ShiftHandover_flowRate_df] DEFAULT 0,
    [pressure] FLOAT(53) NOT NULL CONSTRAINT [ShiftHandover_pressure_df] DEFAULT 0,
    [throughput] FLOAT(53) NOT NULL CONSTRAINT [ShiftHandover_throughput_df] DEFAULT 0,
    [outstandingIssues] INT NOT NULL CONSTRAINT [ShiftHandover_outstandingIssues_df] DEFAULT 0,
    [notes] TEXT,
    [handoverTime] NVARCHAR(1000) NOT NULL CONSTRAINT [ShiftHandover_handoverTime_df] DEFAULT '06:00',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ShiftHandover_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ShiftHandover_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ShiftLogEntry] (
    [id] INT NOT NULL IDENTITY(1,1),
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [ShiftLogEntry_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    [operator] NVARCHAR(1000) NOT NULL,
    [station] NVARCHAR(1000) NOT NULL,
    [category] NVARCHAR(1000) NOT NULL CONSTRAINT [ShiftLogEntry_category_df] DEFAULT 'operational',
    [priority] NVARCHAR(1000) NOT NULL CONSTRAINT [ShiftLogEntry_priority_df] DEFAULT 'normal',
    [message] TEXT NOT NULL,
    [acknowledged] BIT NOT NULL CONSTRAINT [ShiftLogEntry_acknowledged_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ShiftLogEntry_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ShiftLogEntry_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[OutstandingIssue] (
    [id] INT NOT NULL IDENTITY(1,1),
    [title] NVARCHAR(1000) NOT NULL,
    [priority] NVARCHAR(1000) NOT NULL CONSTRAINT [OutstandingIssue_priority_df] DEFAULT 'medium',
    [station] NVARCHAR(1000) NOT NULL,
    [reportedBy] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL CONSTRAINT [OutstandingIssue_date_df] DEFAULT CURRENT_TIMESTAMP,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [OutstandingIssue_status_df] DEFAULT 'monitoring',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [OutstandingIssue_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [OutstandingIssue_pkey] PRIMARY KEY CLUSTERED ([id])
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
