BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Account] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [provider] NVARCHAR(1000) NOT NULL,
    [providerAccountId] NVARCHAR(1000) NOT NULL,
    [refresh_token] TEXT,
    [access_token] TEXT,
    [expires_at] INT,
    [token_type] NVARCHAR(1000),
    [scope] NVARCHAR(1000),
    [id_token] TEXT,
    [session_state] NVARCHAR(1000),
    CONSTRAINT [Account_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Account_provider_providerAccountId_key] UNIQUE NONCLUSTERED ([provider],[providerAccountId])
);

-- CreateTable
CREATE TABLE [dbo].[Session] (
    [id] NVARCHAR(1000) NOT NULL,
    [sessionToken] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    CONSTRAINT [Session_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Session_sessionToken_key] UNIQUE NONCLUSTERED ([sessionToken])
);

-- CreateTable
CREATE TABLE [dbo].[VerificationToken] (
    [identifier] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    CONSTRAINT [VerificationToken_token_key] UNIQUE NONCLUSTERED ([token]),
    CONSTRAINT [VerificationToken_identifier_token_key] UNIQUE NONCLUSTERED ([identifier],[token])
);

-- CreateTable
CREATE TABLE [dbo].[PipelineData] (
    [id] INT NOT NULL IDENTITY(1,1),
    [date] DATETIME2 NOT NULL,
    [openingReading] FLOAT(53) NOT NULL,
    [closingReading] FLOAT(53) NOT NULL,
    [totalFlowRate] FLOAT(53) NOT NULL,
    [averageFlowrate] FLOAT(53) NOT NULL,
    [averageObsDensity] FLOAT(53) NOT NULL,
    [averageTemp] FLOAT(53) NOT NULL,
    [obsDen15] FLOAT(53) NOT NULL,
    [kgInAirPerLitre] FLOAT(53) NOT NULL,
    [metricTons] FLOAT(53) NOT NULL,
    [calcAverageTemperature] FLOAT(53) NOT NULL,
    [totalObsDensity] FLOAT(53) NOT NULL,
    [volumeReductionFactor] FLOAT(53) NOT NULL,
    [volume20] FLOAT(53) NOT NULL,
    CONSTRAINT [PipelineData_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ReadingLines] (
    [id] INT NOT NULL IDENTITY(1,1),
    [date] DATETIME2 NOT NULL,
    [lineNo] INT NOT NULL,
    [reading] NVARCHAR(1000) NOT NULL,
    [flowMeter1] FLOAT(53) NOT NULL,
    [flowMeter2] FLOAT(53) NOT NULL,
    [flowRate1] FLOAT(53) NOT NULL,
    [flowRate2] FLOAT(53) NOT NULL,
    [sampleTemp] FLOAT(53) NOT NULL,
    [obsDensity] FLOAT(53) NOT NULL,
    [kgInAirPerLitre] FLOAT(53) NOT NULL,
    [remarks] NVARCHAR(1000) NOT NULL,
    [check] NVARCHAR(1000) NOT NULL,
    [previousReadingMeter1] FLOAT(53) NOT NULL,
    [previousReadingMeter2] FLOAT(53) NOT NULL,
    CONSTRAINT [ReadingLines_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Tankage] (
    [id] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL,
    [T1] FLOAT(53) NOT NULL,
    [T2] FLOAT(53) NOT NULL,
    [T3] FLOAT(53) NOT NULL,
    [T4] FLOAT(53) NOT NULL,
    [T5] FLOAT(53) NOT NULL,
    [T6] FLOAT(53) NOT NULL,
    [notes] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Tankage_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Tankage_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Tank] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [capacity] FLOAT(53) NOT NULL,
    [product] NVARCHAR(1000) NOT NULL,
    [location] NVARCHAR(1000) NOT NULL,
    [lastInspection] DATETIME2 NOT NULL CONSTRAINT [Tank_lastInspection_df] DEFAULT CURRENT_TIMESTAMP,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Tank_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Tank_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[TankLevelUpdate] (
    [id] NVARCHAR(1000) NOT NULL,
    [tankId] NVARCHAR(1000) NOT NULL,
    [level] FLOAT(53) NOT NULL,
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [TankLevelUpdate_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    [notes] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [TankLevelUpdate_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [TankLevelUpdate_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Shipment] (
    [id] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL CONSTRAINT [Shipment_date_df] DEFAULT CURRENT_TIMESTAMP,
    [vessel_id] INT NOT NULL,
    [estimated_day_of_arrival] DATETIME2 NOT NULL,
    [supplier] NVARCHAR(1000) NOT NULL,
    [cargo_metric_tons] FLOAT(53) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [progress] INT NOT NULL CONSTRAINT [Shipment_progress_df] DEFAULT 0,
    [notes] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Shipment_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Shipment_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Alert] (
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [message] TEXT NOT NULL,
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [Alert_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    [read] BIT NOT NULL CONSTRAINT [Alert_read_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Alert_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Alert_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [DepartmentName] NVARCHAR(1000) NOT NULL,
    [location] NVARCHAR(1000) NOT NULL,
    [phone_number] NVARCHAR(1000) NOT NULL,
    [notes] NVARCHAR(1000) NOT NULL,
    [roleId] INT,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[PasswordReset] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PasswordReset_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PasswordReset_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PasswordReset_userId_key] UNIQUE NONCLUSTERED ([userId]),
    CONSTRAINT [PasswordReset_token_key] UNIQUE NONCLUSTERED ([token])
);

-- CreateTable
CREATE TABLE [dbo].[Setting] (
    [id] NVARCHAR(1000) NOT NULL,
    [key] NVARCHAR(1000) NOT NULL,
    [value] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Setting_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Setting_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Setting_key_key] UNIQUE NONCLUSTERED ([key])
);

-- CreateTable
CREATE TABLE [dbo].[Maintenance] (
    [id] NVARCHAR(1000) NOT NULL,
    [tankId] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL,
    [description] TEXT NOT NULL,
    [technician] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Maintenance_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Maintenance_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[InventoryTransaction] (
    [id] NVARCHAR(1000) NOT NULL,
    [tankId] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [amount] FLOAT(53) NOT NULL,
    [description] TEXT,
    [shipmentId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [InventoryTransaction_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [InventoryTransaction_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Role] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [isSystem] BIT NOT NULL CONSTRAINT [Role_isSystem_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Role_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    [timeRestrictions] NVARCHAR(1000),
    CONSTRAINT [Role_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Role_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[Permission] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Permission_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Permission_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Permission_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[AuditLog] (
    [id] NVARCHAR(1000) NOT NULL,
    [timestamp] DATETIME2 NOT NULL CONSTRAINT [AuditLog_timestamp_df] DEFAULT CURRENT_TIMESTAMP,
    [userId] NVARCHAR(1000),
    [action] NVARCHAR(1000) NOT NULL,
    [resource] NVARCHAR(1000) NOT NULL,
    [details] TEXT NOT NULL,
    [status] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [AuditLog_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [AuditLog_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[_UserRoles] (
    [A] NVARCHAR(1000) NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_UserRoles_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateTable
CREATE TABLE [dbo].[_PermissionToRole] (
    [A] INT NOT NULL,
    [B] INT NOT NULL,
    CONSTRAINT [_PermissionToRole_AB_unique] UNIQUE NONCLUSTERED ([A],[B])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Tankage_date_idx] ON [dbo].[Tankage]([date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [TankLevelUpdate_tankId_idx] ON [dbo].[TankLevelUpdate]([tankId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [TankLevelUpdate_timestamp_idx] ON [dbo].[TankLevelUpdate]([timestamp]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Shipment_date_idx] ON [dbo].[Shipment]([date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Shipment_status_idx] ON [dbo].[Shipment]([status]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Alert_type_idx] ON [dbo].[Alert]([type]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Alert_read_idx] ON [dbo].[Alert]([read]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Maintenance_tankId_idx] ON [dbo].[Maintenance]([tankId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Maintenance_date_idx] ON [dbo].[Maintenance]([date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [InventoryTransaction_tankId_idx] ON [dbo].[InventoryTransaction]([tankId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [InventoryTransaction_date_idx] ON [dbo].[InventoryTransaction]([date]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [InventoryTransaction_type_idx] ON [dbo].[InventoryTransaction]([type]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AuditLog_resource_idx] ON [dbo].[AuditLog]([resource]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AuditLog_action_idx] ON [dbo].[AuditLog]([action]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [AuditLog_timestamp_idx] ON [dbo].[AuditLog]([timestamp]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_UserRoles_B_index] ON [dbo].[_UserRoles]([B]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [_PermissionToRole_B_index] ON [dbo].[_PermissionToRole]([B]);

-- AddForeignKey
ALTER TABLE [dbo].[Account] ADD CONSTRAINT [Account_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Session] ADD CONSTRAINT [Session_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[TankLevelUpdate] ADD CONSTRAINT [TankLevelUpdate_tankId_fkey] FOREIGN KEY ([tankId]) REFERENCES [dbo].[Tank]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[Role]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PasswordReset] ADD CONSTRAINT [PasswordReset_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[AuditLog] ADD CONSTRAINT [AuditLog_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_UserRoles] ADD CONSTRAINT [_UserRoles_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[Account]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_UserRoles] ADD CONSTRAINT [_UserRoles_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[Role]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_PermissionToRole] ADD CONSTRAINT [_PermissionToRole_A_fkey] FOREIGN KEY ([A]) REFERENCES [dbo].[Permission]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[_PermissionToRole] ADD CONSTRAINT [_PermissionToRole_B_fkey] FOREIGN KEY ([B]) REFERENCES [dbo].[Role]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
