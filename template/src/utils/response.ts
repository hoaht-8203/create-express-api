import { Response } from 'express'

export const successResponse = <T>(res: Response, data: T, message = '', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  })
}

export const errorResponse = <T>(res: Response, error: T, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error
  })
}
