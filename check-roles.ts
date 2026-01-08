import { prisma } from "./lib/prisma";

async function main() {
  try {
    // Check if roles exist
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const doeRole = await prisma.role.findUnique({ where: { name: 'DOE' } });
    const dispatcherRole = await prisma.role.findUnique({ where: { name: 'dispatcher' } });

    console.log('Admin role exists:', !!adminRole);
    console.log('DOE role exists:', !!doeRole);
    console.log('Dispatcher role exists:', !!dispatcherRole);

    // Check if role types exist
    const adminRoleType = await prisma.roleType.findUnique({ where: { name: 'admin' } });
    const doeRoleType = await prisma.roleType.findUnique({ where: { name: 'DOE' } });
    const dispatcherRoleType = await prisma.roleType.findUnique({ where: { name: 'dispatcher' } });

    console.log('Admin role type exists:', !!adminRoleType);
    console.log('DOE role type exists:', !!doeRoleType);
    console.log('Dispatcher role type exists:', !!dispatcherRoleType);

  } catch (error) {
    console.error('Error checking roles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
