import prisma from "./prisma"

export async function getUserRole(userEmail: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { roleType: true }
      })

      if (!user) {
        throw new Error('User not found')
      }

      return user.roleType
    } catch (error) {
      console.error('Error fetching user role:', error)
      throw error
    }
  }
