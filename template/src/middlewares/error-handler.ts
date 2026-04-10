import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { MESSAGE } from '~/config/constants'
import { logger } from '~/utils/logger'
import { errorResponse } from '~/utils/response'

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => ({
      path: issue.path[0],
      message: issue.message
    }))
    logger.warn(`Validation Error [${req.method} ${req.originalUrl}]: ${JSON.stringify(issues)}`)
    return errorResponse(res, issues, 400)
  }

  if (err instanceof Error) {
    logger.error(`App Error [${req.method} ${req.originalUrl}]: ${err.message}`)
    if (err.cause) {
      logger.error(`Caused by: ${err.cause}`)
    }
    return errorResponse(res, err.message, 400)
  }

  logger.error(`Unknown Error [${req.method} ${req.originalUrl}]: ${err}`)
  return errorResponse(res, MESSAGE.SOMETHING_WENT_WRONG, 500)
}
