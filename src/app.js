'use strict'
import express from 'express'
import helmet from 'helmet'
import * as middlewares from './middlewares'

const app = express()

app.use(helmet())
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(middlewares.resourceNotFoundHandler)
  .use(middlewares.errorHandler)

export default app
