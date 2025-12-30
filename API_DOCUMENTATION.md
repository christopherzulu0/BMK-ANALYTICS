# API Documentation

Complete API reference for BMK Analytics application.

## Base URL

All API endpoints are prefixed with `/api`:

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via NextAuth session cookies. Include session cookie in requests.

### Authentication Endpoints

#### POST /api/auth/[...nextauth]

NextAuth authentication handler.

**Endpoints**:
- `GET /api/auth/signin`: Sign in page
- `POST /api/auth/signin`: Sign in request
- `GET /api/auth/signout`: Sign out
- `POST /api/auth/signout`: Sign out request
- `GET /api/auth/session`: Get current session
- `POST /api/auth/csrf`: Get CSRF token

**Request Body** (Sign in):
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "user": {
    "id": "user-id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

#### POST /api/auth/register

Register a new user.

**Request Body**:
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "roleId": 1,
  "DepartmentName": "Operations",
  "location": "Lusaka",
  "phone_number": "+260123456789",
  "notes": "Additional notes"
}
```

**Response**:
```json
{
  "id": "user-id",
  "name": "User Name",
  "email": "user@example.com",
  "roleId": 1
}
```

#### POST /api/auth/check-permission

Check if user has a specific permission.

**Request Body**:
```json
{
  "permission": "view_dashboard"
}
```

**Response**:
```json
{
  "hasPermission": true
}
```

## Users

### GET /api/users

Get all users with pagination and filtering.

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for name/email
- `roleId` (optional): Filter by role ID
- `status` (optional): Filter by status (active/inactive)

**Response**:
```json
{
  "users": [
    {
      "id": "user-id",
      "name": "User Name",
      "email": "user@example.com",
      "roleId": 1,
      "role": {
        "id": 1,
        "name": "admin"
      },
      "DepartmentName": "Operations",
      "location": "Lusaka",
      "phone_number": "+260123456789",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

### POST /api/users

Create a new user.

**Request Body**:
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "roleId": 1,
  "DepartmentName": "Operations",
  "location": "Lusaka",
  "phone_number": "+260123456789",
  "notes": "Additional notes"
}
```

**Response**: Created user object

### GET /api/users/[id]

Get user by ID.

**Response**:
```json
{
  "id": "user-id",
  "name": "User Name",
  "email": "user@example.com",
  "role": { ... },
  ...
}
```

### PUT /api/users/[id]

Update user.

**Request Body**:
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "roleId": 2,
  ...
}
```

**Response**: Updated user object

### DELETE /api/users/[id]

Delete user.

**Response**: `{ "success": true }`

### PATCH /api/users/[id]/status

Update user status.

**Request Body**:
```json
{
  "status": "active" // or "inactive"
}
```

### POST /api/users/batch/delete

Batch delete users.

**Request Body**:
```json
{
  "userIds": ["id1", "id2", "id3"]
}
```

### PATCH /api/users/batch/status

Batch update user status.

**Request Body**:
```json
{
  "userIds": ["id1", "id2", "id3"],
  "status": "active"
}
```

## Roles & Permissions

### GET /api/roles

Get all roles.

**Response**:
```json
[
  {
    "id": 1,
    "name": "admin",
    "description": "Administrator role",
    "isSystem": true,
    "permissions": [
      {
        "id": 1,
        "name": "view_dashboard",
        "description": "View dashboard"
      }
    ],
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### POST /api/roles

Create a new role.

**Request Body**:
```json
{
  "name": "manager",
  "description": "Manager role",
  "permissionIds": [1, 2, 3]
}
```

### GET /api/roletypes

Get all role types.

**Response**:
```json
[
  {
    "id": 1,
    "name": "admin",
    "description": "Administrator role type"
  }
]
```

### GET /api/permissions

Get all permissions.

**Response**:
```json
[
  {
    "id": 1,
    "name": "view_dashboard",
    "description": "View dashboard",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /api/permissions/metrics

Get permission metrics.

**Response**:
```json
{
  "totalPermissions": 20,
  "permissionsByRole": {
    "admin": 20,
    "doe": 15,
    "dispatcher": 10
  }
}
```

### GET /api/permissions/analytics

Get permission analytics.

**Response**:
```json
{
  "mostUsedPermissions": [...],
  "leastUsedPermissions": [...],
  "permissionDistribution": {...}
}
```

## Pipeline Data

### GET /api/pipeline-data

Get pipeline data with filtering.

**Query Parameters**:
- `startDate` (optional): Start date (ISO string)
- `endDate` (optional): End date (ISO string)
- `limit` (optional): Limit results

**Response**:
```json
[
  {
    "id": 1,
    "date": "2025-01-01T00:00:00.000Z",
    "openingReading": 1000.5,
    "closingReading": 1500.5,
    "totalFlowRate": 500.0,
    "averageFlowrate": 250.0,
    "averageObsDensity": 0.85,
    "averageTemp": 25.5,
    "obsDen15": 0.86,
    "kgInAirPerLitre": 0.85,
    "metricTons": 425.0,
    "calcAverageTemperature": 25.5,
    "totalObsDensity": 0.85,
    "volumeReductionFactor": 0.98,
    "volume20": 490.0
  }
]
```

### POST /api/pipeline-data

Create pipeline data entry.

**Request Body**:
```json
{
  "date": "2025-01-01T00:00:00.000Z",
  "openingReading": 1000.5,
  "closingReading": 1500.5,
  "totalFlowRate": 500.0,
  "averageFlowrate": 250.0,
  "averageObsDensity": 0.85,
  "averageTemp": 25.5,
  "obsDen15": 0.86,
  "kgInAirPerLitre": 0.85,
  "metricTons": 425.0,
  "calcAverageTemperature": 25.5,
  "totalObsDensity": 0.85,
  "volumeReductionFactor": 0.98,
  "volume20": 490.0
}
```

### GET /api/Root/Pipeline

Get pipeline data for dashboard.

**Response**: Same as GET /api/pipeline-data

### GET /api/Root/Readings

Get readings data for dashboard.

**Response**:
```json
[
  {
    "id": 1,
    "date": "2025-01-01T00:00:00.000Z",
    "lineNo": 1,
    "reading": "R001",
    "flowMeter1": 100.5,
    "flowMeter2": 200.5,
    "flowRate1": 50.25,
    "flowRate2": 100.25,
    "sampleTemp": 25.5,
    "obsDensity": 0.85,
    "kgInAirPerLitre": 0.85,
    "remarks": "Normal operation",
    "check": "OK"
  }
]
```

## Readings

### GET /api/readings

Get readings with filtering.

**Query Parameters**:
- `startDate` (optional): Start date
- `endDate` (optional): End date
- `limit` (optional): Limit results

**Response**: Array of reading objects

### POST /api/readings

Create a reading entry.

**Request Body**:
```json
{
  "date": "2025-01-01T00:00:00.000Z",
  "lineNo": 1,
  "reading": "R001",
  "flowMeter1": 100.5,
  "flowMeter2": 200.5,
  "flowRate1": 50.25,
  "flowRate2": 100.25,
  "sampleTemp": 25.5,
  "obsDensity": 0.85,
  "kgInAirPerLitre": 0.85,
  "remarks": "Normal operation",
  "check": "OK"
}
```

### POST /api/upload-readings

Upload readings via CSV file.

**Request**: Multipart form data with `file` field

**Response**:
```json
{
  "success": true,
  "recordsProcessed": 100,
  "recordsCreated": 95,
  "errors": []
}
```

## Stations & Entries

### GET /api/stations

Get all stations.

**Response**:
```json
[
  {
    "id": "station-id",
    "name": "Station Name",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### POST /api/stations

Create a new station.

**Request Body**:
```json
{
  "name": "Station Name"
}
```

### GET /api/stations/[id]

Get station by ID with entries.

**Response**: Station object with entries array

### PUT /api/stations/[id]

Update station.

**Request Body**:
```json
{
  "name": "Updated Station Name"
}
```

### GET /api/entries

Get daily entries with filtering.

**Query Parameters**:
- `stationId` (optional): Filter by station
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Response**:
```json
[
  {
    "id": "entry-id",
    "stationId": "station-id",
    "station": { ... },
    "date": "2025-01-01",
    "tfarmDischargeM3": 1000.5,
    "kigamboniDischargeM3": 800.5,
    "netDeliveryM3At20C": 1800.0,
    "netDeliveryMT": 1530.0,
    "tanks": [ ... ],
    "remarks": [ ... ],
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### POST /api/entries

Create a daily entry.

**Request Body**:
```json
{
  "stationId": "station-id",
  "date": "2025-01-01",
  "tfarmDischargeM3": 1000.5,
  "kigamboniDischargeM3": 800.5,
  "netDeliveryM3At20C": 1800.0,
  "netDeliveryMT": 1530.0,
  "tanks": [
    {
      "name": "Tank 1",
      "status": "Active",
      "levelMm": 5000,
      "volumeM3": 1000.5,
      "waterCm": null,
      "sg": 0.85,
      "tempC": 25.5,
      "volAt20C": 980.5,
      "mts": 833.4
    }
  ],
  "remarks": [
    {
      "position": 0,
      "text": "Remark text"
    }
  ]
}
```

### GET /api/entries/history

Get entry history.

**Query Parameters**:
- `stationId` (optional): Filter by station
- `limit` (optional): Limit results

**Response**: Array of historical entries

## Tanks

### GET /api/tanks

Get tanks with filtering.

**Query Parameters**:
- `entryId` (optional): Filter by entry
- `status` (optional): Filter by status

**Response**: Array of tank objects

### POST /api/tanks

Create a tank.

**Request Body**:
```json
{
  "entryId": "entry-id",
  "name": "Tank 1",
  "status": "Active",
  "levelMm": 5000,
  "volumeM3": 1000.5,
  "waterCm": null,
  "sg": 0.85,
  "tempC": 25.5,
  "volAt20C": 980.5,
  "mts": 833.4
}
```

### GET /api/tanks/[id]

Get tank by ID.

**Response**: Tank object

### PUT /api/tanks/[id]

Update tank.

**Request Body**: Same as POST, with updated values

### DELETE /api/tanks/[id]

Delete tank.

**Response**: `{ "success": true }`

### GET /api/tankage

Get tankage records.

**Query Parameters**:
- `tankId` (optional): Filter by tank
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Response**: Array of tankage records

### POST /api/tankage

Create tankage record.

**Request Body**:
```json
{
  "tankId": "tank-id",
  "date": "2025-01-01T00:00:00.000Z",
  "level": 65,
  "volume": 1300.0,
  "product": "Crude Oil"
}
```

### GET /api/tank-products

Get tank products.

**Response**: Array of product types

## Shipments

### GET /api/shipments

Get shipments with filtering.

**Query Parameters**:
- `status` (optional): Filter by status
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Response**:
```json
[
  {
    "id": "shipment-id",
    "date": "2025-01-01T00:00:00.000Z",
    "vessel_id": "VESSEL001",
    "estimated_day_of_arrival": "2025-01-15T00:00:00.000Z",
    "supplier": "Supplier Name",
    "cargo_metric_tons": 5000.0,
    "status": "in_transit",
    "progress": 50,
    "destination": "Lusaka",
    "notes": "Additional notes",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### POST /api/shipments

Create a shipment.

**Request Body**:
```json
{
  "vessel_id": "VESSEL001",
  "estimated_day_of_arrival": "2025-01-15T00:00:00.000Z",
  "supplier": "Supplier Name",
  "cargo_metric_tons": 5000.0,
  "status": "in_transit",
  "destination": "Lusaka",
  "notes": "Additional notes"
}
```

### PUT /api/shipments/[id]

Update shipment.

**Request Body**: Same as POST with updated values

### DELETE /api/shipments/[id]

Delete shipment.

**Response**: `{ "success": true }`

## Alerts

### GET /api/alerts

Get alerts.

**Query Parameters**:
- `read` (optional): Filter by read status (true/false)
- `type` (optional): Filter by alert type
- `limit` (optional): Limit results

**Response**:
```json
[
  {
    "id": "alert-id",
    "type": "warning",
    "title": "Alert Title",
    "message": "Alert message",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "read": false,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### POST /api/alerts

Create an alert.

**Request Body**:
```json
{
  "type": "warning",
  "title": "Alert Title",
  "message": "Alert message"
}
```

**Alert Types**: `info`, `warning`, `error`, `success`

### PATCH /api/alerts/[id]

Update alert (typically to mark as read).

**Request Body**:
```json
{
  "read": true
}
```

## Audit Logs

### GET /api/audit-logs

Get audit logs with filtering.

**Query Parameters**:
- `userId` (optional): Filter by user
- `action` (optional): Filter by action
- `resource` (optional): Filter by resource
- `startDate` (optional): Start date
- `endDate` (optional): End date
- `limit` (optional): Limit results

**Response**:
```json
[
  {
    "id": "log-id",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "userId": "user-id",
    "user": { ... },
    "action": "create",
    "resource": "user",
    "details": "Created user: john@example.com",
    "status": "success",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### GET /api/audit-logs/export

Export audit logs to CSV.

**Query Parameters**: Same as GET /api/audit-logs

**Response**: CSV file download

## Remarks

### GET /api/remarks

Get remarks.

**Query Parameters**:
- `entryId` (optional): Filter by entry

**Response**: Array of remark objects

### POST /api/remarks

Create a remark.

**Request Body**:
```json
{
  "entryId": "entry-id",
  "position": 0,
  "text": "Remark text"
}
```

## File Upload

### POST /api/upload-csv

Upload CSV file for data import.

**Request**: Multipart form data with `file` field

**Response**:
```json
{
  "success": true,
  "recordsProcessed": 100,
  "recordsCreated": 95,
  "errors": [
    {
      "row": 5,
      "message": "Invalid data format"
    }
  ]
}
```

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

API endpoints may be rate-limited in production. Check response headers for rate limit information.

## Pagination

Endpoints that support pagination use the following query parameters:
- `page`: Page number (1-indexed)
- `limit`: Items per page

Response includes:
- `total`: Total number of items
- `page`: Current page
- `limit`: Items per page
- `totalPages`: Total number of pages

