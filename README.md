# BMK Analytics - Tazama Pipeline Limited

A comprehensive analytics and management system for pipeline operations, tank management, shipment tracking, and daily operations reporting.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Authentication & Authorization](#authentication--authorization)
- [API Endpoints](#api-endpoints)
- [Key Modules](#key-modules)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Overview

BMK Analytics is a Next.js-based web application designed for Tazama Pipeline Limited to manage and analyze pipeline operations, tank inventory, shipments, and daily operational data. The system provides role-based access control, real-time analytics, and comprehensive reporting capabilities.

### Main Purpose

The application serves as a centralized platform for:
- **Pipeline Operations**: Track daily pipeline readings, flow rates, density measurements, and metric tons
- **Tank Management**: Monitor tank levels, volumes, and inventory across multiple stations
- **Shipment Tracking**: Manage vessel shipments, track progress, and monitor delivery status
- **Daily Entries**: Record and manage daily operational data for different stations
- **Analytics & Reporting**: Generate reports, visualize data trends, and analyze operational metrics
- **User Management**: Administer users, roles, and permissions with granular access control

## Features

### Core Functionality

- ✅ **Pipeline Data Management**: Record and track pipeline readings, flow rates, and density measurements
- ✅ **Tank Inventory System**: Monitor tank levels, volumes, and status across multiple stations
- ✅ **Shipment Tracking**: Track vessel shipments from arrival to delivery with status updates
- ✅ **Daily Entries**: Create and manage daily operational reports for stations
- ✅ **Readings Input**: Manual and CSV upload of operational readings
- ✅ **Reports & Analytics**: Comprehensive reporting with charts and data visualization
- ✅ **User Management**: Full CRUD operations for users with role assignment
- ✅ **Role-Based Access Control (RBAC)**: Granular permissions system with role types
- ✅ **Alerts System**: System-wide alerts and notifications
- ✅ **Audit Logging**: Track all user actions and system changes
- ✅ **Password Reset**: Email-based password reset functionality
- ✅ **Dark Mode**: Theme switching support

### User Roles

The system supports three main role types:

1. **Admin**: Full system access including user management, settings, and all operational features
2. **DOE (Department of Energy)**: View and reporting capabilities with operational access
3. **Dispatcher**: Operational access for daily tasks and data entry

## Technology Stack

### Frontend
- **Next.js 15.4.6**: React framework with App Router
- **React 19.1.1**: UI library
- **TypeScript 5**: Type-safe development
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Recharts 2.12.7**: Data visualization library
- **Framer Motion 11.11.2**: Animation library
- **TanStack Query 5.83.0**: Data fetching and state management
- **Next Themes 0.4.6**: Theme management

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **NextAuth 4.24.8**: Authentication and session management
- **Prisma 6.12.0**: ORM for database operations
- **SQL Server**: Database (via Prisma)

### Additional Libraries
- **bcryptjs**: Password hashing
- **nodemailer**: Email functionality
- **axios**: HTTP client
- **csv-parse**: CSV file parsing
- **xlsx**: Excel file handling
- **date-fns**: Date manipulation
- **zod**: Schema validation

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.x or higher
- **pnpm**: Package manager (recommended) or npm
- **SQL Server**: Database server (local or remote)
- **Git**: Version control

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd BMK-ANALYTICS
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables** (see [Configuration](#configuration))

4. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

5. **Run database migrations**:
   ```bash
   npx prisma migrate dev
   ```

## Configuration

Create a `.env` file in the root directory with the following variables:

### Required Environment Variables

```env
# Database
DATABASE_URL="sqlserver://server:port;database=dbname;user=username;password=password;encrypt=true"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Email Configuration (for password reset)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### Email Configuration

#### For Gmail:
1. Enable 2-step verification for your Google account
2. Create an app password at: https://myaccount.google.com/apppasswords
3. Use the app password (not your regular password) in `EMAIL_SERVER_PASSWORD`

#### For Outlook/Office 365:
```env
EMAIL_SERVER_HOST=smtp.office365.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@outlook.com
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
```

## Database Setup

### Initial Setup

1. **Create the database schema**:
   ```bash
   npx prisma migrate dev
   ```

2. **Seed role types**:
   ```bash
   npx ts-node prisma/roletypes.ts
   ```

3. **Seed permissions and roles**:
   ```bash
   npx ts-node prisma/permissions.ts
   ```

4. **Seed initial data** (optional):
   ```bash
   pnpm seed
   ```

5. **Seed default tanks** (optional):
   ```bash
   pnpm tanks
   # or
   npx ts-node prisma/migrate-tanks.ts
   ```

### Database Schema

The application uses the following main models:

- **User**: User accounts with role assignments
- **Role**: Role definitions with permissions
- **Permission**: Granular permission definitions
- **Station**: Physical locations/depots
- **DailyEntry**: Daily reports per station
- **Tank**: Tank data within daily entries
- **Remark**: Ordered remarks attached to entries
- **PipelineData**: Pipeline operational data
- **ReadingLines**: Individual reading line items
- **Shipment**: Vessel shipment tracking
- **Alert**: System alerts and notifications
- **AuditLog**: User action tracking
- **Tankage**: Tank inventory records

See `prisma/schema.prisma` for the complete schema definition.

## Running the Application

### Development Mode

```bash
pnpm dev
# or
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
pnpm build
pnpm start
```

### Available Scripts

- `pnpm dev`: Start development server with Turbopack
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run ESLint
- `pnpm seed`: Seed database with initial data
- `pnpm tanks`: Seed default tanks
- `pnpm permissions`: Seed permissions and roles

## Project Structure

```
BMK-ANALYTICS/
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── entries/         # Daily entries API
│   │   ├── pipeline-data/   # Pipeline data API
│   │   ├── readings/        # Readings API
│   │   ├── shipments/       # Shipment tracking API
│   │   ├── tanks/           # Tank management API
│   │   ├── users/           # User management API
│   │   └── ...
│   ├── auth/                # Authentication pages
│   ├── Dispatch/            # Dispatch module
│   ├── LandingPage/         # Landing page
│   ├── Pipeline/            # Pipeline operations
│   ├── Reports/             # Reports and analytics
│   ├── Root/                # Admin dashboard
│   ├── Tanks/               # Tank management
│   └── ...
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   ├── permissions/         # Permission management components
│   └── ...
├── hooks/                   # Custom React hooks
├── lib/                     # Utility libraries
│   ├── auth.ts             # Authentication utilities
│   ├── prisma.ts           # Prisma client
│   ├── api.ts              # API client
│   └── utils.ts            # General utilities
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Migration files
│   ├── seed.ts             # Seed script
│   └── ...
├── types/                   # TypeScript type definitions
├── utils/                   # Utility functions
├── public/                  # Static assets
├── middleware.ts            # Next.js middleware
└── package.json
```

## Authentication & Authorization

### Authentication

The application uses **NextAuth.js** with credentials provider for authentication. Users can:

- Sign in with email and password
- Reset password via email
- Register new accounts (if enabled)

### Authorization

The system implements role-based access control (RBAC) with three main roles:

#### Role Hierarchy

1. **Admin**: Full access to all features
   - User management
   - System settings
   - All operational features
   - Reports and analytics

2. **DOE**: View and operational access
   - View dashboard
   - View reports
   - Manage shipments
   - Manage tanks
   - Dispatch operations

3. **Dispatcher**: Operational access only
   - View dashboard
   - View reports
   - Dispatch operations
   - No user/tank/shipment management

### Permission System

The application includes a granular permission system where:
- Roles can have multiple permissions
- Permissions define specific actions (e.g., `view_dashboard`, `manage_users`)
- Users are assigned roles, which grant them permissions

### Protected Routes

Routes are protected via:
- **Middleware**: Checks authentication for all routes except public paths
- **Role Guards**: Component-level role checking
- **API Route Protection**: Server-side permission validation

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]`: NextAuth authentication
- `POST /api/auth/register`: User registration
- `POST /api/auth/check-permission`: Permission verification

### Users
- `GET /api/users`: List all users
- `POST /api/users`: Create user
- `GET /api/users/[id]`: Get user by ID
- `PUT /api/users/[id]`: Update user
- `DELETE /api/users/[id]`: Delete user
- `PATCH /api/users/[id]/status`: Update user status
- `POST /api/users/batch/delete`: Batch delete users
- `PATCH /api/users/batch/status`: Batch update user status

### Roles & Permissions
- `GET /api/roles`: List all roles
- `POST /api/roles`: Create role
- `GET /api/roletypes`: List role types
- `GET /api/permissions`: List permissions
- `GET /api/permissions/metrics`: Permission metrics
- `GET /api/permissions/analytics`: Permission analytics

### Pipeline Data
- `GET /api/pipeline-data`: Get pipeline data
- `POST /api/pipeline-data`: Create pipeline data entry
- `GET /api/Root/Pipeline`: Get pipeline data for dashboard
- `GET /api/Root/Readings`: Get readings data

### Readings
- `GET /api/readings`: Get readings
- `POST /api/readings`: Create reading
- `POST /api/upload-readings`: Upload readings via CSV

### Stations & Entries
- `GET /api/stations`: List stations
- `POST /api/stations`: Create station
- `GET /api/stations/[id]`: Get station by ID
- `PUT /api/stations/[id]`: Update station
- `GET /api/entries`: Get daily entries
- `POST /api/entries`: Create daily entry
- `GET /api/entries/history`: Get entry history

### Tanks
- `GET /api/tanks`: List tanks
- `POST /api/tanks`: Create tank
- `GET /api/tanks/[id]`: Get tank by ID
- `PUT /api/tanks/[id]`: Update tank
- `DELETE /api/tanks/[id]`: Delete tank
- `GET /api/tankage`: Get tankage records
- `POST /api/tankage`: Create tankage record
- `GET /api/tank-products`: Get tank products

### Shipments
- `GET /api/shipments`: List shipments
- `POST /api/shipments`: Create shipment
- `PUT /api/shipments/[id]`: Update shipment
- `DELETE /api/shipments/[id]`: Delete shipment

### Alerts
- `GET /api/alerts`: Get alerts
- `POST /api/alerts`: Create alert
- `PATCH /api/alerts/[id]`: Update alert (mark as read)

### Audit Logs
- `GET /api/audit-logs`: Get audit logs
- `GET /api/audit-logs/export`: Export audit logs

### Remarks
- `GET /api/remarks`: Get remarks
- `POST /api/remarks`: Create remark

### File Upload
- `POST /api/upload-csv`: Upload CSV file

## Key Modules

### 1. Pipeline Operations

**Location**: `app/Pipeline/`, `components/pipeline-data.tsx`

Manages daily pipeline operations including:
- Flow meter readings
- Flow rate calculations
- Density measurements
- Temperature tracking
- Metric tons calculations

### 2. Tank Management

**Location**: `app/Tanks/`, `app/Dispatch/tankage/`, `components/tank-management.tsx`

Features:
- Tank level monitoring
- Volume calculations
- Tank status tracking (Active/Rehabilitation)
- Tank history
- Tank visualization

### 3. Shipment Tracking

**Location**: `app/Dispatch/shipments/`, `components/shipment-tracking.tsx`

Capabilities:
- Vessel tracking
- Estimated arrival dates
- Cargo metric tons
- Status updates
- Progress tracking
- Shipment map visualization

### 4. Daily Entries

**Location**: `app/Dispatch/`, `app/api/entries/`

System for recording daily operational data:
- Station-based entries
- Tank data per entry
- Remarks and notes
- Summary metrics (discharge, delivery, etc.)

### 5. Reports & Analytics

**Location**: `app/Reports/`

Comprehensive reporting system:
- Flow rate graphs
- Metric tons reports
- Reading line analysis
- Analytics charts
- Data export capabilities

### 6. User Management

**Location**: `app/admin/`, `components/user-management.tsx`

Admin features:
- User CRUD operations
- Role assignment
- Status management (active/inactive)
- Batch operations
- User search and filtering

### 7. Permissions Management

**Location**: `app/Permissions/`, `components/permissions/`

Permission system:
- Role management
- Permission assignment
- Role type configuration
- Permission analytics

### 8. Alerts System

**Location**: `components/alerts-management.tsx`, `components/alerts-panel.tsx`

Alert features:
- System-wide alerts
- Alert types (info, warning, error, success)
- Read/unread status
- Alert management

## Development

### Code Style

- TypeScript strict mode enabled
- ESLint for code linting
- Prettier (if configured) for code formatting

### Adding New Features

1. **Create API Route**: Add route in `app/api/[feature]/route.ts`
2. **Create Component**: Add component in `components/`
3. **Add Page**: Create page in `app/[feature]/page.tsx`
4. **Update Types**: Add types in `types/` if needed
5. **Update Schema**: Modify `prisma/schema.prisma` if database changes needed
6. **Run Migration**: `npx prisma migrate dev`

### Database Migrations

1. **Modify Schema**: Update `prisma/schema.prisma`
2. **Create Migration**: `npx prisma migrate dev --name migration-name`
3. **Apply Migration**: Migrations are applied automatically in dev mode
4. **Generate Client**: `npx prisma generate` (runs automatically on install)

### Testing

Currently, the project doesn't include automated tests. Consider adding:
- Unit tests with Jest/Vitest
- Integration tests for API routes
- E2E tests with Playwright/Cypress

## Deployment

### Environment Setup

1. Set all required environment variables in production
2. Ensure database is accessible from production server
3. Configure email server for password reset functionality

### Build Process

```bash
# Install dependencies
pnpm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
pnpm build

# Start production server
pnpm start
```

### Production Considerations

- Use environment-specific `.env` files
- Enable HTTPS
- Configure proper CORS settings
- Set up database connection pooling
- Configure email service (SMTP)
- Set up monitoring and logging
- Enable rate limiting for API routes
- Configure backup strategy for database

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .
RUN npx prisma generate
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

## Troubleshooting

### Common Issues

#### Database Connection Errors

**Problem**: Cannot connect to SQL Server

**Solutions**:
- Verify `DATABASE_URL` in `.env` is correct
- Check SQL Server is running and accessible
- Verify network connectivity
- Check firewall settings
- Ensure SQL Server authentication is enabled

#### Authentication Issues

**Problem**: Users cannot sign in

**Solutions**:
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Ensure user exists in database
- Verify password hashing (bcrypt)
- Check session configuration

#### Email Not Sending

**Problem**: Password reset emails not received

**Solutions**:
- Verify email configuration in `.env`
- For Gmail, use app password (not regular password)
- Check SMTP server settings
- Verify firewall allows SMTP connections
- Check console logs for error messages
- See [Password Reset Documentation](#password-reset-functionality) below

#### Prisma Client Errors

**Problem**: Prisma client not generated

**Solutions**:
```bash
npx prisma generate
```

#### Migration Errors

**Problem**: Database migrations fail

**Solutions**:
- Check database connection
- Verify schema syntax
- Check for conflicting migrations
- Review migration SQL files
- Ensure database user has proper permissions

### Password Reset Functionality

See the existing `README.md` section on password reset for detailed setup and troubleshooting.

**Quick Setup**:
1. Configure email settings in `.env`
2. For Gmail: Enable 2FA and create app password
3. Restart application
4. Test password reset flow

**Console Fallback**: If email is not configured, reset links are logged to console for development.

### Performance Optimization

- Use database indexes (already configured in schema)
- Implement pagination for large data sets
- Use React Query caching effectively
- Optimize images and assets
- Enable Next.js production optimizations

## Additional Resources

### Documentation Files

- `TANK_MIGRATION_README.md`: Tank migration and seeding guide
- `prisma/ROLE_TYPES_README.md`: Role types implementation guide
- `README.md`: Password reset functionality guide

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Submit a pull request

## License

[Specify your license here]

## Support

For issues and questions:
- Check existing documentation
- Review troubleshooting section
- Contact the development team

---

**Version**: 0.1.0  
**Last Updated**: 2025  
**Maintained by**: Tazama Pipeline Limited Development Team


#Docker
1. docker build -t pipeline-data .
2. docker-compose up -d --build