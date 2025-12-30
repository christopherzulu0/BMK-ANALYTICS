# Role Types Implementation

This document explains the implementation of the Role Types model in the BMK-ANALYTICS application.

## Overview

The Role Types model provides a structured way to categorize different types of roles in the system. Each role type (e.g., admin, DOE, dispatcher) has its own characteristics and can be associated with multiple roles.

## Database Schema

The following models have been added or modified:

### RoleType Model (New)

```prisma
model RoleType {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  roles       Role[]
}
```

### Role Model (Updated)

The Role model now has a relationship with the RoleType model:

```prisma
model Role {
  // ... existing fields
  roleType         RoleType?    @relation(fields: [roleTypeId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  roleTypeId       Int?
}
```

### User Model (Updated)

The User model now has a relationship with the RoleType model:

```prisma
model User {
  // ... existing fields
  roleType  String   @default("dispatcher") // Legacy field, kept for backward compatibility
  userRoleType  RoleType?      @relation(fields: [roleTypeId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  roleTypeId    Int?
}
```

## Default Role Types

The system comes with three default role types:

1. **admin** - Administrator role with full system access
2. **DOE** - Department of Energy role with view and reporting capabilities
3. **dispatcher** - Dispatcher role with operational access

## Setup Instructions

To set up the role types system, follow these steps:

1. Run the migration to create the necessary database tables:
   ```
   npx ts-node prisma/migrate.ts
   ```

2. Seed the role types:
   ```
   npx ts-node prisma/roletypes.ts
   ```

3. Seed the permissions and roles:
   ```
   npx ts-node prisma/permissions.ts
   ```

4. Seed the users:
   ```
   npx ts-node prisma/seed.ts
   ```

## Using Role Types in the Application

### Creating a New Role Type

```typescript
const newRoleType = await prisma.roleType.create({
  data: {
    name: 'manager',
    description: 'Manager role with administrative capabilities'
  }
});
```

### Assigning a Role Type to a Role

```typescript
const role = await prisma.role.create({
  data: {
    name: 'Project Manager',
    description: 'Manages specific projects',
    roleTypeId: managerRoleType.id,
    // ... other fields
  }
});
```

### Assigning a Role Type to a User

```typescript
const user = await prisma.user.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    password: hashedPassword,
    roleType: 'manager', // Legacy field
    roleTypeId: managerRoleType.id,
    // ... other fields
  }
});
```

### Querying Users by Role Type

```typescript
const managerUsers = await prisma.user.findMany({
  where: {
    roleTypeId: managerRoleType.id
  },
  include: {
    userRoleType: true
  }
});
```

## API Endpoints

The existing API endpoints for roles and users have been updated to work with the new role types model. No changes to the API calls are necessary, as the endpoints will automatically handle the relationships between roles, role types, and users.
