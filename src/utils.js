'use strict'
import { createLogger, format, transports } from 'winston'

const formatLog = format.printf((info) =>
  info.message
    .trim('\n')
    .split('\n')
    .map((line) => `${info.timestamp} ${info.level}: ${line}`)
    .join('\n'))

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.colorize(),
    formatLog
  ),
  transports: [ new transports.Console() ]
})

export const wrapHandler = fn =>
  (req, res, next) => fn(req, res, next).catch(next)
