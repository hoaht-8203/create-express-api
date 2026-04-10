import chalk from 'chalk'

import 'dotenv/config'
import http from 'http'
import app from './app'
import { env } from './config/env'

const PORT = env.PORT

const server = http.createServer(app)

server.listen(PORT, () => {
  console.log(chalk.green.bold('\n🚀 Server is running!\n'))

  console.log(chalk.cyan('  🌍 Base URL:       ') + chalk.white(`http://localhost:${PORT}`))
  console.log(chalk.cyan('  📚 API Reference:  ') + chalk.white(`http://localhost:${PORT}/reference`))
  console.log(chalk.cyan('  📄 OpenAPI JSON:   ') + chalk.white(`http://localhost:${PORT}/openapi.json`))

  console.log('')
})
