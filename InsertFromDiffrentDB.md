USE BMK;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    --------------------------------------------------
    -- DISABLE CONSTRAINTS
    --------------------------------------------------
    ALTER TABLE dbo.Tanks NOCHECK CONSTRAINT ALL;
    ALTER TABLE dbo.Remarks NOCHECK CONSTRAINT ALL;

    --------------------------------------------------
    -- 1. STATIONS
    --------------------------------------------------
    INSERT INTO dbo.Stations (id, name, createdAt, updatedAt)
    SELECT id, name, createdAt, updatedAt
    FROM Pipelines.dbo.Stations
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Stations x WHERE x.id = Stations.id
    );

    --------------------------------------------------
    -- 2. DAILY ENTRIES
    --------------------------------------------------
    INSERT INTO dbo.DailyEntries (
        id, stationId, date,
        tfarmDischargeM3, kigamboniDischargeM3,
        netDeliveryM3At20C, netDeliveryMT,
        pumpOverDate, prevVolumeM3, opUllageVolM3,
        createdAt, updatedAt
    )
    SELECT 
        id, stationId, date,
        tfarmDischargeM3, kigamboniDischargeM3,
        netDeliveryM3At20C, netDeliveryMT,
        pumpOverDate, prevVolumeM3, opUllageVolM3,
        createdAt, updatedAt
    FROM Pipelines.dbo.DailyEntries d
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.DailyEntries x WHERE x.id = d.id
    );

    --------------------------------------------------
    -- 3. TANKS
    --------------------------------------------------
    INSERT INTO dbo.Tanks (
        id, entryId, name, status,
        levelMm, volumeM3, waterCm,
        sg, tempC, volAt20C, mts,
        createdAt, updatedAt
    )
    SELECT 
        t.id, t.entryId, t.name, t.status,
        t.levelMm, t.volumeM3, t.waterCm,
        t.sg,
        CAST(t.tempC AS DECIMAL(6,2)),
        t.volAt20C, t.mts,
        t.createdAt, t.updatedAt
    FROM Pipelines.dbo.Tanks t
    WHERE EXISTS (
        SELECT 1 FROM dbo.DailyEntries d WHERE d.id = t.entryId
    );

    --------------------------------------------------
    -- 4. REMARKS
    --------------------------------------------------
    INSERT INTO dbo.Remarks (id, entryId, position, text)
    SELECT r.id, r.entryId, r.position, r.text
    FROM Pipelines.dbo.Remarks r
    WHERE EXISTS (
        SELECT 1 FROM dbo.DailyEntries d WHERE d.id = r.entryId
    );

    --------------------------------------------------
    -- 5. ALERTS (FIXED RESERVED WORDS)
    --------------------------------------------------
    INSERT INTO dbo.Alert (
        id, type, title, message,
        station,
        [timestamp], [read],
        createdAt, updatedAt
    )
    SELECT 
        a.id, a.type, a.title, a.message,
        NULL,
        a.[timestamp], a.[read],
        a.createdAt, a.updatedAt
    FROM Pipelines.dbo.Alert a
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Alert x WHERE x.id = a.id
    );

    --------------------------------------------------
    -- 6. ROLE (IDENTITY FIX)
    --------------------------------------------------
    SET IDENTITY_INSERT dbo.Role ON;

    INSERT INTO dbo.Role (
        id, name, description, isSystem,
        createdAt, updatedAt, timeRestrictions
    )
    SELECT 
        id, name, description, isSystem,
        createdAt, updatedAt, timeRestrictions
    FROM Pipelines.dbo.Role r
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Role x WHERE x.id = r.id
    );

    SET IDENTITY_INSERT dbo.Role OFF;

    --------------------------------------------------
    -- 7. PERMISSION (IDENTITY FIX)
    --------------------------------------------------
    SET IDENTITY_INSERT dbo.Permission ON;

    INSERT INTO dbo.Permission (
        id, name, description, createdAt, updatedAt
    )
    SELECT 
        id, name, description, createdAt, updatedAt
    FROM Pipelines.dbo.Permission p
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Permission x WHERE x.id = p.id
    );

    SET IDENTITY_INSERT dbo.Permission OFF;

    --------------------------------------------------
    -- 8. SAFE TABLES
    --------------------------------------------------
    INSERT INTO dbo.[User]
    SELECT * FROM Pipelines.dbo.[User];

    INSERT INTO dbo.Account
    SELECT * FROM Pipelines.dbo.Account;

    INSERT INTO dbo.Session
    SELECT * FROM Pipelines.dbo.Session;

    INSERT INTO dbo.AuditLog
    SELECT * FROM Pipelines.dbo.AuditLog;

    INSERT INTO dbo.Shipment
    SELECT * FROM Pipelines.dbo.Shipment;

    INSERT INTO dbo.InventoryTransaction
    SELECT * FROM Pipelines.dbo.InventoryTransaction;

    INSERT INTO dbo.Maintenance
    SELECT * FROM Pipelines.dbo.Maintenance;

    INSERT INTO dbo.Setting
    SELECT * FROM Pipelines.dbo.Setting;

    INSERT INTO dbo.PasswordReset
    SELECT * FROM Pipelines.dbo.PasswordReset;

    --------------------------------------------------
    -- ENABLE CONSTRAINTS
    --------------------------------------------------
    ALTER TABLE dbo.Tanks CHECK CONSTRAINT ALL;
    ALTER TABLE dbo.Remarks CHECK CONSTRAINT ALL;

    --------------------------------------------------
    -- COMMIT
    --------------------------------------------------
    COMMIT TRANSACTION;

    PRINT '✅ MIGRATION SUCCESSFUL';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;

    PRINT '❌ MIGRATION FAILED';
    PRINT ERROR_MESSAGE();
END CATCH;