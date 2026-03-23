USE BMK;
GO

--------------------------------------------------
-- SUPPLIERS (Parent Table)
--------------------------------------------------
INSERT INTO dbo.Supplier (
    id, 
    name, 
    email, 
    phone, 
    location, 
    rating, 
    activeShipments, 
    reliability, 
    createdAt, 
    updatedAt
)
SELECT 
    s.id, 
    s.name, 
    s.email, 
    s.phone, 
    s.location, 
    s.rating, 
    s.activeShipments, 
    s.reliability, 
    s.createdAt, 
    s.updatedAt
FROM Pipelines.dbo.Supplier s
WHERE NOT EXISTS (
    SELECT 1 
    FROM dbo.Supplier x 
    WHERE x.id = s.id
);
GO