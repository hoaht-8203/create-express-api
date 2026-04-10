import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const ACCESS_SECRET = process.env.ACCESS_SECRET || 'fallback_access_secret'
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'fallback_refresh_secret'
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'

export interface TokenPayload {
  id: number
  email: string
  roleId: number
  roleName: string
  jti?: string
}

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'] })
}

export const signRefreshToken = (payload: TokenPayload): { token: string; jti: string } => {
  const jti = uuidv4()
  const token = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    jwtid: jti
  })
  return { token, jti }
}

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload
}

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload
}
