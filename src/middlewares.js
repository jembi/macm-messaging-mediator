'use strict'
import createError from 'http-errors'
import Joi from 'joi'
import { CommunicationRequestSchema } from './fhir.schema'

// TODO: Replace boilerplate code with proper FHIR responses.
export const resourceNotFoundHandler = (req, res, next) => next(createError(404))

export const errorHandler = (err, req, res, next) => {
  // TODO: Replace boilerplate code with proper FHIR responses.
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  res.status(err.status || 500)
  res.json(res.locals.error)
}

export const bindCommunicationRequest = (req, res, next) => {
  const validationResult = Joi.validate(req.body || {}, CommunicationRequestSchema)

  if (validationResult.error === null) {
    req.communicationRequest = req.body
    return next()
  }

  next(createError(400, validationResult.error.details[0].message))
}
