import { NextFunction, Request, Response } from 'express'
import { MESSAGE } from '~/config/constants'
import { TokenPayload, verifyAccessToken } from '~/utils/jwt'
import { errorResponse } from '~/utils/response'

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, MESSAGE.UNAUTHORIZED, 401)
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = verifyAccessToken(token) as TokenPayload
    req.user = payload
    next()
  } catch (_error) {
    return errorResponse(res, MESSAGE.UNAUTHORIZED, 401)
  }
}

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.roleName)) {
      return errorResponse(res, MESSAGE.FORBIDDEN, 403)
    }
    next()
  }
}
