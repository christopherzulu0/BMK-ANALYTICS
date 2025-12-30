# Development Guide

Comprehensive guide for developers working on the BMK Analytics project.

## Getting Started

### Initial Setup

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd BMK-ANALYTICS
   pnpm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx ts-node prisma/roletypes.ts
   npx ts-node prisma/permissions.ts
   pnpm seed
   ```

4. **Start Development Server**:
   ```bash
   pnpm dev
   ```

## Development Workflow

### Code Organization

#### Directory Structure

```
app/                    # Next.js App Router
├── api/                # API routes (server-side)
├── [feature]/          # Feature pages (client-side)
└── layout.tsx          # Root layout

components/             # React components
├── ui/                 # Reusable UI components (shadcn/ui)
├── [feature]/          # Feature-specific components
└── ...

lib/                    # Utility libraries
├── auth.ts            # Authentication utilities
├── prisma.ts          # Prisma client
├── api.ts             # API client functions
└── utils.ts           # General utilities

hooks/                  # Custom React hooks
types/                  # TypeScript type definitions
prisma/                 # Database schema and migrations
```

### Adding a New Feature

#### 1. Database Changes

If your feature requires database changes:

```bash
# Edit prisma/schema.prisma
# Add your model(s)

# Create migration
npx prisma migrate dev --name add-feature-name

# Generate Prisma client
npx prisma generate
```

#### 2. API Route

Create API route in `app/api/[feature]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Your logic here
    const data = await prisma.yourModel.findMany();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validation
    // Your logic here
    
    const data = await prisma.yourModel.create({
      data: body
    });
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### 3. Type Definitions

Add types in `types/[feature].ts`:

```typescript
export interface YourFeature {
  id: string;
  name: string;
  // ... other fields
}

export interface CreateYourFeatureDto {
  name: string;
  // ... other fields
}
```

#### 4. API Client Function

Add API client function in `lib/api.ts`:

```typescript
export async function getYourFeatures(): Promise<YourFeature[]> {
  const response = await fetch('/api/your-feature');
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

export async function createYourFeature(data: CreateYourFeatureDto): Promise<YourFeature> {
  const response = await fetch('/api/your-feature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create');
  return response.json();
}
```

#### 5. React Component

Create component in `components/[feature]/your-feature.tsx`:

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getYourFeatures, createYourFeature } from '@/lib/api';
import { Button } from '@/components/ui/button';

export function YourFeatureComponent() {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['your-features'],
    queryFn: getYourFeatures,
  });

  const mutation = useMutation({
    mutationFn: createYourFeature,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['your-features'] });
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {/* Your component JSX */}
    </div>
  );
}
```

#### 6. Page

Create page in `app/[feature]/page.tsx`:

```typescript
import { YourFeatureComponent } from '@/components/[feature]/your-feature';

export default function YourFeaturePage() {
  return <YourFeatureComponent />;
}
```

### Component Patterns

#### Using React Query

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function DataComponent() {
  const queryClient = useQueryClient();

  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
  });

  // Mutate data
  const mutation = useMutation({
    mutationFn: updateData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data'] });
    },
  });

  // Handle loading and error states
  if (isLoading) return <Skeleton />;
  if (error) return <Error message={error.message} />;

  return <div>{/* Render data */}</div>;
}
```

#### Form Handling

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

export function FormComponent() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    // Handle form submission
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### Authentication & Authorization

#### Protecting API Routes

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Option 1: Using requireAuth helper
  const session = await requireAuth('admin');
  
  // Option 2: Manual check
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Check role
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Your logic
}
```

#### Protecting Pages

```typescript
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await requireAuth('admin');
  
  // Your page content
  return <div>Protected Content</div>;
}
```

#### Client-Side Role Checking

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { RoleGuard } from '@/components/RoleGuard';

export function ProtectedComponent() {
  const { data: session } = useSession();
  
  if (session?.user?.role !== 'admin') {
    return <div>Access Denied</div>;
  }
  
  return <div>Admin Content</div>;
}

// Or use RoleGuard component
export function AnotherComponent() {
  return (
    <RoleGuard requiredRole="admin">
      <div>Admin Content</div>
    </RoleGuard>
  );
}
```

### Database Operations

#### Using Prisma

```typescript
import {prisma} from '@/lib/prisma';

// Create
const user = await prisma.user.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    password: hashedPassword,
  },
});

// Read
const user = await prisma.user.findUnique({
  where: { id: 'user-id' },
  include: { role: true },
});

// Update
const user = await prisma.user.update({
  where: { id: 'user-id' },
  data: { name: 'Jane Doe' },
});

// Delete
await prisma.user.delete({
  where: { id: 'user-id' },
});

// Complex queries
const users = await prisma.user.findMany({
  where: {
    role: {
      name: 'admin',
    },
  },
  include: {
    role: true,
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 10,
  skip: 0,
});
```

### Error Handling

#### API Routes

```typescript
export async function GET(request: NextRequest) {
  try {
    // Your logic
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma errors
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Unique constraint violation' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### Client Components

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function DataComponent() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    onError: (error) => {
      console.error('Error fetching data:', error);
      // Show toast notification
    },
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  // Render component
}
```

### Testing

#### Running Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:coverage
```

#### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YourComponent } from './your-component';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Code Style

#### TypeScript

- Use strict TypeScript settings
- Define types for all data structures
- Avoid `any` type
- Use interfaces for object shapes
- Use enums for constants

#### React

- Use functional components
- Use hooks for state management
- Keep components small and focused
- Extract reusable logic to custom hooks
- Use proper prop types

#### Naming Conventions

- Components: PascalCase (`UserProfile.tsx`)
- Functions: camelCase (`getUserData`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- Types/Interfaces: PascalCase (`UserData`)
- Files: kebab-case for pages, PascalCase for components

### Git Workflow

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**:
   - Write code
   - Add tests
   - Update documentation

3. **Commit Changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

4. **Push and Create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

#### Commit Message Format

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Build/tooling changes

### Debugging

#### Server-Side Debugging

```typescript
// Use console.log for debugging
console.log('Debug info:', { data, error });

// Use debugger in development
if (process.env.NODE_ENV === 'development') {
  debugger;
}
```

#### Client-Side Debugging

```typescript
// React DevTools
// Use browser DevTools
// Use React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// In your app
<ReactQueryDevtools initialIsOpen={false} />
```

### Performance Optimization

#### Database Queries

- Use indexes (already defined in schema)
- Use `select` to fetch only needed fields
- Use pagination for large datasets
- Avoid N+1 queries with `include`

#### React Optimization

- Use `React.memo` for expensive components
- Use `useMemo` for expensive calculations
- Use `useCallback` for stable function references
- Lazy load components with `next/dynamic`

#### Next.js Optimization

- Use Image component for images
- Enable static generation where possible
- Use ISR for dynamic content
- Optimize bundle size

### Common Tasks

#### Adding a New Role

1. Update `prisma/schema.prisma` if needed
2. Run migration: `npx prisma migrate dev`
3. Seed role: Update `prisma/permissions.ts`
4. Update `lib/auth.ts` role permissions

#### Adding a New Permission

1. Add permission in `prisma/permissions.ts`
2. Assign to roles as needed
3. Check permission in API routes/components

#### Database Seeding

```typescript
// prisma/seed.ts
import prisma from './lib/prisma';

async function main() {
  // Your seed data
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      // ...
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run: `pnpm seed`

### Troubleshooting

#### Prisma Issues

```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Generate client
npx prisma generate

# Push schema changes (dev only)
npx prisma db push
```

#### Next.js Issues

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
pnpm build
```

#### TypeScript Issues

```bash
# Check types
pnpm type-check

# Restart TypeScript server in IDE
```

## Best Practices

1. **Always validate input** on both client and server
2. **Handle errors gracefully** with user-friendly messages
3. **Use TypeScript** for type safety
4. **Write tests** for critical functionality
5. **Document your code** with comments
6. **Follow existing patterns** in the codebase
7. **Keep components small** and focused
8. **Use environment variables** for configuration
9. **Log errors** for debugging
10. **Optimize database queries** to avoid N+1 problems

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Docs](https://www.radix-ui.com/docs)

