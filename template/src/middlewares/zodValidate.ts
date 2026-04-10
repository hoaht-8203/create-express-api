import type { RequestHandler } from 'express'
import type { ZodSchema } from 'zod'

export const zodValidateBody = (schema: ZodSchema): RequestHandler => {
  return (req, _res, next) => {
    const r = schema.safeParse(req.body)
    if (!r.success) return next(r.error) // để error handler xử lý
    req.body = r.data // optional: replace bằng data đã parse
    next()
  }
}
