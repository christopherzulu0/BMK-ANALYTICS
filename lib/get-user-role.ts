import { prisma } from "./prisma"


export async function getUserRole(userEmail: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: userEmail },
        include: { role: true }
      })
 
      if (!user) {
        throw new Error('User not found')
      }
 
      return user.role?.name || 'User'
    } catch (error) {
      console.error('Error fetching user role:', error)
      throw error
    }
  }
