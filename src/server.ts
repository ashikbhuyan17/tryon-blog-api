import { errorLogger, logger } from './utilities/logger'
import { bootStrap } from './utilities/bootStrap'
import { Server } from 'http'

process.on('uncaughtException', error => {
  errorLogger.error(error)
  process.exit(1)
})

bootStrap()

process.on('SIGTERM', () => {
  logger.info(`Sigterm is received`)
  // Server is managed inside bootStrap function
})
