'use strict'
import express from 'express'
import helmet from 'helmet'
import createError from 'http-errors'
import communicationRequest from './communication_request'
import config from './config'

const app = express()

export const resourceNotFoundHandler = (req, res, next) => next(createError(404))

export const errorHandler = (err, req, res, next) => {
  res.locals.message = err.message
  res.locals.error = config.get('env') === 'development' ? err : {}

  res.status(err.status || 500)
  res.json(res.locals.error)
}

app.use(helmet())
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use('/CommunicationRequest', communicationRequest.apiRouter)
  .use(resourceNotFoundHandler)
  .use(errorHandler)

export default app
