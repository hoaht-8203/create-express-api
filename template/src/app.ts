import { apiReference } from '@scalar/express-api-reference'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import fs from 'fs'
import morgan from 'morgan'
import path from 'path'
import { RegisterRoutes } from './generated/routes'
import { errorHandler } from './middlewares/error-handler'
import { logger } from './utils/logger'

const app = express()

// Integrate Morgan for HTTP request logging
const morganMiddleware = morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: { write: (message) => logger.http(message.trim()) }
})
app.use(morganMiddleware)

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true
  })
)
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

RegisterRoutes(app)

app.get('/openapi.json', (_req, res) => {
  const swaggerPath = path.join(__dirname, 'generated', 'swagger.json')
  if (fs.existsSync(swaggerPath)) {
    res.sendFile(swaggerPath)
  } else {
    res.status(404).json({ message: 'Swagger spec not found' })
  }
})

app.use(
  '/reference',
  apiReference({
    url: '/openapi.json'
  })
)

app.use(errorHandler)

export default app
