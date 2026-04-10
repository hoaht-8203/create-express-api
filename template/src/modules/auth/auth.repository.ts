import { User } from 'generated/prisma/client'
import { prisma } from '~/config/prisma'

export const AuthRepository = {
  async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.user.create({ data })
  },
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  },
  async findRoleById(id: number) {
    return prisma.role.findUnique({ where: { id } })
  },
  async createRefreshToken(data: { jti: string; tokenHash: string; userId: number; expiresAt: Date }) {
    return prisma.refreshToken.create({ data })
  },
  async findRefreshTokenByJti(jti: string) {
    return prisma.refreshToken.findUnique({ where: { jti } })
  },
  async revokeRefreshTokenByJti(jti: string) {
    return prisma.refreshToken.update({
      where: { jti },
      data: { revoked: true }
    })
  },
  async revokeAllUserRefreshTokens(userId: number) {
    return prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true }
    })
  }
}
