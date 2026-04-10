import bcrypt from 'bcrypt'
import { User } from 'generated/prisma/client'
import { MESSAGE } from '~/config/constants'
import { TokenPayload, signAccessToken, signRefreshToken, verifyRefreshToken } from '~/utils/jwt'
import { AuthRepository } from './auth.repository'
import { AuthSuccessResponseDTO, LoginRequest, RegisterRequest } from './auth.type'

// 7 days in ms
const REFRESH_TOKEN_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000

export const AuthService = {
  async register(request: RegisterRequest): Promise<AuthSuccessResponseDTO & { rawRefreshToken: string }> {
    const isUserExisted = await AuthRepository.findUserByEmail(request.email)
    if (isUserExisted) {
      throw new Error(MESSAGE.USER_ALREADY_EXISTS)
    }

    const userRole = await AuthRepository.findRoleById(2)

    if (!userRole) {
      throw new Error(MESSAGE.ROLE_NOT_FOUND)
    }

    const passwordHash = await bcrypt.hash(request.password, 10)
    const user: User = await AuthRepository.createUser({
      name: request.name,
      email: request.email,
      password: passwordHash,
      roleId: userRole.id
    })

    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: userRole.name
    }

    const { token: refreshToken, jti } = signRefreshToken(tokenPayload)
    const tokenHash = await bcrypt.hash(refreshToken, 10)

    await AuthRepository.createRefreshToken({
      jti,
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_VALIDITY_MS)
    })

    const tokens = {
      accessToken: signAccessToken(tokenPayload)
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        roleName: userRole.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      tokens,
      rawRefreshToken: refreshToken
    }
  },

  async login(request: LoginRequest): Promise<AuthSuccessResponseDTO & { rawRefreshToken: string }> {
    const user = await AuthRepository.findUserByEmail(request.email)
    if (!user) {
      throw new Error(MESSAGE.USER_NOT_FOUND)
    }

    const isPasswordValid = await bcrypt.compare(request.password, user.password)
    if (!isPasswordValid) {
      throw new Error(MESSAGE.INVALID_PASSWORD)
    }

    const userRole = await AuthRepository.findRoleById(user.roleId)
    if (!userRole) {
      throw new Error(MESSAGE.ROLE_NOT_FOUND)
    }

    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: userRole.name
    }

    const { token: refreshToken, jti } = signRefreshToken(tokenPayload)
    const tokenHash = await bcrypt.hash(refreshToken, 10)

    await AuthRepository.createRefreshToken({
      jti,
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_VALIDITY_MS)
    })

    const tokens = {
      accessToken: signAccessToken(tokenPayload)
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        roleName: userRole.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      tokens,
      rawRefreshToken: refreshToken
    }
  },

  async refreshToken(cookieToken: string): Promise<AuthSuccessResponseDTO & { rawRefreshToken: string }> {
    try {
      const decodedPayload = verifyRefreshToken(cookieToken)
      const { jti, email } = decodedPayload

      if (!jti) {
        throw new Error(MESSAGE.UNAUTHORIZED)
      }

      // Fetch user again to ensure they still exist & role hasn't changed maliciously
      const user = await AuthRepository.findUserByEmail(email)
      if (!user) {
        throw new Error(MESSAGE.USER_NOT_FOUND)
      }

      const userRole = await AuthRepository.findRoleById(user.roleId)
      if (!userRole) {
        throw new Error(MESSAGE.ROLE_NOT_FOUND)
      }

      const dbToken = await AuthRepository.findRefreshTokenByJti(jti)
      if (!dbToken) {
        throw new Error(MESSAGE.UNAUTHORIZED)
      }

      // Reuse detection
      if (dbToken.revoked) {
        // Token was already revoked, someone is trying to reuse it!
        // Immediately revoke all of this user's tokens as a security measure
        await AuthRepository.revokeAllUserRefreshTokens(user.id)
        throw new Error(MESSAGE.UNAUTHORIZED)
      }

      // Check hash
      const isHashValid = await bcrypt.compare(cookieToken, dbToken.tokenHash)
      if (!isHashValid) {
        throw new Error(MESSAGE.UNAUTHORIZED)
      }

      // Mark the old token as revoked (rotation)
      await AuthRepository.revokeRefreshTokenByJti(jti)

      // Issue all entirely new tokens
      const tokenPayload: TokenPayload = {
        id: user.id,
        email: user.email,
        roleId: user.roleId,
        roleName: userRole.name
      }

      const { token: newRefreshToken, jti: newJti } = signRefreshToken(tokenPayload)
      const newTokenHash = await bcrypt.hash(newRefreshToken, 10)

      await AuthRepository.createRefreshToken({
        jti: newJti,
        tokenHash: newTokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_VALIDITY_MS)
      })

      const tokens = {
        accessToken: signAccessToken(tokenPayload)
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roleId: user.roleId,
          roleName: userRole.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        tokens,
        rawRefreshToken: newRefreshToken
      }
    } catch (_error) {
      throw new Error(MESSAGE.UNAUTHORIZED, { cause: _error }) // If token expired or malformed
    }
  },

  async logout(cookieToken: string): Promise<void> {
    try {
      if (!cookieToken) return
      const decodedPayload = verifyRefreshToken(cookieToken)
      if (decodedPayload.jti) {
        await AuthRepository.revokeRefreshTokenByJti(decodedPayload.jti)
      }
    } catch {
      // Ignored: maybe token already expired anyway.
    }
  }
}
