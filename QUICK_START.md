# Quick Start Guide

Get up and running with BMK Analytics in 5 minutes.

## Prerequisites Check

Before starting, ensure you have:

- ✅ Node.js 18+ installed
- ✅ pnpm installed (`npm install -g pnpm`)
- ✅ SQL Server running and accessible
- ✅ Git installed

## Step-by-Step Setup

### 1. Clone and Install (2 minutes)

```bash
# Clone the repository
git clone <repository-url>
cd BMK-ANALYTICS

# Install dependencies
pnpm install
```

### 2. Configure Environment (1 minute)

Create a `.env` file in the root directory:

```env
# Database (required)
DATABASE_URL="sqlserver://localhost:1433;database=bmk_analytics;user=sa;password=YourPassword;encrypt=true"

# NextAuth (required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here

# Email (optional - for password reset)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

**Quick NEXTAUTH_SECRET generator**:
```bash
openssl rand -base64 32
```

### 3. Database Setup (1 minute)

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed role types
npx ts-node prisma/roletypes.ts

# Seed permissions and roles
npx ts-node prisma/permissions.ts

# Seed initial data (optional)
pnpm seed

# Seed default tanks (optional)
pnpm tanks
```

### 4. Start Development Server (30 seconds)

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## First Login

### Default Admin Account

After seeding, you can log in with:

- **Email**: `admin@example.com`
- **Password**: `admin123` (change this in production!)

### Create Your Own Account

1. Navigate to `/auth/register`
2. Fill in the registration form
3. An admin will need to approve your account (or register with admin role)

## Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run linter

# Database
npx prisma studio     # Open Prisma Studio (database GUI)
npx prisma migrate dev # Create and apply migration
npx prisma generate   # Generate Prisma client

# Seeding
pnpm seed             # Seed database
pnpm tanks            # Seed tanks
pnpm permissions      # Seed permissions
```

## Project Structure Overview

```
BMK-ANALYTICS/
├── app/              # Pages and API routes
├── components/       # React components
├── lib/              # Utilities and helpers
├── prisma/           # Database schema
└── public/           # Static files
```

## Next Steps

1. **Explore the Application**:
   - Visit `/Root` for admin dashboard
   - Visit `/Pipeline` for pipeline operations
   - Visit `/Reports` for analytics

2. **Read Documentation**:
   - `README.md` - Full project documentation
   - `API_DOCUMENTATION.md` - API reference
   - `DEVELOPMENT_GUIDE.md` - Development guide

3. **Set Up Your IDE**:
   - Install ESLint extension
   - Install Prisma extension
   - Configure TypeScript

## Troubleshooting

### "Cannot connect to database"

- Check `DATABASE_URL` in `.env`
- Verify SQL Server is running
- Check network/firewall settings

### "Prisma client not generated"

```bash
npx prisma generate
```

### "Module not found"

```bash
pnpm install
```

### "Port 3000 already in use"

```bash
# Use a different port
pnpm dev -- -p 3001
```

## Getting Help

- Check the main `README.md` for detailed documentation
- Review `DEVELOPMENT_GUIDE.md` for development patterns
- Check `API_DOCUMENTATION.md` for API reference
- Contact the development team

## What's Next?

- ✅ You're ready to start developing!
- 📖 Read the full documentation in `README.md`
- 🔧 Check out `DEVELOPMENT_GUIDE.md` for coding patterns
- 🚀 Start building features!

---

**Happy Coding!** 🎉

